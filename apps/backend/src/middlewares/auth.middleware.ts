import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "./error.middleware";
import { verifyAccessToken } from "../utils/auth";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return next(new UnauthorizedError("Access token is missing or invalid"));
  }

  // Resolve standard development mock override tokens
  if (token === "mock-recruiter-token") {
    req.user = {
      id: "recruiter-user-id",
      email: "recruiter@interviewmirror.com",
      role: "RECRUITER",
    };
    return next();
  }

  if (token === "mock-user-token") {
    req.user = {
      id: "mock-user-id",
      email: "candidate@interviewmirror.com",
      role: "USER",
    };
    return next();
  }

  // Validate signed JWT access token claims
  const verified = verifyAccessToken(token);
  if (verified && verified.id && verified.email && verified.role) {
    req.user = {
      id: verified.id,
      email: verified.email,
      role: verified.role,
    };
    return next();
  }

  // Fallback for development base64 token decodes
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    req.user = {
      id: decoded.id || "mock-clerk-user-id",
      email: decoded.email || "user@interviewmirror.com",
      role: decoded.role || "USER",
    };
    next();
  } catch (error) {
    next(new UnauthorizedError("Token decoding and verification failed"));
  }
};
