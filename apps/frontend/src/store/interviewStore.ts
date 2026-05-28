import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;

interface TelemetryPoint {
  headTiltAngle: number;
  shoulderSlopeAngle: number;
  isSlumping: boolean;
  eyeContactScore: number;
  timestamp: number;
}

interface InterviewState {
  socket: SocketType | null;
  sessionId: string | null;
  connected: boolean;
  questionIndex: number;
  timerSeconds: number;
  isPaused: boolean;
  alerts: string[];
  telemetryFeed: TelemetryPoint[];

  setSessionId: (id: string) => void;
  initializeSocket: (sessionId: string) => void;
  disconnectSocket: () => void;
  setQuestionIndex: (index: number) => void;
  setTimerSeconds: (seconds: number) => void;
  setIsPaused: (paused: boolean) => void;
  addAlert: (alert: string) => void;
  clearAlerts: () => void;
  addTelemetryPoint: (point: TelemetryPoint) => void;
}

export const useInterviewStore = create<InterviewState>()(
  devtools(
    persist(
      (set, get) => ({
        socket: null,
        sessionId: null,
        connected: false,
        questionIndex: 0,
        timerSeconds: 0,
        isPaused: false,
        alerts: [],
        telemetryFeed: [],

        setSessionId: (id: string) => set({ sessionId: id }),

        initializeSocket: (sessionId: string) => {
          // Clean up old socket if exists
          const oldSocket = get().socket;
          if (oldSocket) {
            oldSocket.disconnect();
          }

          // Extract auth access token from browser cookie context
          const token = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("access_token="))
            ?.split("=")[1];

          const isDev =
            typeof window !== "undefined" &&
            (window.location.port === "3000" ||
             window.location.hostname === "localhost" ||
             window.location.hostname === "127.0.0.1");
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

          // Initialize Socket.IO connection
          // Use both polling and websocket for Vercel serverless compatibility
          const socket = io(backendUrl, {
            auth: { token },
            transports: ["polling", "websocket"],
            upgrade: true,
            rememberUpgrade: true,
          });

          socket.on("connect", () => {
            set({ socket, connected: true, sessionId });
            loggerInfo("Socket.IO Interview Gateway handshaked.");

            // Emit session join room request
            socket.emit("session:join", { token, sessionId });
          });

          // Sync recovery metadata from backend
          socket.on(
            "session:ready",
            (data: { questionIndex: number; timerSeconds: number }) => {
              set({
                questionIndex: data.questionIndex,
                timerSeconds: data.timerSeconds,
              });
            },
          );

          // Real-time telemetry posture visual warning alerts listener
          socket.on("analytics:alert", (data: { alerts: string[] }) => {
            set((state) => ({
              alerts: Array.from(
                new Set([...state.alerts, ...data.alerts]),
              ).slice(-5), // keep last 5 alerts
            }));
          });

          // Live charts telemetry synchronize
          socket.on("analytics:live_feed", (point: TelemetryPoint) => {
            set((state) => ({
              telemetryFeed: [...state.telemetryFeed, point].slice(-30), // keep last 30 data points
            }));
          });

          socket.on("question:changed", (data: { index: number }) => {
            set({ questionIndex: data.index });
          });

          socket.on("disconnect", () => {
            set({ connected: false });
            loggerWarning("Socket.IO connection disconnected.");
          });

          set({ socket });
        },

        disconnectSocket: () => {
          const s = get().socket;
          if (s) {
            s.disconnect();
          }
          set({
            socket: null,
            connected: false,
            alerts: [],
            telemetryFeed: [],
          });
        },

        setQuestionIndex: (index: number) => {
          set({ questionIndex: index });
          const s = get().socket;
          const sessionId = get().sessionId;
          if (s && sessionId) {
            s.emit("question:next", { sessionId, index });
          }
        },

        setTimerSeconds: (seconds: number) => {
          set({ timerSeconds: seconds });
          const s = get().socket;
          const sessionId = get().sessionId;
          if (s && sessionId) {
            s.emit("timer:sync", { sessionId, seconds });
          }
        },

        setIsPaused: (paused: boolean) => set({ isPaused: paused }),
        addAlert: (alert: string) =>
          set((state) => ({ alerts: [...state.alerts, alert].slice(-5) })),
        clearAlerts: () => set({ alerts: [] }),
        addTelemetryPoint: (point: TelemetryPoint) =>
          set((state) => ({
            telemetryFeed: [...state.telemetryFeed, point].slice(-30),
          })),
      }),
      {
        name: "interview_store",
        // Exclude socket connection and socket object from local storage serialization
        partialize: (state) => ({
          sessionId: state.sessionId,
          questionIndex: state.questionIndex,
          timerSeconds: state.timerSeconds,
        }),
      },
    ),
  ),
);

// Internal console logger helpers
function loggerInfo(msg: string) {
  console.info(
    `[InterviewStore] %c${msg}`,
    "color: #818cf8; font-weight: bold;",
  );
}

function loggerWarning(msg: string) {
  console.warn(
    `[InterviewStore] %c${msg}`,
    "color: #fbbf24; font-weight: bold;",
  );
}
