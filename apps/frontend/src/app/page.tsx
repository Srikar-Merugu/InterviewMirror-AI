"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

const features = [
  {
    icon: Camera,
    title: "MediaPipe Posture Mapping",
    description:
      "Evaluates shoulder slopes, slump events, and head tilts to check speaking posture.",
    color: "text-indigo-400",
  },
  {
    icon: UserCheck,
    title: "Iris Gaze Orientation",
    description:
      "Analyzes eye focus vector coordinates relative to screen elements to verify gaze focus.",
    color: "text-emerald-400",
  },
  {
    icon: Mic,
    title: "Whisper filler analysis",
    description:
      "Transcribes audio tracks instantly, flagging repetitive fillers like 'um' or 'like'.",
    color: "text-purple-400",
  },
  {
    icon: BarChart3,
    title: "Recruiter-Ready Reports",
    description:
      "Synthesizes data into shareable HR assessment profiles to highlight growth trends.",
    color: "text-amber-400",
  },
];

const faqs = [
  {
    question: "How does the AI analyze my mock interview?",
    answer:
      "When you start a session, our browser module accesses your webcam stream. In the background, computer vision models analyze posture landmarks and iris gaze coordinates. Whisper transcribes and counts filler word densities. All logs are unified into a final assessment card.",
  },
  {
    question: "Is my camera stream or recording safe?",
    answer:
      "Yes, privacy is our top priority. We do not store raw stream frames. Landmarks are processed directly in your browser, and only vector coordinates are sent to secure servers for overall score aggregation.",
  },
  {
    question: "Can I share my interview results with recruiters?",
    answer:
      "Absolutely! Every session dashboard includes a share toggle. When enabled, it generates a white-labeled recruiter report link that you can attach to applications or share with HR managers.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative bg-canvas pb-12">
      {/* Radial branding glow in background */}
      <div className="absolute top-0 left-0 right-0 h-[700px] radial-glowing-effect pointer-events-none z-0" />

      {/* Header Navigation */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 ${GLASSMORPHISM_STYLES.header}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            InterviewMirror AI
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-zinc-400">
          <a href="#features" className="hover:text-zinc-200 transition-colors">
            Features
          </a>
          <Link
            href="/pricing"
            className="hover:text-zinc-200 transition-colors"
          >
            Pricing
          </Link>
          <a href="#faq" className="hover:text-zinc-200 transition-colors">
            FAQs
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/auth" className={INTERACTION_CLASSES.secondaryButton}>
            Sign In
          </Link>
          <Link href="/auth" className={INTERACTION_CLASSES.primaryButton}>
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-16 md:pt-24 flex flex-col items-center">
        <div className="text-center max-w-3xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED BEHAVIORAL INTELLIGENCE PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-black text-4xl sm:text-6xl tracking-tight leading-[1.1] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-6"
          >
            Mirror your speaking habits. Ace your next interview.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Train with standard computer vision and audio speech models. Verify
            eye contact focus scores, eliminate speech filler words, and share
            analytics instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/auth"
              className={`${INTERACTION_CLASSES.primaryButton} py-3 px-6 text-sm shadow-xl shadow-white/5`}
            >
              <span>Initialize Mock Sandbox</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/pricing"
              className={`${INTERACTION_CLASSES.secondaryButton} py-3 px-6 text-sm`}
            >
              Compare pricing
            </Link>
          </motion.div>
        </div>

        {/* Floating Mockup Preview with Glowing border effects */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className={`${GLASSMORPHISM_STYLES.card} w-full max-w-4xl p-2.5 bg-zinc-900/20 border-zinc-800 shadow-2xl relative group overflow-hidden mb-24`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-600/5 opacity-50 blur-xl pointer-events-none" />

          {/* Dashboard Preview Wrapper */}
          <div className="relative rounded-lg overflow-hidden border border-zinc-950/80 bg-zinc-950 flex flex-col min-h-[350px] md:min-h-[480px]">
            {/* Window bar */}
            <div className="bg-zinc-900/80 border-b border-zinc-950/80 px-4 py-3 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <span className="font-mono text-[10px] tracking-widest uppercase">
                INTERVIEWMIRROR_PREVIEW.SH
              </span>
              <span className="w-4" />
            </div>

            {/* Simulated Live Viewport Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 p-4 gap-4">
              {/* Left Column: Cam simulator */}
              <div className="md:col-span-7 bg-zinc-900/50 rounded-lg border border-zinc-800/80 p-3 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                {/* Simulated scan bounds */}
                <div className="absolute inset-x-8 top-12 bottom-12 border border-dashed border-indigo-500/25 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-indigo-500/20 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 bg-zinc-950/80 py-1 px-2.5 rounded border border-zinc-900 self-start z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse mr-1.5" />
                  <span>MediaPipe Iris Tracking: Active</span>
                </div>

                <div className="flex items-center space-x-2 self-end bg-zinc-950/80 p-2 rounded-lg border border-zinc-900 z-10 w-full">
                  <Play className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div className="flex-1 font-mono text-[9px] text-zinc-400">
                    &quot;So... like, I worked onSSR configurations and... um...
                    standard APIs...&quot;
                  </div>
                </div>
              </div>

              {/* Right Column: Mini aggregates */}
              <div className="md:col-span-5 flex flex-col space-y-3">
                <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-lg flex-1">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Overall AI Score
                  </h4>
                  <div className="text-3xl font-heading font-black text-white mt-1">
                    84.5%
                  </div>
                  <div className="w-full bg-zinc-950/60 rounded-full h-1.5 border border-zinc-900 mt-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: "84%" }}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-lg flex-1">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Speech Filler count
                  </h4>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-2xl font-bold text-zinc-100">
                      4 Filters
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      -30% from last session
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-lg flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Camera gaze focus
                    </h4>
                    <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                      88% (direct direct engagement)
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-emerald-400 bg-emerald-950/20 p-1 rounded-full border border-emerald-900/30" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features list */}
        <section id="features" className="w-full mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Robust multi-modal models built for SaaS scale
            </h2>
            <p className="text-xs md:text-sm text-zinc-500 mt-2">
              Our background pipelines combine OpenCV tracking with Whisper STT
              models to yield deep evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`${GLASSMORPHISM_STYLES.card} p-5 group hover:border-zinc-700 transition-colors`}
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4">
                    <IconComp className={`w-4.5 h-4.5 ${feat.color}`} />
                  </div>
                  <h3 className="font-heading font-semibold text-sm mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recruiter Showcase Banner */}
        <section
          className={`${GLASSMORPHISM_STYLES.card} w-full p-6 md:p-10 border border-indigo-900/30 bg-zinc-900/20 rounded-2xl relative overflow-hidden mb-24`}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RECRUITER VISUAL ANALYTICS REPORT</span>
              </div>
              <h3 className="font-heading font-black text-2xl md:text-3xl text-white mb-3">
                Export and share growth dashboards with hiring teams
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
                Turn mock session assessments into white-labeled candidate
                verification profiles. Enable or disable recruiter links,
                provide summaries, and demonstrate communication readiness.
              </p>

              <Link href="/auth" className={INTERACTION_CLASSES.primaryButton}>
                <span>Request Recruiter Demo</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-900 leading-relaxed text-xs text-zinc-300 font-mono flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-[10px] text-zinc-500 uppercase">
                  Greenhouse integration link
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                  Active
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Share Link: </span>
                <span className="text-indigo-400 select-all">
                  https://interviewmirror.com/report/share-5f8892
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 mt-2 bg-zinc-900/40 p-2.5 rounded border border-zinc-900 leading-normal">
                &quot;Richard demonstrated direct direct engagement vector
                tracking (88%) and highly precise shoulder alignment (85%)
                during complex Node.js architecture walkthroughs.&quot;
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="w-full max-w-3xl mb-20">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`${GLASSMORPHISM_STYLES.card} overflow-hidden cursor-pointer transition-all ${
                  openFaq === idx
                    ? "border-zinc-700 bg-zinc-900/20"
                    : "border-zinc-900/80 hover:border-zinc-800"
                }`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="p-4 flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-zinc-950/80"
                    >
                      <p className="p-4 text-xs text-zinc-400 leading-relaxed bg-[#09090b]/30">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full max-w-4xl text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-zinc-900/40 to-zinc-950 border border-zinc-800/80 relative overflow-hidden group mb-12">
          <div className="absolute inset-0 bg-radial-glowing-effect pointer-events-none opacity-40" />

          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mb-4">
            Ace your next tech interview with AI telemetry
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Configure mock sessions, record directly from your web portal, and
            review consolidated assessments within minutes.
          </p>

          <Link
            href="/auth"
            className={`${INTERACTION_CLASSES.primaryButton} py-3 px-8 shadow-xl shadow-indigo-500/5`}
          >
            <span>Get Started For Free</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-950/80 bg-[#09090b]/80 py-8 px-6 text-center text-[10px] text-zinc-600">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <span className="font-heading font-bold text-sm text-zinc-400">
              InterviewMirror AI
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-zinc-400 cursor-pointer">
              Security Policy
            </span>
            <span className="hover:text-zinc-400 cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-zinc-400 cursor-pointer">
              Privacy Guidelines
            </span>
          </div>
          <div>© 2026 InterviewMirror AI Platform. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
