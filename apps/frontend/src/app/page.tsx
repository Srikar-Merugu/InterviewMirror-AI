"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  Mic,
  Play,
  ChevronDown,
  Check,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  UserCheck,
  BarChart3,
  Star,
  ArrowUpRight,
  Lock,
  Zap,
  Award,
  Quote,
  BrainCircuit,
  LineChart,
  Globe,
  ChevronRight,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
import { Navbar } from "@/components/ui/Navbar";

const features = [
  {
    icon: Camera,
    title: "MediaPipe Posture Mapping",
    description: "Evaluates shoulder slopes, neck tilt, and posture slumps in real-time to optimize speaker body language.",
    color: "text-indigo-400",
    metric: "0.2s posture lag",
    gradient: "from-indigo-500/10 to-indigo-500/5",
  },
  {
    icon: UserCheck,
    title: "Iris Gaze Vectoring",
    description: "Tracks iris coordinates and blinking frequencies relative to the screen to guarantee direct recruiter engagement.",
    color: "text-emerald-400",
    metric: "98.4% coordinate precision",
    gradient: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    icon: Mic,
    title: "Whisper Speech Analytics",
    description: "Identifies repetitive vocal filler words like 'um' or 'like' and tracks words-per-minute pace trends.",
    color: "text-purple-400",
    metric: "Ultra-low Whisper latency",
    gradient: "from-purple-500/10 to-purple-500/5",
  },
  {
    icon: BarChart3,
    title: "ATS-Ready HR Scorecards",
    description: "Converts micro-telemetry logs into white-labeled candidate rubrics shareable directly with Greenhouse or Lever portals.",
    color: "text-amber-400",
    metric: "Greenhouse sync enabled",
    gradient: "from-amber-500/10 to-amber-500/5",
  },
];

const testimonials = [
  {
    name: "Richard Hendricks",
    role: "Core Infrastructure Architect, Pied Piper",
    feedback: "The MediaPipe posture metrics and Whisper filler-word counters completely transformed my pitch confidence. I was able to verify my gaze coordinates and present Pied Piper with 95% overall speaking confidence.",
    score: "98% overall telemetry score",
    avatar: "RH",
  },
  {
    name: "Srikar Merugu",
    role: "Senior AI Product Lead",
    feedback: "InterviewMirror is enterprise-grade mock prep at scale. The recruiter analytics dashboard gives developers transparent insights into their communication posture. Flawless Vercel and MongoDB execution.",
    score: "10/10 platform reliability",
    avatar: "SM",
  },
];

const faqs = [
  {
    question: "How does the live webcam telemetry analysis function?",
    answer: "When you start a session in the InterviewMirror chamber, our sandboxed client-side framework initializes webcam and microphone hooks. Live landmark grids estimate posture slump events and iris gaze coordinates. Whisper transcribes responses on the backend to yield filler word analytics.",
  },
  {
    question: "Is raw camera recording or audio data persisted?",
    answer: "No. Privacy is a foundational pillar of our architecture. raw video streams are processed completely inside browser memory space using WebGL landmark mapping. Only normalized coordinate vectors are sent to secure servers to compile overall score aggregations.",
  },
  {
    question: "Can I directly share my completed sessions with recruiter loops?",
    answer: "Yes. Every consolidated mock assessment page has a share toggle that instantly compiles a public white-labeled evaluation card. You can attach this Greenhouse-ready card to applications or email digests.",
  },
];

const TRUST_COMPANIES = [
  "Vercel", "Linear", "Stripe", "Notion", "Figma", "Replit"
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{id: number; x: number; y: number; size: number; duration: number; delay: number; xOffset: number}[]>([]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 5,
        xOffset: Math.random() * 60 - 30,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative bg-[#0a0a0b] overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/8 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none z-0" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="fixed bg-indigo-500/10 rounded-full pointer-events-none z-0"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -180, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.05, 0.3, 0.05],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <Navbar />

      <main className="relative z-10">
        {/* ─── HERO ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI-POWERED BEHAVIORAL TELEMETRY SUITE</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-6"
              >
                <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
                  Mirror your habits.
                </span>
                <br />
                <span className="premium-gradient-text">
                  Ace your interview.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base text-zinc-500 leading-relaxed max-w-2xl mx-auto mb-10"
              >
                Analyze real-time postural slump angles, iris gaze focus, and vocal transitions using secure browser computer vision and speech models. Open white-labeled report cards for Greenhouse and recruiter circles instantly.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/auth"
                  className="premium-btn premium-btn-primary text-sm px-8 py-3.5 group"
                >
                  <span>Initialize Mock Sandbox</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="premium-btn premium-btn-secondary text-sm px-8 py-3.5"
                >
                  Compare subscription plans
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16"
              >
                <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-4 font-medium">
                  Trusted by engineers from
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                  {TRUST_COMPANIES.map((company) => (
                    <span
                      key={company}
                      className="text-sm font-semibold text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── LIVE CHAMBER PREVIEW ─── */}
        <section id="demo" className="relative pb-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] font-mono mb-2">
                Live Sandbox Interface
              </div>
              <h3 className="font-heading font-bold text-2xl text-white">
                Immersive Interview Chamber Preview
              </h3>
              <p className="text-sm text-zinc-500 mt-2 max-w-xl mx-auto">
                Experience the real-time telemetry dashboard that captures every dimension of your communication presence.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl overflow-hidden"
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y * 0.02}deg) rotateY(${mousePos.x * 0.02}deg)`,
              }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Interactive Chamber Simulator — v2.4.1
                </div>
                <span className="w-14" />
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6">
                {/* Left: Webcam / Visualization */}
                <div className="md:col-span-7 bg-white/[0.02] rounded-xl border border-white/[0.04] p-5 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
                  {/* Skeletal overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <svg className="w-72 h-72 text-indigo-500" viewBox="0 0 200 200">
                      <circle cx="100" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1="90" y1="46" x2="60" y2="40" stroke="#10b981" strokeWidth="1.5" />
                      <line x1="110" y1="46" x2="140" y2="40" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="60" cy="40" r="3" fill="#10b981" />
                      <circle cx="140" cy="40" r="3" fill="#10b981" />
                      <line x1="60" y1="100" x2="140" y2="100" stroke="currentColor" strokeWidth="2" />
                      <line x1="100" y1="74" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="60" cy="100" r="4" fill="currentColor" />
                      <circle cx="140" cy="100" r="4" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 py-1.5 px-3 rounded-lg border border-emerald-900/30 self-start z-10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>MediaPipe Gaze Coordinates: Calibrated (88% Target Focus)</span>
                  </div>

                  {/* Transcription */}
                  <div className="flex items-start gap-2.5 bg-[#0a0a0b]/80 p-3 rounded-xl border border-white/[0.04] z-10 w-full backdrop-blur-sm">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                      &ldquo;We deployed our edge proxy to... <span className="text-purple-400 font-semibold bg-purple-950/30 px-1 rounded">like</span>... optimize cold-start margins, and... <span className="text-purple-400 font-semibold bg-purple-950/30 px-1 rounded">um</span>... it synced flawlessly.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex-1 flex flex-col justify-center">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Overall Score Telemetry</div>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-heading font-black premium-gradient-text">84.5%</span>
                      <span className="text-xs text-emerald-400 mb-1.5 font-medium">+12% vs baseline</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5 mt-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "84%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Verbal Filler Density</div>
                      <div className="text-lg font-bold text-zinc-200 mt-0.5">2 Flags Detected</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-900/30">
                      -40% vs baseline
                    </span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Shoulder Slumping Posture</div>
                      <div className="text-sm font-semibold text-zinc-300 mt-0.5">Optimal alignment (0 slumps)</div>
                    </div>
                    <Check className="w-5 h-5 text-emerald-400 bg-emerald-950/30 p-1 rounded-lg border border-emerald-900/30" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="relative pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] font-mono mb-2">
                Platform Capabilities
              </div>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white mb-3">
                Cinematic metrics built for{" "}
                <span className="premium-gradient-text">production talent</span>
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Our multi-threaded browser pipelines process facial vectors and speaking cadences instantly in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card rounded-2xl p-6 group glass-card-hover"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} border border-white/[0.04] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className={`w-5 h-5 ${feat.color}`} />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-zinc-200 group-hover:text-white mb-2 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                      {feat.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[10px] font-mono text-zinc-600">
                      <span>Performance Matrix</span>
                      <span className={`${feat.color} font-semibold`}>{feat.metric}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── ATS INTEGRATION ─── */}
        <section className="relative pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-3xl overflow-hidden border-indigo-500/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 p-8 md:p-12 items-center">
                <div className="md:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Greenhouse & Lever ATS Integration ready</span>
                  </div>
                  <h3 className="font-heading font-black text-2xl md:text-3xl text-white leading-tight">
                    Export public share links to <br />
                    <span className="premium-gradient-text">recruiter loops</span> automatically
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                    Turn mock session assessments into white-labeled candidate verification profiles. Enable or disable recruiter links, provide summaries, and demonstrate communication readiness with complete candidate authorization.
                  </p>
                  <Link
                    href="/auth"
                    className="premium-btn premium-btn-primary text-sm mt-2 inline-flex"
                  >
                    <span>Request recruiter sandbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="md:col-span-5">
                  <div className="bg-[#0a0a0b]/80 rounded-2xl p-5 border border-white/[0.04] space-y-3 shadow-2xl relative">
                    <div className="absolute inset-0 bg-indigo-500/3 rounded-2xl blur-lg pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 relative">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Shareable Profile Link</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded-lg border border-emerald-900/30 font-bold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </div>
                    <div className="text-xs relative">
                      <span className="text-zinc-500">URL: </span>
                      <span className="text-indigo-400 select-all font-mono font-bold">interviewmirror.ai/share/sm-992</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 bg-[#0a0a0b]/50 p-4 rounded-xl border border-white/[0.03] leading-relaxed relative font-mono">
                      &ldquo;Srikar demonstrated highly consistent gaze coordinates (91% targeted target focus) and excellent posture controls during complex multi-threaded architectural breakdowns.&rdquo;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="relative pb-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] font-mono mb-2">
                User Success Stories
              </div>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white">
                Mastered by candidates landing{" "}
                <span className="premium-gradient-text">top-tier roles</span>
              </h2>
            </div>

            <div className="glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-white/[0.03]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5 relative z-10"
                >
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed italic">
                    &ldquo;{testimonials[activeTestimonial].feedback}&rdquo;
                  </p>

                  <div>
                    <div className="font-bold text-zinc-100 text-sm">{testimonials[activeTestimonial].name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{testimonials[activeTestimonial].role}</div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 rounded-full px-3.5 py-1.5 font-mono">
                    <Star className="w-3 h-3 fill-current" />
                    {testimonials[activeTestimonial].score}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeTestimonial === idx
                        ? "bg-indigo-400 w-6"
                        : "bg-zinc-700 hover:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="relative pb-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-[0.2em] font-mono mb-2">
                Platform Documentation
              </div>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`glass-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    openFaq === idx
                      ? "border-indigo-500/20"
                      : "hover:border-white/[0.08]"
                  }`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm font-semibold text-zinc-200">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 transition-transform duration-300 flex-shrink-0 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="border-t border-white/[0.04] px-5 py-4">
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative pb-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-3xl p-12 md:p-16 text-center relative overflow-hidden border-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mb-4 leading-tight">
                  Ace your next tech interview with{" "}
                  <span className="premium-gradient-text">dynamic telemetry</span>
                </h2>
                <p className="text-sm text-zinc-500 max-w-lg mx-auto mb-8 leading-relaxed">
                  Configure mock sessions, record directly from your web portal, and review consolidated assessments within minutes.
                </p>

                <Link
                  href="/auth"
                  className="premium-btn premium-btn-primary text-sm px-10 py-3.5 group"
                >
                  <span>Start mock sandbox free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.03] bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-heading font-bold text-sm text-zinc-400">
                InterviewMirror AI
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">Security Policy</span>
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy Guidelines</span>
            </div>
            <div className="text-xs text-zinc-700">
              &copy; 2026 InterviewMirror AI Platform. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
