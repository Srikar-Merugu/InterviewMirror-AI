import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Auth sync
router.post("/auth/sync", requireAuth, SessionController.syncUser);

// Interview metadata creation
router.post("/interviews", requireAuth, SessionController.createSession);

// Interview list fetch
router.get("/interviews", requireAuth, SessionController.listSessions);

// Interview upload video trigger
router.post(
  "/interviews/:id/process",
  requireAuth,
  SessionController.processSession,
);

// Interview consolidated report
router.get("/interviews/:id/report", requireAuth, SessionController.getReport);

export default router;
