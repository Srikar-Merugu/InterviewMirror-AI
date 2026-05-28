"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Sparkles, ArrowRight, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getAuthHeaders, getCookie } from "@/utils/auth";

type ToastType = "success" | "error" | null;

interface ToastState {
  type: ToastType;
  message: string;
}

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
  const { refreshSubscription, tier: currentTier } = useSubscription();
  const [selected, setSelected] = useState("PRO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ type: null, message: "" });
  const [loadingLabel, setLoadingLabel] = useState("");

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast.type) return;
    const t = setTimeout(() => setToast({ type: null, message: "" }), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // If user already has a plan, redirect to dashboard
  useEffect(() => {
    if (currentTier === "FREE" || currentTier === "PRO" || currentTier === "PREMIUM") {
      router.replace("/dashboard/home");
    }
  }, [currentTier, router]);

  const apiBase = (() => {
    if (typeof window === "undefined") return "";
    const isDev =
      window.location.port === "3000" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");
  })();

  const activatePlan = useCallback(async (tier: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${apiBase}/api/v1/subscription/sandbox-upgrade`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ tier }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || `Failed to activate ${tier} plan`);
      }

      const data = await res.json();

      if (data.accessToken) {
        document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
        window.localStorage.setItem("mock_auth_token", data.accessToken);
      }
      if (data.refreshToken) {
        document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
      }

      await refreshSubscription();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw err;
    }
  }, [apiBase, refreshSubscription]);

  const handleContinue = async () => {
    setLoading(true);
    setError(null);
    setToast({ type: null, message: "" });

    if (selected === "FREE") {
      setLoadingLabel("Activating Starter Plan...");
    } else {
      setLoadingLabel("Redirecting to secure checkout...");
    }

    try {
      if (selected === "FREE") {
        await activatePlan("FREE");
        setToast({ type: "success", message: "Starter Plan Activated Successfully — Your AI interview workspace is ready." });
        // Full navigation ensures cookies are settled before middleware checks them
        setTimeout(() => { window.location.href = "/dashboard/home"; }, 800);
      } else {
        const mappedTier = selected === "PREMIUM" ? "ENTERPRISE" : selected;
        const headers = getAuthHeaders();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const checkoutRes = await fetch(`${apiBase}/api/v1/subscription/checkout`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ tier: mappedTier }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!checkoutRes.ok) {
          const errData = await checkoutRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || errData.message || "Failed to initiate checkout");
        }

        const data = await checkoutRes.json();

        if (data.url && data.mode === "stripe") {
          window.location.href = data.url;
        } else if (data.mode === "sandbox") {
          setLoadingLabel("Completing activation...");
          await activatePlan(mappedTier);
          setToast({ type: "success", message: `${selected} Plan Activated Successfully` });
          setTimeout(() => { window.location.href = "/dashboard/home"; }, 800);
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setToast({ type: null, message: "" });
    } finally {
      setLoading(false);
      setLoadingLabel("");
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
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/40 px-4 py-2.5 rounded-lg">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span className="text-xs">{loadingLabel || "Processing..."}</span>
            </>
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-950/80 border-emerald-800/50 text-emerald-300"
                : "bg-red-950/80 border-red-800/50 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
