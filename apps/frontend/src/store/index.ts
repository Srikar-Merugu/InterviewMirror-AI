import { create } from "zustand";
import {
  InterviewSessionDTO,
  ConsolidatedReportDTO,
} from "@interviewmirror/shared-types";

interface AppState {
  sessions: InterviewSessionDTO[];
  currentSession: InterviewSessionDTO | null;
  activeReport: ConsolidatedReportDTO | null;
  loading: boolean;
  error: string | null;

  // Actions
  setSessions: (sessions: InterviewSessionDTO[]) => void;
  setCurrentSession: (session: InterviewSessionDTO | null) => void;
  setActiveReport: (report: ConsolidatedReportDTO | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async flow simulations
  createSessionSim: (
    title: string,
    jobDesc?: string,
  ) => Promise<InterviewSessionDTO>;
  triggerAnalysisSim: (sessionId: string) => Promise<void>;
  fetchReportSim: (sessionId: string) => Promise<ConsolidatedReportDTO>;
}

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  currentSession: null,
  activeReport: null,
  loading: false,
  error: null,

  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setActiveReport: (report) => set({ activeReport: report }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  createSessionSim: async (title: string, jobDesc = "") => {
    set({ loading: true, error: null });
    try {
      const mockSession: InterviewSessionDTO = {
        id: Math.random().toString(36).substring(7),
        userId: "mock-clerk-user-id",
        title,
        jobDescription: jobDesc,
        videoUrl: null,
        audioUrl: null,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        sessions: [mockSession, ...state.sessions],
        currentSession: mockSession,
        loading: false,
      }));

      return mockSession;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  triggerAnalysisSim: async (sessionId: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: "PROCESSING" } : s,
      ),
      currentSession:
        get().currentSession?.id === sessionId
          ? { ...get().currentSession!, status: "PROCESSING" }
          : get().currentSession,
    }));

    // Simulate background processing latency
    setTimeout(() => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? { ...s, status: "COMPLETED" } : s,
        ),
        currentSession:
          get().currentSession?.id === sessionId
            ? { ...get().currentSession!, status: "COMPLETED" }
            : get().currentSession,
      }));
    }, 4000);
  },

  fetchReportSim: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate realistic posture timestamps
      const postureLogs = Array.from({ length: 15 }).map((_, idx) => ({
        id: `p-${idx}`,
        sessionId,
        timestampSeconds: idx * 4,
        headTiltAngle: parseFloat((Math.sin(idx) * 3 + 2).toFixed(1)),
        shoulderSlopeAngle: parseFloat((Math.cos(idx) * 2 + 1.2).toFixed(1)),
        isSlumping: idx === 4 || idx === 8,
        confidenceScore: 0.95,
        createdAt: new Date().toISOString(),
      }));

      // Simulate eye contact & emotions logs
      const emotions = [
        "Neutral",
        "Neutral",
        "Neutral",
        "Happy",
        "Thinking",
        "Neutral",
      ];
      const facialLogs = Array.from({ length: 15 }).map((_, idx) => ({
        id: `f-${idx}`,
        sessionId,
        timestampSeconds: idx * 4,
        eyeContactScore: parseFloat((0.85 + Math.sin(idx) * 0.08).toFixed(2)),
        smileIntensity: parseFloat((0.15 + Math.cos(idx) * 0.1).toFixed(2)),
        primaryEmotion: emotions[idx % emotions.length],
        blinkingRate: 0.22,
        createdAt: new Date().toISOString(),
      }));

      // Speech metrics
      const speechLogs = [
        {
          id: `s-1`,
          sessionId,
          transcription:
            "Well, let me explain. So, my experience with Next.js began three years ago. Actually, we migrated our main SaaS product from standard React. It was, like, quite challenging because of SSR complexities, but we, um, managed to scale performance significantly.",
          speechRateWPM: 125.4,
          fillerWords: { like: 3, um: 2, so: 4, well: 2 },
          overallConfidence: 0.88,
          createdAt: new Date().toISOString(),
        },
      ];

      const report = {
        id: `rep-${sessionId}`,
        sessionId,
        overallScore: 84.5,
        communicationScore: 88.0,
        technicalScore: 81.0,
        overallFeedback:
          "The candidate maintained good shoulder alignment but slouched occasionally during stressful technical explanations. Speech rate was optimal but could benefit from reduced filler word usage like 'like' or 'um'. Eye contact scores show excellent direct engagement.",
        recommendations: [
          "Focus on roll-back shoulders posture when explaining core technical algorithms.",
          "Introduce a slight pause instead of using filler word transitions.",
          "Continue direct gaze tracking into the camera aperture.",
        ],
        createdAt: new Date().toISOString(),
      };

      const consolidated: ConsolidatedReportDTO = {
        session: get().sessions.find((s) => s.id === sessionId) || {
          id: sessionId,
          userId: "mock-clerk-user-id",
          title: "Technical Architect Interview",
          jobDescription: "Senior SaaS Architect Roles",
          videoUrl: "https://example.com/mock-video.mp4",
          audioUrl: null,
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        report,
        postureLogs,
        facialLogs,
        speechLogs,
      };

      set({ activeReport: consolidated, loading: false });
      return consolidated;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
