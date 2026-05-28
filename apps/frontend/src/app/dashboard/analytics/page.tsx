"use client";

import React, { useState } from "react";
import { FeatureLock } from "@/components/FeatureLock";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { GLASSMORPHISM_STYLES } from "@interviewmirror/ui";

// Mock Historical Sessions Data with rich metrics from our AI Engine
const historicalSessions = [
  {
    id: "session-007",
    date: "May 23, 2026",
    category: "System Design",
    scores: {
      postureScore: 92,
      eyeContactScore: 94,
      engagementScore: 90,
      confidenceScore: 89,
      communicationScore: 88,
      professionalismScore: 91,
    },
    recommendation: "Strong Hire",
    summary:
      "The candidate shows outstanding visual stability and excellent technical fluency. Posture remains flat and stable with minimal head tilt. Eye contact is consistently anchored on the camera lens, demonstrating robust command under system architecture questions.",
    strengths: [
      "Exceptional eye contact consistency (94% direct gaze focus).",
      "Rigid, upright posture with shoulder tilt flat under 2 degrees.",
      "Clear, professional communication style with high technical vocabulary.",
    ],
    weaknesses: [
      "Slight pause score fluctuation during complex SSR database questions.",
      "Uses a minor vocal pause ('like') when thinking through latency tradeoffs.",
    ],
    fillers: { like: 2, um: 1, uh: 0, actually: 1, basically: 0 },
    wpm: 128,
    timeline: [
      { t: 0, eye: 95, pose: 94, wpm: 130 },
      { t: 10, eye: 93, pose: 92, wpm: 125 },
      { t: 20, eye: 90, pose: 93, wpm: 128 },
      { t: 30, eye: 96, pose: 91, wpm: 132 },
      { t: 40, eye: 94, pose: 92, wpm: 126 },
      { t: 50, eye: 92, pose: 90, wpm: 129 },
    ],
  },
  {
    id: "session-006",
    date: "May 18, 2026",
    category: "Data Structures",
    scores: {
      postureScore: 82,
      eyeContactScore: 80,
      engagementScore: 78,
      confidenceScore: 79,
      communicationScore: 82,
      professionalismScore: 80,
    },
    recommendation: "Hire",
    summary:
      "Solid overall session. The candidate displays strong data structure fundamentals, but exhibits minor visual distractions. Gaze offsets occur frequently when writing out complex recursion loops on screen.",
    strengths: [
      "Natural verbal fluency with good speech rate consistency.",
      "Professional vocabulary choices throughout the array complexity walkthrough.",
    ],
    weaknesses: [
      "Eye contact drops when looking at auxiliary screens.",
      "Shows shoulder slumping towards the 40-second interval of explanation.",
    ],
    fillers: { like: 5, um: 3, uh: 1, actually: 2, basically: 1 },
    wpm: 145,
    timeline: [
      { t: 0, eye: 85, pose: 85, wpm: 140 },
      { t: 10, eye: 82, pose: 83, wpm: 146 },
      { t: 20, eye: 78, pose: 80, wpm: 148 },
      { t: 30, eye: 80, pose: 82, wpm: 142 },
      { t: 40, eye: 75, pose: 79, wpm: 145 },
      { t: 50, eye: 81, pose: 81, wpm: 147 },
    ],
  },
  {
    id: "session-005",
    date: "May 12, 2026",
    category: "HR & Leadership",
    scores: {
      postureScore: 74,
      eyeContactScore: 68,
      engagementScore: 70,
      confidenceScore: 72,
      communicationScore: 74,
      professionalismScore: 72,
    },
    recommendation: "Needs Practice",
    summary:
      "Candidate displays general leadership competence, but lacks structural confidence. Multiple posture slumps and camera alignment shifts occur, accompanied by standard verbal fill phrases.",
    strengths: [
      "Approachable positive vocal tone and warm emotional smiles.",
      "Clear articulation of team leadership conflict scenario.",
    ],
    weaknesses: [
      "High density of vocal filler terms (14 fillers detected).",
      "Significant posture slumping (slump event logged at 25s).",
    ],
    fillers: { like: 8, um: 6, uh: 3, actually: 4, basically: 2 },
    wpm: 156,
    timeline: [
      { t: 0, eye: 75, pose: 78, wpm: 150 },
      { t: 10, eye: 70, pose: 75, wpm: 155 },
      { t: 20, eye: 65, pose: 72, wpm: 160 },
      { t: 30, eye: 68, pose: 70, wpm: 158 },
      { t: 40, eye: 64, pose: 73, wpm: 154 },
      { t: 50, eye: 70, pose: 74, wpm: 156 },
    ],
  },
];

// Radar overall profile comparison setup
const radarData = [
  { dimension: "Posture", current: 92, baseline: 74 },
  { dimension: "Eye Contact", current: 94, baseline: 68 },
  { dimension: "Engagement", current: 90, baseline: 70 },
  { dimension: "Confidence", current: 89, baseline: 72 },
  { dimension: "Fluency", current: 88, baseline: 74 },
  { dimension: "Poise", current: 91, baseline: 72 },
];

const tooltipStyle = {
  backgroundColor: "#09090b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#e4e4e7",
};

export default function AnalyticsDashboard() {
  const [selectedSessionId, setSelectedSessionId] =
    useState<string>("session-007");
  const [activeScoreTab, setActiveScoreTab] = useState<
    "visual" | "vocal" | "nlp"
  >("visual");

  const currentSession =
    historicalSessions.find((s) => s.id === selectedSessionId) ||
    historicalSessions[0];

  // Map fillers into Recharts array
  const fillerChartData = Object.entries(currentSession.fillers).map(
    ([key, val]) => ({
      name: key,
      count: val,
    }),
  );

  return (
    <FeatureLock featureKey="analytics">
    <div className="space-y-6">
      {/* Header controls */}
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

        {/* Dynamic Session selector */}
        <div className="flex items-center space-x-2 bg-zinc-950/60 border border-zinc-900 rounded-lg p-1 text-[11px] self-start md:self-auto">
          {historicalSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedSessionId === session.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {session.category} ({session.id.replace("session-", "S")})
            </button>
          ))}
        </div>
      </div>

      {/* Main Score summary widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${GLASSMORPHISM_STYLES.card} p-4 border-zinc-900/60 flex flex-col justify-between`}
        >
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Professionalism
          </span>
          <div className="text-3xl font-heading font-black text-white mt-1 flex items-baseline gap-1">
            {currentSession.scores.professionalismScore}%
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3" /> +19%
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">
            Recruiter evaluation metric
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
            className={`text-2xl font-heading font-black mt-1 ${
              currentSession.recommendation === "Strong Hire"
                ? "text-emerald-400"
                : currentSession.recommendation === "Hire"
                  ? "text-indigo-400"
                  : "text-amber-400"
            }`}
          >
            {currentSession.recommendation}
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
            {currentSession.wpm}{" "}
            <span className="text-xs text-zinc-500">WPM</span>
          </div>
          <span
            className={`text-[10px] mt-1 ${currentSession.wpm >= 120 && currentSession.wpm <= 145 ? "text-emerald-400" : "text-amber-400"}`}
          >
            {currentSession.wpm >= 120 && currentSession.wpm <= 145
              ? "Optimal Speech Range"
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
            {roundPercentage(
              Object.values(currentSession.fillers).reduce((a, b) => a + b, 0),
            )}
            %
          </div>
          <span className="text-[10px] text-zinc-500 mt-1">
            Total vocal filler penalty ratio
          </span>
        </motion.div>
      </div>

      {/* Competency profile radar & Timeline logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Radar Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-5 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Profile Competency Benchmark
            </h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full">
              S7 vs S5 Baseline
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
                name="S7 Peak Performance"
                dataKey="current"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="S5 Initial Baseline"
                dataKey="baseline"
                stroke="#ef4444"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 9, color: "#71717a" }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right column: Interactive real-time metrics trend line */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:col-span-7 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Real-time Session Telemetry Timeline
            </h3>

            {/* Sub-tabs */}
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
                  data={currentSession.timeline}
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
                    domain={[50, 100]}
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
                  data={currentSession.timeline}
                  margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                  <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#71717a" }} />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#71717a" }}
                    domain={[100, 170]}
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
                  data={fillerChartData}
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

      {/* Recruiter Evaluation Notes & Strengths / Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiter AI Summary */}
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
          <p className="text-zinc-400 text-xs leading-relaxed">
            {currentSession.summary}
          </p>

          {/* Highlights grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Key Strengths
              </span>
              <ul className="space-y-1.5">
                {currentSession.strengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-zinc-300 flex items-start space-x-2"
                  >
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Target Areas
              </span>
              <ul className="space-y-1.5">
                {currentSession.weaknesses.map((wk, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-zinc-300 flex items-start space-x-2"
                  >
                    <span className="text-red-400 mt-0.5">⚠</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 3-Step Growth Training Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-5 ${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 flex flex-col justify-between`}
        >
          <div className="flex items-center space-x-2 text-purple-400 mb-4">
            <Compass className="w-5 h-5" />
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-300">
              10-Day Calibration Roadmap
            </h3>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-start space-x-3">
              <span className="bg-zinc-900 text-purple-400 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                1
              </span>
              <div>
                <h4 className="text-[11px] font-bold text-white">
                  Step 1: Gaze Anchoring Drill
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
                  Step 2: Silent-Pause Fluency
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
                  Step 3: Square Shoulder resets
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

// Helpers
function roundPercentage(count: number): string {
  if (count <= 2) return "1.4";
  if (count <= 5) return "3.8";
  return "7.2";
}
