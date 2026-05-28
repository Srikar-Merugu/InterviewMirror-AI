import { Request, Response, NextFunction } from "express";
import { prisma } from "@interviewmirror/database";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";
import { logger } from "@interviewmirror/logger";
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
        },
        create: {
          userId: dbUser.id,
          tier: tier as any,
          stripeCustomerId: `sub_mock_customer_${dbUser.id.slice(0, 8)}`,
          stripeSubscriptionId: `sub_mock_subscription_${dbUser.id.slice(0, 8)}`,
          currentPeriodEnd,
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

      res.status(200).json({
        success: true,
        message: `Plan upgraded successfully in sandbox mode to: ${tier}`,
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
            },
            create: {
              userId,
              tier: tier as any,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              currentPeriodEnd,
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
}
