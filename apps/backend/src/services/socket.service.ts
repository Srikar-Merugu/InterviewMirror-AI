import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { prisma } from "@interviewmirror/database";
import { logger } from "@interviewmirror/logger";
import { verifyAccessToken } from "../utils/auth";

interface ActiveSession {
  userId: string;
  sessionId: string;
  socketId: string;
  questionIndex: number;
  timerSeconds: number;
  timerInterval?: NodeJS.Timeout;
}

// In-memory registry of active interview streams
const activeSessions = new Map<string, ActiveSession>();

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static init(server: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // Adjust for specific production frontend domains
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    logger.info("Initializing Socket.IO Real-time Interview gateway...");

    this.io.on("connection", (socket: Socket) => {
      logger.info(`Socket connection established: ${socket.id}`);

      // 1. Session Room Join
      socket.on(
        "session:join",
        async (data: { token?: string; sessionId: string }) => {
          try {
            const { token, sessionId } = data;
            if (!sessionId) {
              socket.emit("error", {
                message: "sessionId parameter is required",
              });
              return;
            }

            let userId = "mock-user-id";
            let role = "USER";

            // Validate optional JWT token if provided
            if (
              token &&
              token !== "mock-user-token" &&
              token !== "mock-recruiter-token"
            ) {
              const decoded = verifyAccessToken(token);
              if (decoded) {
                userId = decoded.id;
                role = decoded.role;
              }
            }

            // Fetch or confirm session exists in DB
            let dbSession = null;
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(sessionId);
            if (isMongoId) {
              dbSession = await prisma.interviewSession.findUnique({
                where: { id: sessionId },
              });
            }

            if (!dbSession && sessionId !== "session-101") {
              socket.emit("error", {
                message: "Interview session record not found",
              });
              return;
            }

            // Anti-Hijacking / Multi-Tab prevention check
            const existing = activeSessions.get(sessionId);
            if (existing && existing.socketId !== socket.id) {
              logger.warn(
                `Tab hijacking blocked. Active socket ${existing.socketId} already running session ${sessionId}`,
              );
              socket.emit("session:duplicate", {
                message:
                  "This interview session is already active in another browser tab.",
              });
              return;
            }

            // Set up room boundaries
            socket.join(sessionId);

            // Restore or initialize session details
            const sessionState: ActiveSession = existing || {
              userId,
              sessionId,
              socketId: socket.id,
              questionIndex: 0,
              timerSeconds: 0,
            };

            // Bind active mapping
            sessionState.socketId = socket.id;
            activeSessions.set(sessionId, sessionState);

            logger.info(
              `Candidate ${userId} successfully joined interview room ${sessionId}`,
            );

            // Emit success & sync back recovery details
            socket.emit("session:ready", {
              questionIndex: sessionState.questionIndex,
              timerSeconds: sessionState.timerSeconds,
            });
          } catch (error: any) {
            logger.error(`Error in session:join handler: ${error.message}`);
            socket.emit("error", {
              message: "Internal server error joining session",
            });
          }
        },
      );

      // 2. Binary Media Stream Chunk Receiver
      socket.on(
        "media:chunk",
        (data: { sessionId: string; chunk: ArrayBuffer }) => {
          const { sessionId, chunk } = data;
          if (!sessionId || !chunk) return;

          const session = activeSessions.get(sessionId);
          if (!session) return;

          // Process chunk: in production, pipe this directly to disk or AWS S3 / Google Cloud Storage.
          // For development, we log buffer size tracking to prevent memory leakage
          logger.info(
            `Received video/audio chunk: ${chunk.byteLength} bytes for session ${sessionId}`,
          );

          // Acknowledge chunk delivery for frame rate stability controls
          socket.emit("media:ack", { timestamp: Date.now() });
        },
      );

      // 3. Frame-by-frame Real-time Telemetry Analytics
      socket.on(
        "analytics:telemetry",
        async (data: {
          sessionId: string;
          headTiltAngle: number;
          shoulderSlopeAngle: number;
          isSlumping: boolean;
          eyeContactScore: number;
        }) => {
          const {
            sessionId,
            headTiltAngle,
            shoulderSlopeAngle,
            isSlumping,
            eyeContactScore,
          } = data;
          if (!sessionId) return;

          const session = activeSessions.get(sessionId);
          if (!session) return;

          // Real-time anomaly alerts threshold checkers
          const alerts: string[] = [];
          if (isSlumping) {
            alerts.push(
              "Slumping posture detected. Align your shoulders back.",
            );
          }
          if (eyeContactScore < 0.6) {
            alerts.push(
              "Maintain direct eye contact with the camera aperture.",
            );
          }

          // Stream alerts back in real-time
          if (alerts.length > 0) {
            socket.emit("analytics:alert", { alerts });
          }

          // Emit current processed coordinates to synchronize live chart overlays
          socket.emit("analytics:live_feed", {
            headTiltAngle,
            shoulderSlopeAngle,
            isSlumping,
            eyeContactScore,
            timestamp: Date.now(),
          });
        },
      );

      // 4. Timer Controls - Sync state
      socket.on(
        "timer:sync",
        (data: { sessionId: string; seconds: number }) => {
          const { sessionId, seconds } = data;
          const session = activeSessions.get(sessionId);
          if (session) {
            session.timerSeconds = seconds;
          }
        },
      );

      // 5. Question indices synchronizer
      socket.on(
        "question:next",
        (data: { sessionId: string; index: number }) => {
          const { sessionId, index } = data;
          const session = activeSessions.get(sessionId);
          if (session) {
            session.questionIndex = index;
            socket.to(sessionId).emit("question:changed", { index });
          }
        },
      );

      // 6. Graceful disconnections recovery
      socket.on("disconnect", () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
        // Find if this socket was managing any active sessions
        for (const [sessionId, session] of activeSessions.entries()) {
          if (session.socketId === socket.id) {
            logger.info(
              `Grace recovery interval started for session: ${sessionId}`,
            );

            // Wait 30 seconds before clean up to allow page refreshes to re-establish
            setTimeout(() => {
              const current = activeSessions.get(sessionId);
              if (current && current.socketId === socket.id) {
                activeSessions.delete(sessionId);
                logger.info(
                  `Session mapping cleaned up after grace timeout: ${sessionId}`,
                );
              }
            }, 30000);
          }
        }
      });
    });

    return this.io;
  }
}
