import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public Credentials authentication endpoints
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/oauth", AuthController.oauthCallback);
router.post("/forgot-password", AuthController.forgotPassword);
router.get("/verify-email", AuthController.verifyEmail);

// Session endpoints protected by requireAuth JWT guard
router.post("/logout", requireAuth, AuthController.logout);
router.get("/me", requireAuth, AuthController.getMe);
router.put("/me", requireAuth, AuthController.updateMe);

export const authRouter = router;
