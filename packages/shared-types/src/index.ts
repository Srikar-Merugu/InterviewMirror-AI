export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type Role = "USER" | "RECRUITER" | "ADMIN";
export type SessionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  providerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSessionDTO {
  id: string;
  userId: string;
  title: string;
  jobDescription: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AIReportDTO {
  id: string;
  sessionId: string;
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  overallFeedback: string;
  recommendations: string[];
  createdAt: string;
}

export interface PostureLogDTO {
  id: string;
  sessionId: string;
  timestampSeconds: number;
  headTiltAngle: number;
  shoulderSlopeAngle: number;
  isSlumping: boolean;
  confidenceScore: number;
  createdAt: string;
}

export interface FacialLogDTO {
  id: string;
  sessionId: string;
  timestampSeconds: number;
  eyeContactScore: number;
  smileIntensity: number;
  primaryEmotion: string;
  blinkingRate: number;
  createdAt: string;
}

export interface SpeechLogDTO {
  id: string;
  sessionId: string;
  transcription: string;
  speechRateWPM: number;
  fillerWords: Record<string, number>;
  overallConfidence: number;
  createdAt: string;
}

export interface ConsolidatedReportDTO {
  session: InterviewSessionDTO;
  report: AIReportDTO | null;
  postureLogs: PostureLogDTO[];
  facialLogs: FacialLogDTO[];
  speechLogs: SpeechLogDTO[];
}

export interface AnalyticsDTO {
  id: string;
  userId: string;
  aggregateScore: number;
  totalInterviews: number;
  averageEyeContact: number;
  averagePostureScore: number;
  lastUpdated: string;
}

export interface RecruiterReportDTO {
  id: string;
  sessionId: string;
  shareableToken: string;
  recruiterNotes: string | null;
  isPublic: boolean;
  createdAt: string;
}
