import { Router } from "express";
import { StripeController } from "../controllers/stripe.controller";
import { CashfreeController } from "../controllers/cashfree.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Gated checkout initializer (Stripe)
router.post("/checkout", requireAuth, StripeController.createCheckoutSession);

// Instant sandbox manual tier upgrade
router.post("/sandbox-upgrade", requireAuth, StripeController.executeSandboxUpgrade);

// Public Stripe webhook listener
router.post("/webhook", StripeController.handleStripeWebhook);

// Cashfree payment gateway endpoints
router.post("/cashfree/create", requireAuth, CashfreeController.createOrder);
router.post("/cashfree/verify", requireAuth, CashfreeController.verifyPayment);
router.post("/cashfree/webhook", CashfreeController.handleWebhook);

export const subscriptionRouter = router;
