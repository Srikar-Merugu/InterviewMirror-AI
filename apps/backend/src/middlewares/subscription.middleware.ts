import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "./error.middleware";

export const requirePro = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userPayload = req.user;

  if (!userPayload) {
    return next(new AppError("Candidate is not authenticated", 401));
  }

  // Bypass for demo user
  if (userPayload.email === "demo@interviewmirror.ai") {
    return next();
  }

  const tier = userPayload.tier;

  if (tier !== "PRO" && tier !== "ENTERPRISE") {
    return next(
      new AppError(
        "Forbidden: This feature requires a Pro or Premium subscription.",
        403
      )
    );
  }

  next();
};

export const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userPayload = req.user;

  if (!userPayload) {
    return next(new AppError("Candidate is not authenticated", 401));
  }

  // Bypass for demo user
  if (userPayload.email === "demo@interviewmirror.ai") {
    return next();
  }

  const tier = userPayload.tier;

  if (tier !== "ENTERPRISE") {
    return next(
      new AppError(
        "Forbidden: This feature requires a Recruiter Premium/Enterprise subscription.",
        403
      )
    );
  }

  next();
};
