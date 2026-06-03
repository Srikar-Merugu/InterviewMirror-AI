import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes/session.route";
import { authRouter } from "./routes/auth.route";
import { subscriptionRouter } from "./routes/subscription.route";

const app = express();

// Trust proxy for Vercel deployments and rate limiting
app.set("trust proxy", 1);

// Root path to prevent 404s for simple pings
app.get("/", (req, res) => {
  res.status(200).send("InterviewMirror AI API is running.");
});

// Security Headers Setup
app.use(helmet());

// Cross-Origin Requests Setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://www.srikarmerugu.space",
  "https://srikarmerugu.space",
  "https://interview-mirror-ai-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests explicitly
app.options("*", cors(corsOptions));

// Global Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TooManyRequests",
      message:
        "Too many requests from this IP. Please try again after 15 minutes.",
    },
    timestamp: new Date().toISOString(),
  },
});

app.use(limiter);

// Body Parsing Middeleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Basic health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// API Routes namespace mapping
app.use("/api/v1", routes);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscription", subscriptionRouter);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
