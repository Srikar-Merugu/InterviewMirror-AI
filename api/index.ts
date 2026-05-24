/**
 * Vercel Serverless Function entrypoint.
 * This file wraps the Express app for deployment on Vercel.
 * All routes are handled by the Express app from apps/backend.
 */

// Ensure environment variables are loaded
import "dotenv/config";
import app from "../apps/backend/src/app";

export default app;
