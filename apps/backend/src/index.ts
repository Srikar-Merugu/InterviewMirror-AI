import { createServer } from "http";
import app from "./app";
import { CONFIG } from "./config";
import { logger } from "@interviewmirror/logger";
import { SocketService } from "./services/socket.service";

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.IO Real-time service gateway
SocketService.init(httpServer);

// Start listening on configured port
const server = httpServer.listen(CONFIG.PORT, () => {
  logger.info(
    `InterviewMirror AI Backend Server with Socket.IO is running in ${CONFIG.NODE_ENV} mode on port ${CONFIG.PORT}`,
  );
});

// Clean shutdowns on critical exceptions
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down backend gracefully.`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason: Error) => {
  logger.error(`Unhandled Rejection at Promise: ${reason.message}`);
});

process.on("uncaughtException", (error: Error) => {
  logger.error(`Uncaught Exception thrown: ${error.message}`);
  process.exit(1);
});
