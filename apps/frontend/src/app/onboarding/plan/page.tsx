"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

const PLANS = [
  {
    id: "FREE",
    name: "Starter",
    price: "$0",
    period: "forever",
    tagline: "Get started with AI interview coaching",
    icon: Sparkles,
    color: "from-zinc-600 to-zinc-700",
    borderColor: "border-zinc-700/50",
    accentColor: "text-zinc-300",
    buttonClass:
      "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600",
    features: [
      "5 mock interviews / month",
      "Basic feedback report",
      "Posture & eye contact scoring",
      "Standard AI question bank",
    ],
    limits: ["No transcript export", "No advanced analytics"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$19",
    period: "per month",
    tagline: "For serious candidates preparing to land offers",
    icon: Zap,
    color: "from-indigo-600 to-violet-600",
    borderColor: "border-indigo-500/50",
    accentColor: "text-indigo-300",
    buttonClass:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 shadow-lg",
    badge: "Most Popular",
    features: [
      "50 mock interviews / month",
      "Full AI behavioral report",
      "Advanced posture analytics",
      "Transcript export (PDF)",
      "Priority AI question bank",
      "Email support",
    ],
    limits: [],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: "$49",
    period: "per month",
    tagline: "Elite preparation for top-tier roles",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/50",
    accentColor: "text-amber-300",
    buttonClass:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-amber-500/25 shadow-lg",
    badge: "Best Value",
    features: [
      "200 mock interviews / month",
      "All Pro features included",
      "AI Recruiter Intelligence dashboard",
      "10-day calibration roadmap",
      "Comparative session benchmarking",
      "Dedicated success manager",
      "Early access to new AI models",
    ],
    limits: [],
  },
];

export default function OnboardingPlanPage() {
  const router = useRouter();
  const { refreshSubscription } = useSubscription();
  const [selected, setSelected] = useState("PRO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    const isDev =
      typeof window !== "undefined" &&
      (window.location.port === "3000" ||
       window.location.hostname === "localhost" ||
       window.location.hostname === "127.0.0.1");
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      (isDev ? `http://${window.location.hostname}:5001` : "");

    try {
      if (selected === "FREE") {
        // Free plan: call sandbox upgrade endpoint to set tier in token
        const res = await fetch(`${apiBase}/api/v1/subscription/sandbox-upgrade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tier: "FREE" }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to activate free plan");
        }
        const data = await res.json();

        // Store real tokens from the backend response
        if (data.accessToken) {
          document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        if (data.refreshToken) {
          document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
        }

        await refreshSubscription();
        router.replace("/dashboard/home");
      } else {
        // Paid plan: map PREMIUM → ENTERPRISE for backend, then initiate Stripe checkout
        const mappedTier = selected === "PREMIUM" ? "ENTERPRISE" : selected;
        const res = await fetch(`${apiBase}/api/v1/subscription/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tier: mappedTier }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to initiate checkout");
        }
        const data = await res.json();

        if (data.url && data.mode === "stripe") {
          window.location.href = data.url;
        } else if (data.mode === "sandbox") {
          // Stripe credentials missing - execute simulated sandbox checkout directly
          const upgradeRes = await fetch(`${apiBase}/api/v1/subscription/sandbox-upgrade`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ tier: mappedTier }),
          });
          if (!upgradeRes.ok) {
            const errData = await upgradeRes.json().catch(() => ({}));
            throw new Error(errData.message || "Failed simulated checkout activation");
          }
          const upgradeData = await upgradeRes.json();

          if (upgradeData.accessToken) {
            document.cookie = `access_token=${upgradeData.accessToken}; path=/; max-age=900; SameSite=Lax`;
          }
          if (upgradeData.refreshToken) {
            document.cookie = `refresh_token=${upgradeData.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
          }

          await refreshSubscription();
          router.replace("/dashboard/home");
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          InterviewMirror AI — Plan Selection
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
          Choose Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Interview Edge
          </span>
        </h1>
        <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Unlock AI-powered coaching that mirrors real recruiter evaluations.
          Land the offer you deserve.
        </p>
      </motion.div>

      {/* Plan Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isSelected = selected === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => setSelected(plan.id)}
              className={`relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 backdrop-blur-sm
                ${
                  isSelected
                    ? `${plan.borderColor} bg-white/5 shadow-2xl scale-[1.02]`
                    : "border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/60"
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white shadow-lg`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Selection indicator */}
              <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? `bg-gradient-to-br ${plan.color} border-transparent`
                    : "border-zinc-700"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Icon + Name */}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h2 className="text-xl font-black text-white mb-1">
                {plan.name}
              </h2>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className={`text-4xl font-black ${plan.accentColor}`}>
                  {plan.price}
                </span>
                <span className="text-zinc-500 text-sm ml-1">
                  /{plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">{f}</span>
                  </li>
                ))}
                {plan.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-xs">
                    <Lock className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-600">{l}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-4"
      >
        {error && (
          <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              {selected === "FREE" ? "Continue with Starter" : `Upgrade to ${PLANS.find((p) => p.id === selected)?.name}`}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <p className="text-zinc-600 text-xs">
          Secure checkout powered by Stripe • Cancel anytime
        </p>
      </motion.div>
    </div>
  );
}
