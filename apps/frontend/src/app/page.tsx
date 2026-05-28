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
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

const features = [
  {
    icon: Camera,
    title: "MediaPipe Posture Mapping",
    description: "Evaluates shoulder slopes, neck tilt, and posture slumps in real-time to optimize speaker body language.",
    color: "text-indigo-400",
    metric: "0.2s posture lag",
  },
  {
    icon: UserCheck,
    title: "Iris Gaze Vectoring",
    description: "Tracks iris coordinates and blinking frequencies relative to the screen to guarantee direct recruiter engagement.",
    color: "text-emerald-400",
    metric: "98.4% coordinate precision",
  },
  {
    icon: Mic,
    title: "Whisper Speech Analytics",
    description: "Identifies repetitive vocal filler words like 'um' or 'like' and tracks words-per-minute pace trends.",
    color: "text-purple-400",
    metric: "Ultra-low Whisper latency",
  },
  {
    icon: BarChart3,
    title: "ATS-Ready HR Scorecards",
    description: "Converts micro-telemetry logs into white-labeled candidate rubrics shareable directly with Greenhouse or Lever portals.",
    color: "text-amber-400",
    metric: "Greenhouse sync enabled",
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [particles, setParticles] = useState<{id: number; x: number; y: number; size: number; duration: number; delay: number; xOffset: number}[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 20 + 20,
        delay: Math.random() * 5,
        xOffset: Math.random() * 60 - 30,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative bg-[#09090b] pb-12 overflow-x-hidden">
      {/* Floating particles background */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-indigo-500/10 rounded-full pointer-events-none z-0"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -180, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Cinematic grid overlay and glowing light matrices */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />
      
      {/* Floating abstract glowing particle nodes */}
      <div className="absolute top-[250px] left-[5%] w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-[600px] right-[5%] w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 ${GLASSMORPHISM_STYLES.header}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-black text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            InterviewMirror AI
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-zinc-500">
          <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
          <Link href="/pricing" className="hover:text-zinc-200 transition-colors">Pricing</Link>
          <a href="#demo" className="hover:text-zinc-200 transition-colors">Interactive Demo</a>
          <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/auth" className={INTERACTION_CLASSES.secondaryButton}>
            Sign In
          </Link>
          <Link href="/auth" className={INTERACTION_CLASSES.primaryButton}>
            <span>Initialize Sandbox</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-16 md:pt-24 flex flex-col items-center">
        
        {/* Hero Segment */}
        <div className="text-center max-w-3xl mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-zinc-900/60 border border-zinc-800 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm shadow-indigo-950/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED BEHAVIORAL TELEMETRY SUITE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-heading font-black text-4xl sm:text-7xl tracking-tight leading-[1.05] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-6"
          >
            Mirror your speaking habits. Ace your next interview.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base text-zinc-500 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Analyze real-time postural slump angles, iris gaze focus, and vocal transitions using secure browser computer vision and speech models. Open white-labeled report cards for Greenhouse and recruiter circles instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/auth"
              className={`${INTERACTION_CLASSES.primaryButton} py-3 px-6 text-xs shadow-xl shadow-white/5`}
            >
              <span>Initialize Mock Sandbox</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/pricing"
              className={`${INTERACTION_CLASSES.secondaryButton} py-3 px-6 text-xs`}
            >
              Compare subscription plans
            </Link>
          </motion.div>
        </div>

        {/* Live Chamber Interactive Telemetry Simulator Widget */}
        <section id="demo" className="w-full mb-24 max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Live Sandbox Interface</div>
            <h3 className="font-heading font-bold text-lg text-white mt-1">Immersive Interview Chamber Preview</h3>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${GLASSMORPHISM_STYLES.card} p-2 bg-zinc-950/40 border-zinc-800 shadow-2xl relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-600/5 opacity-40 blur-xl pointer-events-none" />
            
            <div className="rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950 flex flex-col min-h-[350px] md:min-h-[440px]">
              {/* Toolbar */}
              <div className="bg-zinc-900/60 border-b border-zinc-900/80 px-4 py-3 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/50" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
                <div className="font-mono text-[9px] tracking-wider uppercase text-zinc-400 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Interactive Chamber Simulator</span>
                </div>
                <span className="w-4" />
              </div>

              {/* Viewport Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 p-4 gap-4">
                {/* Left Column: Simulated Webcam Landmark Scan */}
                <div className="md:col-span-7 bg-[#0b0b0e] rounded-lg border border-zinc-900 p-4 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                  
                  {/* Skeletal and Gaze Vector Line Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg className="w-64 h-64 text-indigo-500" viewBox="0 0 200 200">
                      {/* Head */}
                      <circle cx="100" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
                      {/* Gaze focus points */}
                      <line x1="90" y1="46" x2="60" y2="40" stroke="#10b981" strokeWidth="1.5" />
                      <line x1="110" y1="46" x2="140" y2="40" stroke="#10b981" strokeWidth="1.5" />
                      <circle cx="60" cy="40" r="3" fill="#10b981" />
                      <circle cx="140" cy="40" r="3" fill="#10b981" />
                      {/* Shoulder landmarks */}
                      <line x1="60" y1="100" x2="140" y2="100" stroke="currentColor" strokeWidth="2" />
                      <line x1="100" y1="74" x2="100" y2="100" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="60" cy="100" r="4" fill="currentColor" />
                      <circle cx="140" cy="100" r="4" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 bg-zinc-950/80 py-1 px-2.5 rounded border border-zinc-900 self-start z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping mr-1.5" />
                    <span>MediaPipe Gaze Coordinates: Calibrated (88% Target Focus)</span>
                  </div>

                  <div className="flex items-center space-x-2.5 self-end bg-zinc-950/90 p-2.5 rounded-lg border border-zinc-900 z-10 w-full">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
                    <div className="flex-1 font-mono text-[9px] text-zinc-300 leading-normal">
                      &quot;We deployed our edge proxy to... <span className="text-purple-400 font-bold bg-purple-950/20 px-1 rounded">like</span>... optimize cold-start margins, and... <span className="text-purple-400 font-bold bg-purple-950/20 px-1 rounded">um</span>... it synced flawlessly.&quot;
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Aggregates */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Overall score telemetry</h4>
                      <div className="text-3xl font-heading font-black text-white mt-1">84.5%</div>
                    </div>
                    <div className="w-full bg-zinc-950/60 rounded-full h-1.5 border border-zinc-900 mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "84%" }} />
                    </div>
                  </div>

                  <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg flex-1 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Verbal Filler density</h4>
                      <div className="text-lg font-bold text-zinc-200 mt-0.5">2 Filters flagged</div>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">-40% vs baseline</span>
                  </div>

                  <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg flex-1 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Shoulder slumping posture</h4>
                      <div className="text-xs font-semibold text-zinc-300 mt-0.5">Optimal alignment (0 slumps)</div>
                    </div>
                    <Check className="w-5 h-5 text-emerald-400 bg-emerald-950/20 p-1 rounded-full border border-emerald-900/30" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full mb-24 pt-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Platform Capabilities</div>
            <h2 className="font-heading font-black text-2xl md:text-4xl tracking-tight text-white mt-1">
              Cinematic metrics built for production talent
            </h2>
            <p className="text-xs md:text-sm text-zinc-500 mt-2">
              Our multi-threaded browser pipelines process facial vectors and speaking cadences instantly in real-time.
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
                  className={`${GLASSMORPHISM_STYLES.card} p-5 group hover:border-zinc-700 hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between min-h-[200px] bg-zinc-950/20`}
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <IconComp className={`w-4.5 h-4.5 ${feat.color}`} />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-zinc-200 group-hover:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                    <span>Performance Matrix</span>
                    <span className="text-indigo-400">{feat.metric}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ATS & Greenhouse Integration Showcase */}
        <section className={`${GLASSMORPHISM_STYLES.card} w-full p-8 md:p-12 border border-indigo-900/30 bg-zinc-900/10 rounded-2xl relative overflow-hidden mb-24`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-1.5 bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Greenhouse & Lever ATS Integration ready</span>
              </div>
              <h3 className="font-heading font-black text-2xl md:text-3xl text-white">
                Export public share links to recruiter loops automatically
              </h3>
              <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">
                Turn mock session assessments into white-labeled candidate verification profiles. Enable or disable recruiter links, provide summaries, and demonstrate communication readiness with complete candidate authorization.
              </p>
              
              <Link
                href="/auth"
                className={`${INTERACTION_CLASSES.primaryButton} py-2.5 text-xs inline-flex items-center`}
              >
                <span>Request recruiter sandbox</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            <div className="md:col-span-5 bg-zinc-950/80 rounded-xl p-4 border border-zinc-900 leading-relaxed text-xs text-zinc-400 font-mono flex flex-col space-y-3 shadow-2xl relative">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-xl blur-lg pointer-events-none" />
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-[10px] text-zinc-500 uppercase">Shareable profile link</span>
                <span className="text-[9px] text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#10b981]/30 font-bold">Active</span>
              </div>
              <div className="text-[11px]">
                <span className="text-zinc-500">URL: </span>
                <span className="text-indigo-400 select-all font-bold">interviewmirror.ai/share/sm-992</span>
              </div>
              <div className="text-[10px] text-zinc-500 bg-[#09090b]/80 p-3 rounded border border-zinc-900 leading-normal">
                &quot;Srikar demonstrated highly consistent gaze coordinates (91% targeted target focus) and excellent posture controls during complex multi-threaded architectural breakdowns.&quot;
              </div>
            </div>
          </div>
        </section>

        {/* Premium Testimonial Carousel */}
        <section className="w-full max-w-3xl mb-24">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest font-mono">User Success Stories</div>
            <h2 className="font-heading font-black text-xl md:text-2xl tracking-tight text-white mt-1">Mastered by candidates landing top-tier roles</h2>
          </div>

          <div className={`${GLASSMORPHISM_STYLES.card} p-8 border-zinc-900/60 bg-zinc-950/20 text-center relative overflow-hidden`}>
            <div className="absolute top-4 left-4 text-zinc-800 text-6xl font-serif pointer-events-none opacity-20">&ldquo;</div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 relative z-10"
              >
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  {testimonials[activeTestimonial].feedback}
                </p>
                
                <div>
                  <div className="font-bold text-zinc-100 text-xs">{testimonials[activeTestimonial].name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{testimonials[activeTestimonial].role}</div>
                </div>

                <span className="inline-flex items-center text-[10px] text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 rounded-full px-3 py-1 font-mono">
                  <Star className="w-3 h-3 fill-current mr-1 text-[#10b981]" />
                  {testimonials[activeTestimonial].score}
                </span>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${activeTestimonial === idx ? "bg-white" : "bg-zinc-800"}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="w-full max-w-3xl mb-24">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Platform Documentation</div>
            <h2 className="font-heading font-black text-xl md:text-2xl tracking-tight text-white mt-1">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`${GLASSMORPHISM_STYLES.card} overflow-hidden cursor-pointer transition-all ${
                  openFaq === idx ? "border-zinc-700 bg-zinc-900/10" : "border-zinc-900 hover:border-zinc-800"
                }`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="p-4 flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-zinc-900/60"
                    >
                      <p className="p-4 text-xs text-zinc-500 leading-relaxed bg-[#0b0b0e]/30">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Action Panel */}
        <section className="w-full max-w-4xl text-center py-14 px-6 rounded-2xl bg-gradient-to-b from-zinc-900/20 to-zinc-950 border border-zinc-900/80 relative overflow-hidden group mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-radial-glowing-effect pointer-events-none opacity-20" />

          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-4">
            Ace your next tech interview with dynamic telemetry
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
            Configure mock sessions, record directly from your web portal, and review consolidated assessments within minutes.
          </p>

          <Link
            href="/auth"
            className={`${INTERACTION_CLASSES.primaryButton} py-3 px-8 shadow-xl shadow-indigo-500/5 text-xs`}
          >
            <span>Start mock sandbox free</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-950 bg-[#070709] py-10 px-6 text-center text-[10px] text-zinc-600 relative z-10">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <span className="font-heading font-black text-sm text-zinc-400">
              InterviewMirror AI
            </span>
          </div>
          <div className="flex items-center space-x-6 text-zinc-500">
            <span className="hover:text-zinc-400 cursor-pointer">Security Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Guidelines</span>
          </div>
          <div>© 2026 InterviewMirror AI Platform. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
