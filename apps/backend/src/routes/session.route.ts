import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  requirePro,
  requirePremium,
} from "../middlewares/subscription.middleware";

const router = Router();

// Auth sync — no tier restriction
router.post("/auth/sync", requireAuth, SessionController.syncUser);

// Interview metadata creation — base auth only (quota limit checked inside controller)
router.post(
  "/interviews",
  requireAuth,
  SessionController.createSession,
);

// Interview list fetch — base auth only (free users can see their limited history)
router.get("/interviews", requireAuth, SessionController.listSessions);

// Interview upload video trigger — base auth only
router.post(
  "/interviews/:id/process",
  requireAuth,
  SessionController.processSession,
);

// Interview consolidated report — base auth only (feature access locked on frontend)
router.get(
  "/interviews/:id/report",
  requireAuth,
  SessionController.getReport,
);

export default router;
