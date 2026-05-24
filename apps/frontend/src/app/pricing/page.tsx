"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquareCode,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

const pricingTiers = [
  {
    name: "Mock Sandbox",
    description:
      "Perfect for candidates trying out AI evaluations for the first time.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 simulated mock session / mo",
      "Head posture slump sampler",
      "Filler words count analytics",
      "Basic transcription logs",
      "Standard-grade dashboard entry",
    ],
    cta: "Start Free Sandbox",
    href: "/auth",
    icon: MessageSquareCode,
    glow: "group-hover:bg-zinc-800/10",
  },
  {
    name: "Professional Candidate",
    description:
      "Highly optimized for job seekers aiming to wow Silicon Valley recruiters.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    features: [
      "Unlimited AI Mock Sessions",
      "Real-time webcam iris gaze tracking",
      "MediaPipe head & shoulder posture metrics",
      "Whisper STT verbal filler count breakdowns",
      "Complete HR-style feedback scorecards",
      "Detailed checklist guidelines",
      "Recruiter-shareable public profiles",
    ],
    cta: "Get Professional",
    href: "/auth",
    popular: true,
    icon: Zap,
    glow: "group-hover:bg-indigo-600/15",
  },
  {
    name: "Recruiter Enterprise",
    description:
      "Custom tailored for corporate HR departments and tech recruitment hubs.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "Everything in Professional",
      "Multiple sharing links controls",
      "White-labeled recruiter evaluation cards",
      "Custom interview rubric templates",
      "SLA processing speeds priority",
      "Dedicated account managers support",
      "SSO/SAML corporate logins",
    ],
    cta: "Contact Enterprise",
    href: "mailto:enterprise@interviewmirror.com",
    icon: Globe,
    glow: "group-hover:bg-purple-600/15",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative pb-12 bg-canvas">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 right-0 h-[600px] radial-glowing-effect pointer-events-none z-0" />

      {/* Pricing Header bar */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 ${GLASSMORPHISM_STYLES.header}`}
      >
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            InterviewMirror AI
          </span>
        </Link>

        <Link href="/auth" className={INTERACTION_CLASSES.secondaryButton}>
          Sign In
        </Link>
      </header>

      {/* Main pricing content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRICING MODELS FOR CANDIDATES AND TEAMS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-black text-3xl md:text-5xl tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4"
          >
            Flexible plans for absolute interview confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm md:text-base text-zinc-400 leading-relaxed"
          >
            Train with our standard CV tracking model, eliminate speech fillers,
            analyze direct camera gaze focal coordinates, and unlock recruiter
            analytics.
          </motion.p>
        </div>

        {/* Billing cycle toggles */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-zinc-950/80 border border-zinc-900 p-1 rounded-full flex items-center space-x-1 relative">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 relative z-10 ${
                billingCycle === "monthly"
                  ? "text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 relative z-10 ${
                billingCycle === "yearly"
                  ? "text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Yearly (save 20%)
            </button>
            <motion.div
              layout
              className="absolute inset-y-1 rounded-full bg-white z-0"
              style={{
                left: billingCycle === "monthly" ? 4 : "52%",
                width: billingCycle === "monthly" ? "92px" : "110px",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pricingTiers.map((tier, idx) => {
            const IconComponent = tier.icon;
            const price =
              billingCycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                className={`${GLASSMORPHISM_STYLES.card} p-6 flex flex-col relative overflow-hidden group hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 ${
                  tier.popular ? "border-indigo-500/50 bg-zinc-900/50" : ""
                }`}
              >
                {/* Glow layer */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${tier.glow}`}
                />

                {tier.popular && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-xl">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed min-h-[40px]">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6 flex items-baseline space-x-1">
                  <span className="text-3xl font-heading font-black text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-zinc-500">/ user / mo</span>
                </div>

                <Link
                  href={tier.href}
                  className={`w-full ${
                    tier.popular
                      ? INTERACTION_CLASSES.primaryButton
                      : INTERACTION_CLASSES.secondaryButton
                  } mb-6`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>

                <hr className="border-zinc-950/80 mb-6" />

                <ul className="space-y-3 flex-1 text-xs text-zinc-400">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Reliability badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-950/80 pt-12 text-center">
          <div className="flex flex-col items-center p-4">
            <ShieldCheck className="w-8 h-8 text-indigo-500 mb-2" />
            <h4 className="font-heading font-semibold text-sm mb-1">
              Secure processing models
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Video processing layers run in completely sandboxed cloud frames,
              maintaining strict candidate privacy policies.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Check className="w-8 h-8 text-emerald-500 mb-2" />
            <h4 className="font-heading font-semibold text-sm mb-1">
              Instant Cancellation
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Easily change, upgrade, or pause subscription parameters at any
              point from account settings with 100% data export.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Zap className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-heading font-semibold text-sm mb-1">
              Recruiter Integrations
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Instantly link generated profiles to Greenhouse, Lever, and
              Greenhouse HR portals using public sharing triggers.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-zinc-950/80 pt-6 text-center text-[10px] text-zinc-600">
        © 2026 InterviewMirror AI Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
