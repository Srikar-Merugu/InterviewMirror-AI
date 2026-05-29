"use client";

import React, { useState, useEffect } from "react";
import { FeatureLock } from "@/components/FeatureLock";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  FileText,
  ShieldAlert,
  User,
  Calendar,
  Compass,
  Eye,
  Zap,
  Loader2,
  Inbox,
} from "lucide-react";
import { GLASSMORPHISM_STYLES } from "@interviewmirror/ui";
import { getAuthHeaders } from "../../../utils/auth";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SessionListItem {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  aiReport?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    overallFeedback?: string;
    recommendations?: string[];
  };
}

interface PostureEntry {
  timestampSeconds: number;
  headTiltAngle: number;
  shoulderSlopeAngle: number;
  isSlumping: boolean;
  confidenceScore: number;
}

interface FacialEntry {
  timestampSeconds: number;
  eyeContactScore: number;
  smileIntensity: number;
  primaryEmotion: string;
  blinkingRate: number;
}

interface SpeechEntry {
  transcription: string;
  speechRateWPM: number;
  fillerWords: Record<string, number>;
  overallConfidence: number;
}

interface ConsolidatedReport {
  session: { id: string; title: string; status: string; createdAt: string };
  report: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    overallFeedback: string;
    recommendations: string[];
  } | null;
  postureLogs: PostureEntry[];
  facialLogs: FacialEntry[];
  speechLogs: SpeechEntry[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getRecommendation(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Strong Hire", color: "text-emerald-400" };
  if (score >= 70) return { label: "Hire", color: "text-indigo-400" };
  return { label: "Needs Practice", color: "text-amber-400" };
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function buildTimeline(
  facialLogs: FacialEntry[],
  postureLogs: PostureEntry[],
): { t: number; eye: number; pose: number }[] {
  const map = new Map<number, { eye: number[]; pose: number[] }>();
  for (const f of facialLogs) {
    if (!map.has(f.timestampSeconds))
      map.set(f.timestampSeconds, { eye: [], pose: [] });
    map.get(f.timestampSeconds)!.eye.push(f.eyeContactScore);
  }
  for (const p of postureLogs) {
    if (!map.has(p.timestampSeconds))
      map.set(p.timestampSeconds, { eye: [], pose: [] });
    map.get(p.timestampSeconds)!.pose.push(p.confidenceScore);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([t, v]) => ({
      t,
      eye: Math.round(avg(v.eye)),
      pose: Math.round(avg(v.pose)),
    }));
}

function totalFillers(fw: Record<string, number>): number {
  return Object.values(fw).reduce((a, b) => a + b, 0);
}

const tooltipStyle = {
  backgroundColor: "#09090b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#e4e4e7",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeScoreTab, setActiveScoreTab] = useState<"visual" | "vocal" | "nlp">("visual");

  /* ---- Fetch session list on mount ---- */
  useEffect(() => {
    (async () => {
      try {
        const isDev =
          typeof window !== "undefined" &&
          (window.location.port === "3000" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (isDev ? `http://${window.location.hostname}:5001` : "");

        const res = await fetch(`${apiBase}/api/v1/interviews`, {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const completed = (json.data as SessionListItem[]).filter(
            (s) => s.status === "COMPLETED",
          );
          setSessions(completed);
          if (completed.length > 0) {
            setSelectedId(completed[0].id);
          }
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- Fetch detailed report when selection changes ---- */
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      setReportLoading(true);
      setReport(null);
      try {
        const isDev =
          typeof window !== "undefined" &&
          (window.location.port === "3000" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ||
          (isDev ? `http://${window.location.hostname}:5001` : "");

        const res = await fetch(`${apiBase}/api/v1/interviews/${selectedId}/report`, {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch report");
        const json = await res.json();
        if (json.success && json.data) {
          setReport(json.data as ConsolidatedReport);
        }
      } catch {
        /* silent */
      } finally {
        setReportLoading(false);
      }
    })();
  }, [selectedId]);

  /* ---- Derive computed values ---- */
  const overallScore = report?.report?.overallScore ?? 0;
  const commScore = report?.report?.communicationScore ?? 0;
  const techScore = report?.report?.technicalScore ?? 0;

  const postureValues = report?.postureLogs ?? [];
  const facialValues = report?.facialLogs ?? [];
  const speechValues = report?.speechLogs ?? [];

  const avgPosture = avg(postureValues.map((p) => p.confidenceScore));
  const avgEyeContact = avg(facialValues.map((f) => f.eyeContactScore));
  const avgWpm = speechValues.length
    ? Math.round(avg(speechValues.map((s) => s.speechRateWPM)))
    : 0;
  const totalFillerCount = speechValues.reduce(
    (sum, s) => sum + totalFillers(s.fillerWords as Record<string, number>),
    0,
  );

  const recommendation = getRecommendation(overallScore);

  const fillerChartData =
    speechValues.length > 0
      ? Object.entries(speechValues[0].fillerWords as Record<string, number>).map(
          ([name, count]) => ({ name, count }),
        )
      : [];

  const timeline = buildTimeline(facialValues, postureValues);

  const wpmTimeline = speechValues.map((s, i) => ({
    t: i,
    wpm: Math.round(s.speechRateWPM),
  }));

  /* Radar dimensions */
  const radarData = [
    { dimension: "Overall", value: Math.round(overallScore) },
    { dimension: "Communication", value: Math.round(commScore) },
    { dimension: "Technical", value: Math.round(techScore) },
    { dimension: "Posture", value: Math.round(avgPosture) },
    { dimension: "Eye Contact", value: Math.round(avgEyeContact) },
  ];

  /* ====================== LOADING ====================== */
  if (loading) {
    return (
      <FeatureLock featureKey="analytics">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </FeatureLock>
    );
  }

  /* ====================== EMPTY STATE ====================== */
  if (sessions.length === 0) {
    return (
      <FeatureLock featureKey="analytics">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Inbox className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-xl font-heading font-bold text-white mb-2">
            No interviews yet
          </h2>
          <p className="text-sm text-zinc-500 max-w-md">
            Complete your first mock interview to see your AI-powered visual,
            vocal, and conversational analytics here.
          </p>
        </div>
      </FeatureLock>
    );
  }

  /* ====================== REPORT LOADING ====================== */
  if (reportLoading || !report) {
    return (
      <FeatureLock featureKey="analytics">
        <div className="space-y-6">
          {/* Session selector skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-8 w-60 bg-zinc-800 rounded-lg skeleton" />
              <div className="h-4 w-80 bg-zinc-800 rounded mt-2 skeleton" />
            </div>
            <div className="flex gap-2">
              {sessions.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="h-8 w-24 bg-zinc-800 rounded-lg skeleton"
                />
              ))}
            </div>
          </div>
          {/* 4 stat cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-zinc-800/60 rounded-2xl skeleton"
              />
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-80 bg-zinc-800/60 rounded-2xl skeleton" />
            <div className="lg:col-span-7 h-80 bg-zinc-800/60 rounded-2xl skeleton" />
          </div>
        </div>
      </FeatureLock>
    );
  }

  /* ====================== MAIN UI ====================== */
  const currentTitle =
    sessions.find((s) => s.id === selectedId)?.title ?? "Session";

  return (
    <FeatureLock featureKey="analytics">
      <div className="space-y-6">
        {/* ---- Header ---- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
              <Award className="text-indigo-400 w-7 h-7" /> AI Recruiter
              Intelligence
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Holistic visual, vocal, and conversational NLP behavioral telemetry
              dashboard.
            </p>
          </div>

          {/* Session selector */}
          <div className="flex items-center flex-wrap gap-1.5 bg-zinc-950/60 border border-zinc-900 rounded-lg p-1 text-[11px] self-start md:self-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  selectedId === session.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {session.title.length > 20
                  ? session.title.slice(0, 20) + "…"
                  : session.title}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Score summary widgets ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col justify-between`}
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Overall Score
            </span>
            <div className="text-3xl font-heading font-black text-white mt-1 flex items-baseline gap-1">
              {Math.round(overallScore)}%
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3" />{" "}
                {Math.round(avgEyeContact)}%
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">
              Avg eye contact {Math.round(avgEyeContact)}%
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col justify-between`}
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Hiring Recommendation
            </span>
            <div
              className={`text-2xl font-heading font-black mt-1 ${recommendation.color}`}
            >
              {recommendation.label}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">
              Computed by AI Recruiter Engine
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col justify-between`}
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Speaking Pacing
            </span>
            <div className="text-3xl font-heading font-black text-white mt-1">
              {avgWpm}{" "}
              <span className="text-xs text-zinc-500">WPM</span>
            </div>
            <span
              className={`text-[10px] mt-1 ${
                avgWpm >= 120 && avgWpm <= 160
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {avgWpm >= 120 && avgWpm <= 160
                ? "Optimal Speech Range"
                : avgWpm === 0
                  ? "No speech data"
                  : "Speed adjustment recommended"}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col justify-between`}
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Filler Density
            </span>
            <div className="text-3xl font-heading font-black text-white mt-1">
              {totalFillerCount}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">
              Total vocal filler words detected
            </span>
          </motion.div>
        </div>

        {/* ---- Radar + Timeline ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-5 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Competency Profile
              </h3>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">
                {currentTitle.length > 16
                  ? currentTitle.slice(0, 16) + "…"
                  : currentTitle}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 9, fill: "#71717a" }}
                />
                <Radar
                  name={currentTitle}
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-7 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Session Telemetry Timeline
              </h3>
              <div className="flex items-center bg-zinc-950/60 border border-zinc-900 rounded-lg p-0.5 text-[9px]">
                {(["visual", "vocal", "nlp"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveScoreTab(tab)}
                    className={`px-3 py-1.5 rounded-md font-semibold capitalize cursor-pointer transition-all ${
                      activeScoreTab === tab
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {activeScoreTab === "visual" && (
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart
                    data={timeline.length > 0 ? timeline : [{ t: 0, eye: 0, pose: 0 }]}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="poseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 9, fill: "#71717a" }}
                      name="Seconds"
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#71717a" }}
                      domain={[0, 100]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 9, color: "#71717a" }} />
                    <Area
                      type="monotone"
                      dataKey="eye"
                      stroke="#6366f1"
                      fill="url(#eyeGrad)"
                      strokeWidth={2}
                      name="Eye Contact %"
                    />
                    <Area
                      type="monotone"
                      dataKey="pose"
                      stroke="#a855f7"
                      fill="url(#poseGrad)"
                      strokeWidth={2}
                      name="Posture Stability %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeScoreTab === "vocal" && (
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart
                    data={wpmTimeline.length > 0 ? wpmTimeline : [{ t: 0, wpm: 0 }]}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#71717a" }} />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#71717a" }}
                      domain={[0, 250]}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 9, color: "#71717a" }} />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Vocal Speed (WPM)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {activeScoreTab === "nlp" && (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={fillerChartData.length > 0 ? fillerChartData : [{ name: "none", count: 0 }]}
                    margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#71717a" }}
                    />
                    <YAxis tick={{ fontSize: 9, fill: "#71717a" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="count"
                      fill="#ef4444"
                      radius={[3, 3, 0, 0]}
                      name="Filler Counts"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* ---- AI Summary + Roadmap ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-7 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 space-y-4`}
          >
            <div className="flex items-center space-x-2 text-indigo-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                AI Recruiter Executive Summary
              </h3>
            </div>

            {report?.report?.overallFeedback ? (
              <>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {report.report.overallFeedback}
                </p>

                {report.report.recommendations &&
                  report.report.recommendations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        Recommendations
                      </span>
                      <ul className="space-y-1.5">
                        {report.report.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-zinc-300 flex items-start space-x-2"
                          >
                            <span className="text-indigo-400 mt-0.5">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-zinc-500 text-xs">
                Detailed AI feedback unavailable for this session.
              </p>
            )}
          </motion.div>

          {/* Roadmap */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-5 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 flex flex-col justify-between`}
          >
            <div className="flex items-center space-x-2 text-purple-400 mb-4">
              <Compass className="w-5 h-5" />
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                Improvement Roadmap
              </h3>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-start space-x-3">
                <span className="bg-zinc-900 text-purple-400 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-[11px] font-bold text-white">
                    Gaze Anchoring Drill
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Anchor gaze on camera lens. Target 85%+ direct gaze index.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="bg-zinc-900 text-purple-400 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-[11px] font-bold text-white">
                    Silent-Pause Fluency
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Take a brief, controlled breath instead of vocal fill
                    transitions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="bg-zinc-900 text-purple-400 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-[11px] font-bold text-white">
                    Square Shoulder Resets
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Align laptop camera to eye-level to maintain flat skeletal
                    vectors.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </FeatureLock>
  );
}
