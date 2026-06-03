"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, Sparkles, ArrowRight, Lock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getAuthHeaders, getCookie } from "@/utils/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/PageTransition";

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
    color: "from-zinc-500 to-zinc-600",
    accentColor: "text-zinc-300",
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
    color: "from-indigo-500 to-violet-600",
    accentColor: "text-indigo-300",
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
    color: "from-amber-500 to-orange-600",
    accentColor: "text-amber-300",
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

  useEffect(() => {
    if (!toast.type) return;
    const t = setTimeout(() => setToast({ type: null, message: "" }), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const runCashfreeMockCheckout = async (tier: string): Promise<void> => {
    const createRes = await fetch(`${apiBase}/api/v1/subscription/cashfree/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ tier }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error((err as any).error?.message || "Failed to create payment order");
    }
    const orderData = await createRes.json();
    const isMock = orderData.gateway === "cashfree_mock";

    if (!isMock) {
      try {
        await loadCashfreeSdk();
        const env = process.env.NEXT_PUBLIC_CASHFREE_ENV === "PRODUCTION" ? "production" : "sandbox";
        const cashfree = new (window as any).Cashfree({ mode: env });
        const paymentResult = await cashfree.checkout({
          paymentSessionId: orderData.payment_session_id,
          redirectTarget: "modal",
        });
        if (paymentResult.error) throw new Error(paymentResult.error.message || "Payment cancelled");
      } catch (sdkErr: any) {
        throw new Error(sdkErr.message || "Cashfree SDK unavailable");
      }
    }

    if (isMock) {
      const mockRes = await fetch(`${apiBase}/api/v1/subscription/cashfree/mock-success`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ order_id: orderData.order_id }),
      });
      if (!mockRes.ok) {
        const err = await mockRes.json().catch(() => ({}));
        throw new Error((err as any).error?.message || "Mock payment failed");
      }
      const mockData = await mockRes.json();
      if (mockData.accessToken) {
        document.cookie = `access_token=${mockData.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
        window.localStorage.setItem("mock_auth_token", mockData.accessToken);
      }
      if (mockData.refreshToken) {
        document.cookie = `refresh_token=${mockData.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
      }
    } else {
      const verifyRes = await fetch(`${apiBase}/api/v1/subscription/cashfree/verify`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ order_id: orderData.order_id }),
      });
      if (!verifyRes.ok) throw new Error("Payment verification failed");
      const verifyData = await verifyRes.json();
      if (verifyData.status !== "PAID") throw new Error("Payment not completed");
      if (verifyData.accessToken) {
        document.cookie = `access_token=${verifyData.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
        window.localStorage.setItem("mock_auth_token", verifyData.accessToken);
      }
      if (verifyData.refreshToken) {
        document.cookie = `refresh_token=${verifyData.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
      }
    }
  };

  const loadCashfreeSdk = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Cashfree) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
      document.head.appendChild(script);
    });
  };

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
          setLoadingLabel("Processing payment...");
          try {
            await runCashfreeMockCheckout(mappedTier);
          } catch (cfErr: any) {
            console.warn("Cashfree failed, using sandbox fallback:", cfErr.message);
            await activatePlan(mappedTier);
          }
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
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
        <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse pointer-events-none" />
        <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-pulse pointer-events-none" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            InterviewMirror AI — Plan Selection
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-white mb-4 leading-tight">
            Choose Your{" "}
            <span className="premium-gradient-text">Interview Edge</span>
          </h1>
          <p className="text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
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
                className={`relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm
                  ${
                    isSelected
                      ? `border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-transparent shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)] scale-[1.02]`
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]"
                  }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white shadow-lg`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div
                  className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${plan.color} border-transparent`
                      : "border-zinc-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h2 className="font-heading font-bold text-xl text-white mb-1">
                  {plan.name}
                </h2>
                <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                  {plan.tagline}
                </p>

                <div className="mb-6">
                  <span className={`text-4xl font-heading font-black ${plan.accentColor}`}>
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 text-sm ml-1">
                    /{plan.period}
                  </span>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-400">{f}</span>
                    </li>
                  ))}
                  {plan.limits.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-xs">
                      <Lock className="w-3.5 h-3.5 text-zinc-700 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-600">{l}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative z-10 mt-10 flex flex-col items-center gap-4"
        >
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 border border-red-500/10 px-4 py-2.5 rounded-xl">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleContinue}
            loading={loading}
            size="lg"
            className="px-10"
          >
            {loading ? (
              <span className="text-xs">{loadingLabel || "Processing..."}</span>
            ) : (
              <>
                {selected === "FREE" ? "Continue with Starter" : `Upgrade to ${PLANS.find((p) => p.id === selected)?.name}`}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-zinc-600">
            Secure checkout powered by Cashfree & Stripe &bull; Cancel anytime
          </p>
        </motion.div>

        {/* Toast */}
        <AnimatePresence>
          {toast.type && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
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
    </PageTransition>
  );
}
