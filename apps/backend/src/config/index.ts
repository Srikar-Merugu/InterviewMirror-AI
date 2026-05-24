import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5001,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "interviewmirror_secret_key_default",
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || "http://localhost:8000",
};

// Simple sanity check of key configs
if (CONFIG.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.warn(
    "WARNING: DATABASE_URL environment variable is missing in production.",
  );
}
