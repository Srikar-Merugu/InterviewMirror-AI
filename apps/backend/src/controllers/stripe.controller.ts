import { Request, Response, NextFunction } from "express";
import { prisma } from "@interviewmirror/database";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";
import { logger } from "@interviewmirror/logger";
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "../utils/auth";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export class StripeController {
  // Initiates Stripe checkout or simulated sandbox billing session
  public static async createCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { tier } = req.body;
      const userPayload = req.user;

      if (!userPayload) {
        throw new BadRequestError("User is not authenticated");
      }

      if (!tier || !["PRO", "ENTERPRISE"].includes(tier)) {
        throw new BadRequestError("Invalid or missing subscription tier requested");
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userPayload.id },
      });

      if (!dbUser) {
        throw new NotFoundError("Synced database user not found");
      }

      // Check if Stripe is configured
      if (stripe) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const priceIdMap: Record<string, string> = {
          PRO: process.env.STRIPE_PRO_PRICE_ID || "price_dummy_pro",
          ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_dummy_enterprise",
        };

        const priceId = priceIdMap[tier];
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${frontendUrl}/dashboard/home?billing_success=true&tier=${tier}`,
          cancel_url: `${frontendUrl}/pricing?billing_cancelled=true`,
          customer_email: dbUser.email,
          metadata: {
            userId: dbUser.id,
            tier,
          },
        });

        res.status(200).json({
          success: true,
          mode: "stripe",
          url: session.url,
        });
        return;
      }

      // If Stripe keys are missing, return a high-fidelity simulated sandbox checkout session
      logger.info(`Stripe secret key missing in backend. Initiating sandbox payment simulation for ${tier}...`);
      res.status(200).json({
        success: true,
        mode: "sandbox",
        message: "Stripe credentials missing. Initializing premium simulated sandbox checkout modal.",
        userId: dbUser.id,
        tier,
      });
    } catch (error) {
      next(error);
    }
  }

  // Instantly upgrades subscription in database (sandbox mode trigger)
  public static async executeSandboxUpgrade(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { tier } = req.body;
      const userPayload = req.user;

      if (!userPayload) {
        throw new BadRequestError("User is not authenticated");
      }

      if (!tier || !["FREE", "PRO", "ENTERPRISE"].includes(tier)) {
        throw new BadRequestError("Invalid or missing subscription tier requested");
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userPayload.id },
      });

      if (!dbUser) {
        throw new NotFoundError("Synced database user not found");
      }

      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      await prisma.subscription.upsert({
        where: { userId: dbUser.id },
        update: {
          tier: tier as any,
          stripeCustomerId: `sub_mock_customer_${dbUser.id.slice(0, 8)}`,
          stripeSubscriptionId: `sub_mock_subscription_${dbUser.id.slice(0, 8)}`,
          currentPeriodEnd,
          lastResetAt: new Date(),
        },
        create: {
          userId: dbUser.id,
          tier: tier as any,
          stripeCustomerId: `sub_mock_customer_${dbUser.id.slice(0, 8)}`,
          stripeSubscriptionId: `sub_mock_subscription_${dbUser.id.slice(0, 8)}`,
          currentPeriodEnd,
          lastResetAt: new Date(),
        },
      });

      // Log billing history
      const priceMap: Record<string, number> = {
        FREE: 0,
        PRO: 19,
        ENTERPRISE: 49,
      };

      await prisma.billingHistory.create({
        data: {
          userId: dbUser.id,
          amount: priceMap[tier] || 0,
          tier: tier as any,
          stripeInvoiceId: `inv_mock_${dbUser.id.slice(0, 8)}`,
          status: "PAID",
        },
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId: dbUser.id,
          action: `SUBSCRIPTION_UPGRADED_SANDBOX_${tier}`,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      // Generate updated cookies
      const accessToken = generateAccessToken({
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        tier: tier,
      });
      const refreshToken = generateRefreshToken({ id: dbUser.id });
      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        message: `Plan upgraded successfully in sandbox mode to: ${tier}`,
        accessToken,
        refreshToken,
        data: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          tier: tier,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Real Stripe webhook handler
  public static async handleStripeWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

      if (!stripe || !sig || !webhookSecret) {
        res.status(400).send("Webhook configurations missing or invalid.");
        return;
      }

      let event: any;

      try {
        event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig, webhookSecret);
      } catch (err: any) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      logger.info(`Received Stripe webhook event: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          const currentPeriodEnd = new Date();
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

          await prisma.subscription.upsert({
            where: { userId },
            update: {
              tier: tier as any,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              currentPeriodEnd,
              lastResetAt: new Date(),
            },
            create: {
              userId,
              tier: tier as any,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              currentPeriodEnd,
              lastResetAt: new Date(),
            },
          });

          // Log billing history
          const priceMap: Record<string, number> = {
            FREE: 0,
            PRO: 19,
            ENTERPRISE: 49,
          };

          await prisma.billingHistory.create({
            data: {
              userId,
              amount: priceMap[tier] || 0,
              tier: tier as any,
              stripeInvoiceId: session.invoice as string || `inv_stripe_${userId.slice(0, 8)}`,
              status: "PAID",
            },
          });

          await prisma.auditLog.create({
            data: {
              userId,
              action: `STRIPE_CHECKOUT_COMPLETED_${tier}`,
            },
          });

          logger.info(`Successfully processed Stripe checkout session complete for user: ${userId} to ${tier}`);
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // Utility: checks and resets user monthly subscription usage
  public static async checkAndResetMonthlyUsage(userId: string): Promise<void> {
    try {
      const sub = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!sub) return;

      const now = new Date();
      if (!sub.lastResetAt) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastResetAt: now },
        });
        return;
      }

      const lastReset = new Date(sub.lastResetAt);
      const nowMonth = now.getUTCMonth();
      const nowYear = now.getUTCFullYear();
      const lastMonth = lastReset.getUTCMonth();
      const lastYear = lastReset.getUTCFullYear();

      if (nowMonth !== lastMonth || nowYear !== lastYear) {
        logger.info(`Monthly boundary detected for user ${userId}. Resetting mock interview usage count.`);
        
        // Count interviews completed in that historical month
        const startOfLastMonth = new Date(Date.UTC(lastYear, lastMonth, 1));
        const endOfLastMonth = new Date(Date.UTC(lastYear, lastMonth + 1, 0, 23, 59, 59, 999));

        const interviewsUsed = await prisma.interviewSession.count({
          where: {
            userId,
            createdAt: {
              gte: startOfLastMonth,
              lte: endOfLastMonth,
            },
          },
        });

        // Save tracking log
        await prisma.usageTracking.upsert({
          where: {
            userId_month_year: {
              userId,
              month: lastMonth + 1,
              year: lastYear,
            },
          },
          update: {
            interviewsUsed,
            resetAt: now,
          },
          create: {
            userId,
            month: lastMonth + 1,
            year: lastYear,
            interviewsUsed,
            resetAt: now,
          },
        });

        // Reset sub boundary
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastResetAt: now },
        });
      }
    } catch (err: any) {
      logger.error(`Error in checkAndResetMonthlyUsage: ${err.message}`);
    }
  }
}
