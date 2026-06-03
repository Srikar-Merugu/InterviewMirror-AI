import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "@interviewmirror/database";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { BadRequestError, NotFoundError } from "../middlewares/error.middleware";
import { logger } from "@interviewmirror/logger";
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "../utils/auth";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";
const CASHFREE_ENV = process.env.CASHFREE_ENV || "SANDBOX";

const CASHFREE_BASE_URL = CASHFREE_ENV === "PRODUCTION"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

const API_VERSION = "2023-08-01";
const PLAN_PRICES: Record<string, number> = {
  PRO: 1999,
  ENTERPRISE: 4999,
};

interface CashfreeApiResponse {
  cf_order_id?: string;
  order_id?: string;
  order_status?: string;
  payment_session_id?: string;
  payment_link?: string;
  order_amount?: number;
  order_currency?: string;
  customer_details?: { customer_phone?: string };
  order_expiry_time?: string;
  payment_methods?: string[];
}

async function cashfreeApiRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<CashfreeApiResponse> {
  const url = `${CASHFREE_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "x-api-id": CASHFREE_APP_ID,
    "x-api-secret": CASHFREE_SECRET_KEY,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    logger.error(`Cashfree API error [${res.status}]: ${errorBody}`);
    throw new Error(`Cashfree API returned ${res.status}: ${errorBody}`);
  }

  return res.json();
}

export class CashfreeController {

  public static async createOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userPayload = req.user;
      if (!userPayload) throw new BadRequestError("User is not authenticated");

      const { tier, phone } = req.body;
      if (!tier || !["PRO", "ENTERPRISE"].includes(tier)) {
        throw new BadRequestError("Invalid or missing subscription tier");
      }

      const dbUser = await prisma.user.findUnique({ where: { id: userPayload.id } });
      if (!dbUser) throw new NotFoundError("User not found");

      const orderAmount = PLAN_PRICES[tier];
      if (!orderAmount) throw new BadRequestError("Invalid plan tier");

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const orderId = `CF_${dbUser.id.slice(-12)}_${Date.now()}`;

      const orderPayload: Record<string, unknown> = {
        order_id: orderId,
        order_amount: orderAmount / 100,
        order_currency: "INR",
        customer_details: {
          customer_id: dbUser.id,
          customer_name: dbUser.name || "Customer",
          customer_email: dbUser.email,
          customer_phone: phone || "9999999999",
        },
        order_meta: {
          return_url: `${frontendUrl}/api/cashfree/return?order_id={order_id}&tier=${tier}`,
          notify_url: `${process.env.BACKEND_URL || "https://interview-mirror-ai-backend.vercel.app"}/api/v1/subscription/cashfree/webhook`,
        },
        order_tags: {
          userId: dbUser.id,
          tier,
        },
      };

      const cashfreeRes = await cashfreeApiRequest("POST", "/orders", orderPayload);
      logger.info(`Cashfree order created: ${orderId} for user ${dbUser.id}`);

      let subscription = await prisma.subscription.findUnique({
        where: { userId: dbUser.id },
      });
      if (!subscription) {
        subscription = await prisma.subscription.create({
          data: {
            userId: dbUser.id,
            tier: "FREE",
            cashfreeOrderId: cashfreeRes.order_id || orderId,
          },
        });
      }

      await prisma.cashfreeOrder.create({
        data: {
          subscriptionId: subscription.id,
          orderId: cashfreeRes.order_id || orderId,
          orderAmount: orderAmount / 100,
          orderCurrency: "INR",
          orderStatus: "PENDING",
          paymentSessionId: cashfreeRes.payment_session_id,
          paymentLink: cashfreeRes.payment_link,
          customerPhone: phone || null,
          orderExpiryTime: cashfreeRes.order_expiry_time
            ? new Date(cashfreeRes.order_expiry_time)
            : new Date(Date.now() + 30 * 60 * 1000),
        },
      });

      res.status(200).json({
        success: true,
        gateway: "cashfree",
        payment_session_id: cashfreeRes.payment_session_id,
        order_id: cashfreeRes.order_id || orderId,
        order_amount: orderAmount / 100,
        order_currency: "INR",
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userPayload = req.user;
      if (!userPayload) throw new BadRequestError("User is not authenticated");

      const { order_id } = req.body;
      if (!order_id) throw new BadRequestError("Missing order_id");

      const cashfreeRes = await cashfreeApiRequest("GET", `/orders/${order_id}`);
      const orderStatus = cashfreeRes.order_status;

      if (orderStatus === "PAID") {
        const order = await prisma.cashfreeOrder.findUnique({
          where: { orderId: order_id },
          include: { subscription: true },
        });

        if (!order) throw new NotFoundError("Order not found in database");

        const tier = order.subscription.tier === "PRO" ? "PRO" : "ENTERPRISE";

        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        await prisma.subscription.update({
          where: { id: order.subscriptionId },
          data: {
            tier: tier as any,
            cashfreeOrderId: order_id,
            currentPeriodEnd,
            lastResetAt: new Date(),
          },
        });

        await prisma.cashfreeOrder.update({
          where: { orderId: order_id },
          data: {
            orderStatus: "PAID",
            cfPaymentId: cashfreeRes.cf_order_id,
            cfOrderId: cashfreeRes.cf_order_id,
            settledAt: new Date(),
          },
        });

        const priceMap: Record<string, number> = { FREE: 0, PRO: 19, ENTERPRISE: 49 };
        await prisma.billingHistory.create({
          data: {
            userId: order.subscription.userId,
            amount: priceMap[tier] || 0,
            tier: tier as any,
            cashfreeOrderId: order_id,
            gateway: "cashfree",
            status: "PAID",
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: order.subscription.userId,
            action: `CASHFREE_PAYMENT_COMPLETED_${tier}`,
          },
        });

        const dbUser = await prisma.user.findUnique({
          where: { id: order.subscription.userId },
        });

        let accessToken: string | undefined;
        let refreshToken: string | undefined;
        if (dbUser) {
          accessToken = generateAccessToken({
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            tier,
          });
          refreshToken = generateRefreshToken({ id: dbUser.id });
          setAuthCookies(res, accessToken, refreshToken);
        }

        res.status(200).json({
          success: true,
          status: "PAID",
          tier,
          accessToken,
          refreshToken,
        });
      } else {
        res.status(200).json({
          success: true,
          status: orderStatus || "PENDING",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  public static async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const signature = req.headers["x-webhook-signature"] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      if (signature && CASHFREE_SECRET_KEY) {
        const computedSignature = crypto
          .createHmac("sha256", CASHFREE_SECRET_KEY)
          .update(rawBody)
          .digest("base64");

        if (computedSignature !== signature) {
          logger.warn("Cashfree webhook signature mismatch");
          res.status(400).json({ message: "Invalid signature" });
          return;
        }
      }

      const event = req.body;
      logger.info(`Cashfree webhook event: ${event.type}`);

      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        const orderId = event.data?.order?.order_id;
        const cfPaymentId = event.data?.payment?.cf_payment_id;
        const paymentStatus = event.data?.payment?.payment_status;
        const orderAmount = event.data?.order?.order_amount;
        const tags = event.data?.order?.order_tags || {};

        if (orderId && paymentStatus === "SUCCESS") {
          const order = await prisma.cashfreeOrder.findUnique({
            where: { orderId },
            include: { subscription: { include: { user: true } } },
          });

          if (order && order.orderStatus !== "PAID") {
            const tier = tags.tier || "PRO";

            const currentPeriodEnd = new Date();
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

            await prisma.subscription.update({
              where: { id: order.subscriptionId },
              data: {
                tier: tier as any,
                currentPeriodEnd,
                lastResetAt: new Date(),
              },
            });

            await prisma.cashfreeOrder.update({
              where: { orderId },
              data: {
                orderStatus: "PAID",
                cfPaymentId: cfPaymentId || undefined,
                cfOrderId: event.data?.order?.cf_order_id,
                settledAt: new Date(),
              },
            });

            const priceMap: Record<string, number> = { FREE: 0, PRO: 19, ENTERPRISE: 49 };
            await prisma.billingHistory.create({
              data: {
                userId: order.subscription.userId,
                amount: orderAmount ? Number(orderAmount) : priceMap[tier] || 0,
                tier: tier as any,
                cashfreeOrderId: orderId,
                gateway: "cashfree",
                status: "PAID",
              },
            });

            await prisma.auditLog.create({
              data: {
                userId: order.subscription.userId,
                action: `CASHFREE_WEBHOOK_PAYMENT_SUCCESS_${tier}`,
              },
            });

            logger.info(`Cashfree webhook processed: order ${orderId} for user ${order.subscription.userId}`);
          }
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error(`Cashfree webhook error: ${(error as Error).message}`);
      res.status(200).json({ received: true });
    }
  }
}
