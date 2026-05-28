import { Router } from "express";
import { StripeController } from "../controllers/stripe.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Gated checkout initializer
router.post("/checkout", requireAuth, StripeController.createCheckoutSession);

// Instant sandbox manual tier upgrade
router.post("/sandbox-upgrade", requireAuth, StripeController.executeSandboxUpgrade);

// Public Stripe webhook listener
router.post("/webhook", StripeController.handleStripeWebhook);

export const subscriptionRouter = router;
