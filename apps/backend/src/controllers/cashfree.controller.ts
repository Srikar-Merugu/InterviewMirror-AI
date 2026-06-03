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
const IS_MOCK = !CASHFREE_APP_ID;

const CASHFREE_BASE_URL = CASHFREE_ENV === "PRODUCTION"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

const API_VERSION = "2023-08-01";
const PLAN_PRICES_PAISE: Record<string, number> = {
  PRO: 1999,
  ENTERPRISE: 4999,
};
const PLAN_PRICES_DOLLAR: Record<string, number> = {
  FREE: 0,
  PRO: 19,
  ENTERPRISE: 49,
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
  const headers: Record<string, string> = {};  
  if (CASHFREE_APP_ID.startsWith("TEST") || CASHFREE_APP_ID.startsWith("PROD")) {
    headers["x-client-id"] = CASHFREE_APP_ID;
    headers["x-client-secret"] = CASHFREE_SECRET_KEY;
  } else {
    headers["x-api-id"] = CASHFREE_APP_ID;
    headers["x-api-secret"] = CASHFREE_SECRET_KEY;
  }
  headers["x-api-version"] = API_VERSION;
  headers["Content-Type"] = "application/json";

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });

  if (!res.ok) {
    const errorBody = await res.text();
    logger.error(`Cashfree API error [${res.status}]: ${errorBody}`);
    throw new Error(`Cashfree API returned ${res.status}: ${errorBody}`);
  }

  return res.json();
}

function generateMockSessionId(orderId: string): string {
  const hash = crypto.createHash("sha256").update(orderId + Date.now()).digest("hex");
  return `mock_session_${hash.slice(0, 24)}`;
}

async function getOrCreateSubscription(userId: string) {
  let sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { userId, tier: "FREE" },
    });
  }
  return sub;
}

async function processSuccessfulPayment(
  orderId: string,
  cfPaymentId: string | undefined,
  cfOrderId: string | undefined,
  tier: string,
  orderAmount: number | undefined,
  userId: string,
  subscriptionId: string,
  res?: Response,
) {
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { tier: tier as any, currentPeriodEnd, lastResetAt: new Date() },
  });

  await prisma.cashfreeOrder.update({
    where: { orderId },
    data: {
      orderStatus: "PAID",
      cfPaymentId: cfPaymentId || undefined,
      cfOrderId: cfOrderId || undefined,
      settledAt: new Date(),
    },
  });

  await prisma.billingHistory.create({
    data: {
      userId,
      amount: orderAmount ?? PLAN_PRICES_DOLLAR[tier] ?? 0,
      tier: tier as any,
      cashfreeOrderId: orderId,
      gateway: "cashfree",
      status: "PAID",
    },
  });

  await prisma.auditLog.create({
    data: { userId, action: `CASHFREE_PAYMENT_COMPLETED_${tier}` },
  });

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser && res) {
    const accessToken = generateAccessToken({
      id: dbUser.id, email: dbUser.email, role: dbUser.role, tier,
    });
    const refreshToken = generateRefreshToken({ id: dbUser.id });
    setAuthCookies(res, accessToken, refreshToken);
  }
}

export class CashfreeController {

  // POST /cashfree/create
  public static async createOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new BadRequestError("User is not authenticated");

      const { tier, phone } = req.body;
      if (!tier || !["PRO", "ENTERPRISE"].includes(tier)) {
        throw new BadRequestError("Invalid or missing subscription tier");
      }

      const dbUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!dbUser) throw new NotFoundError("User not found");

      const orderAmount = PLAN_PRICES_PAISE[tier];
      const orderId = `CF_${dbUser.id.slice(-12)}_${Date.now()}`;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const subscription = await getOrCreateSubscription(dbUser.id);

      let cashfreeRes: CashfreeApiResponse;

      if (IS_MOCK) {
        const mockSessionId = generateMockSessionId(orderId);
        cashfreeRes = {
          order_id: orderId,
          payment_session_id: mockSessionId,
          payment_link: `${frontendUrl}/mock-checkout?session_id=${mockSessionId}`,
          order_amount: orderAmount / 100,
          order_currency: "INR",
          order_status: "ACTIVE",
          order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          cf_order_id: `mock_cf_${Date.now()}`,
        };
        logger.info(`Cashfree MOCK order created: ${orderId}`);
      } else {
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
          order_tags: { userId: dbUser.id, tier },
        };

        cashfreeRes = await cashfreeApiRequest("POST", "/orders", orderPayload);
        logger.info(`Cashfree order created: ${orderId} for user ${dbUser.id}`);
      }

      await prisma.cashfreeOrder.create({
        data: {
          subscriptionId: subscription.id,
          orderId: cashfreeRes.order_id || orderId,
          orderAmount: (cashfreeRes.order_amount ?? orderAmount) / 100,
          orderCurrency: cashfreeRes.order_currency || "INR",
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
        gateway: IS_MOCK ? "cashfree_mock" : "cashfree",
        payment_session_id: cashfreeRes.payment_session_id,
        order_id: cashfreeRes.order_id || orderId,
        order_amount: orderAmount / 100,
        order_currency: "INR",
        environment: CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox",
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /cashfree/verify
  public static async verifyPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new BadRequestError("User is not authenticated");

      const { order_id } = req.body;
      if (!order_id) throw new BadRequestError("Missing order_id");

      const order = await prisma.cashfreeOrder.findUnique({
        where: { orderId: order_id },
        include: { subscription: true },
      });
      if (!order) throw new NotFoundError("Order not found in database");

      let orderStatus: string | undefined;

      if (IS_MOCK) {
        // In mock mode, any order with MOCK prefix is automatically PAID
        // Real simulated orders require a separate mock-success endpoint call
        orderStatus = order.orderStatus === "PAID" ? "PAID" : "ACTIVE";
      } else {
        const cashfreeRes = await cashfreeApiRequest("GET", `/orders/${order_id}`);
        orderStatus = cashfreeRes.order_status;
      }

      if (orderStatus === "PAID") {
        const tier = order.subscription.tier === "PRO" ? "PRO" : "ENTERPRISE";
        await processSuccessfulPayment(
          order_id,
          order.cfPaymentId || `cf_${Date.now()}`,
          order.cfOrderId || `cf_${Date.now()}`,
          tier,
          order.orderAmount,
          order.subscription.userId,
          order.subscriptionId,
          res,
        );

        logger.info(`Cashfree verify: order ${order_id} marked PAID`);

        res.status(200).json({
          success: true,
          status: "PAID",
          tier,
        });
      } else {
        res.status(200).json({
          success: true,
          status: orderStatus || "PENDING",
          gateway: IS_MOCK ? "cashfree_mock" : "cashfree",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // POST /cashfree/mock-success — simulates successful payment for mock orders
  public static async mockPaymentSuccess(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) throw new BadRequestError("User is not authenticated");

      const { order_id } = req.body;
      if (!order_id) throw new BadRequestError("Missing order_id");
      if (!order_id.startsWith("CF_") && !order_id.startsWith("mock_")) {
        throw new BadRequestError("Invalid mock order_id format");
      }

      const order = await prisma.cashfreeOrder.findUnique({
        where: { orderId: order_id },
        include: { subscription: { include: { user: true } } },
      });
      if (!order) throw new NotFoundError("Order not found");

      if (order.orderStatus === "PAID") {
        res.status(200).json({ success: true, status: "ALREADY_PAID" });
        return;
      }

      const tier = order.subscription.tier === "PRO" ? "PRO" : "ENTERPRISE";
      await processSuccessfulPayment(
        order_id,
        `mock_cf_pay_${Date.now()}`,
        `mock_cf_ord_${Date.now()}`,
        tier,
        order.orderAmount,
        order.subscription.userId,
        order.subscriptionId,
        res,
      );

      logger.info(`Cashfree MOCK payment success: order ${order_id} → ${tier}`);

      const dbUser = await prisma.user.findUnique({ where: { id: order.subscription.userId } });
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      if (dbUser) {
        accessToken = generateAccessToken({
          id: dbUser.id, email: dbUser.email, role: dbUser.role, tier,
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
        message: `Mock payment completed. Subscription upgraded to ${tier}`,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /cashfree/webhook
  public static async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const signature = req.headers["x-webhook-signature"] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      if (signature && CASHFREE_SECRET_KEY && !IS_MOCK) {
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
            include: { subscription: true },
          });

          if (order && order.orderStatus !== "PAID") {
            const tier = tags.tier || "PRO";
            await processSuccessfulPayment(
              orderId,
              cfPaymentId,
              event.data?.order?.cf_order_id,
              tier,
              orderAmount ? Number(orderAmount) : undefined,
              order.subscription.userId,
              order.subscriptionId,
            );
            logger.info(`Cashfree webhook processed: order ${orderId}`);
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
