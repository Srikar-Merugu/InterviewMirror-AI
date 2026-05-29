"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  CreditCard,
  Loader2,
  Lock,
  ChevronRight,
  X,
} from "lucide-react";
import { getAuthHeaders } from "../../utils/auth";
import { Navbar } from "@/components/ui/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const planFeatures = [
  { category: "Interviews", name: "Monthly Mock Interviews Limit", free: "5 sessions", pro: "30 sessions", enterprise: "Unlimited" },
  { category: "Interviews", name: "Speech Filler Audio Analysis", free: "Standard count", pro: "Whisper detail logs", enterprise: "Whisper priority" },
  { category: "Body Language", name: "MediaPipe Posture Landmarks", free: "Basic slump count", pro: "Detailed shoulder tilts", enterprise: "Advanced body vectors" },
  { category: "Body Language", name: "Iris Eye Contact Focus Coords", free: "—", pro: "88% gaze detection", enterprise: "Direct iris focus mapping" },
  { category: "Recruiters", name: "Shareable Performance Reports", free: "—", pro: "White-labeled pages", enterprise: "Public sync Greenhouse links" },
  { category: "Support", name: "AI Feedback Response Latency", free: "Standard 3s", pro: "Priority 0.5s", enterprise: "SLA Dedicated" },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [paymentRunning, setPaymentRunning] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isDev =
          typeof window !== "undefined" &&
          (window.location.port === "3000" ||
           window.location.hostname === "localhost" ||
           window.location.hostname === "127.0.0.1");
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

        const response = await fetch(`${apiBase}/api/v1/auth/me`, {
          headers: getAuthHeaders(),
          credentials: "include",
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            setUser(resJson.data);
          }
        }
      } catch (err) {
        console.warn("Failed retrieving dynamic user details for active plan comparison.");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleCheckoutAction = async (planKey: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const targetTier = planKey === "FREE" ? "FREE" : planKey === "PRO" ? "PRO" : "ENTERPRISE";

    if (targetTier === "FREE") {
      setPaymentRunning(true);
      try {
        const isDev =
          typeof window !== "undefined" &&
          (window.location.port === "3000" ||
           window.location.hostname === "localhost" ||
           window.location.hostname === "127.0.0.1");
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

        const response = await fetch(`${apiBase}/api/v1/subscription/sandbox-upgrade`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({ tier: "FREE" }),
        });

        const resJson = await response.json();
        if (!response.ok || !resJson.success) {
          throw new Error(resJson.message || "Failed to downgrade plan");
        }

        setUser((prev: any) => ({
          ...prev,
          subscription: {
            ...prev?.subscription,
            tier: "FREE",
          },
        }));
        router.push("/dashboard/home");
      } catch (err: any) {
        alert(err.message || "Error changing plan.");
      } finally {
        setPaymentRunning(false);
      }
      return;
    }

    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const response = await fetch(`${apiBase}/api/v1/subscription/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ tier: targetTier }),
      });

      const resJson = await response.json();

      if (response.ok && resJson.success) {
        if (resJson.mode === "stripe" && resJson.url) {
          window.location.href = resJson.url;
          return;
        }
      }
    } catch (err) {
      console.warn("Stripe backend checkout route failed, falling back to simulated modal UI:", err);
    }

    setCheckoutPlan({
      tier: targetTier,
      name: planKey === "FREE" ? "Mock Sandbox" : planKey === "PRO" ? "Professional Candidate" : "Recruiter Enterprise",
      price: billingCycle === "monthly"
        ? (planKey === "PRO" ? "$19" : "$49")
        : (planKey === "PRO" ? "$15" : "$39"),
    });
  };

  const executeSandboxPurchase = async () => {
    if (!checkoutPlan || !user) return;
    setPaymentRunning(true);

    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const response = await fetch(`${apiBase}/api/v1/subscription/sandbox-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ tier: checkoutPlan.tier }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || "Failed execution of simulated payment session");
      }

      setPaymentSuccess(true);

      setUser((prev: any) => ({
        ...prev,
        subscription: {
          ...prev?.subscription,
          tier: checkoutPlan.tier,
        },
      }));

      setTimeout(() => {
        setCheckoutPlan(null);
        setPaymentSuccess(false);
        router.push("/dashboard/home");
      }, 2500);

    } catch (err: any) {
      alert(err.message || "Sandbox payment processing failed.");
    } finally {
      setPaymentRunning(false);
    }
  };

  const isUserSubscribed = (planKey: string) => {
    if (!user) return false;
    const tier = user.subscription?.tier || "FREE";
    if (tier === "ENTERPRISE") return planKey === "ENTERPRISE";
    return tier === planKey;
  };

  const pricingTiers = [
    {
      key: "FREE",
      name: "Mock Sandbox",
      description: "Perfect for candidates trying out AI evaluations for the first time.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "5 simulated mock sessions / mo",
        "Head posture slump sampler",
        "Filler words count analytics",
        "Basic transcription logs",
        "Standard-grade dashboard entry",
      ],
      cta: user ? (isUserSubscribed("FREE") ? "Current Plan" : "Downgrade Sandbox") : "Start Free Sandbox",
      popular: false,
      icon: Sparkles,
      color: "from-zinc-500 to-zinc-600",
      border: "border-zinc-700/30",
    },
    {
      key: "PRO",
      name: "Professional Candidate",
      description: "Highly optimized for job seekers aiming to wow Silicon Valley recruiters.",
      monthlyPrice: 19,
      yearlyPrice: 15,
      features: [
        "30 dynamic AI mock sessions / mo",
        "Real-time webcam iris gaze tracking",
        "MediaPipe posture landmark metrics",
        "Whisper STT verbal filler count breakdowns",
        "Complete HR-style feedback scorecards",
        "Detailed recruiter-shareable profiles",
      ],
      cta: user ? (isUserSubscribed("PRO") ? "Active Plan" : "Get Professional") : "Get Professional",
      popular: true,
      icon: Zap,
      color: "from-indigo-500 to-violet-600",
      border: "border-indigo-500/30",
    },
    {
      key: "ENTERPRISE",
      name: "Recruiter Enterprise",
      description: "Custom tailored for corporate HR departments and tech recruitment hubs.",
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: [
        "Unlimited mock sessions completely unlocked",
        "Multiple shareable profile controls",
        "White-labeled recruiter evaluation cards",
        "Custom interview rubric templates",
        "Priority processing queue priority",
        "Greenhouse / Lever ATS integrations",
      ],
      cta: user ? (isUserSubscribed("ENTERPRISE") ? "Active Plan" : "Upgrade to Premium") : "Contact Enterprise",
      popular: false,
      icon: Globe,
      color: "from-amber-500 to-orange-600",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative bg-[#0a0a0b] overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none z-0" />

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="pt-32 pb-12 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRICING MODELS FOR CANDIDATES AND TEAMS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading font-black text-3xl md:text-5xl tracking-tight text-white mb-4"
            >
              Flexible plans for{" "}
              <span className="premium-gradient-text">absolute confidence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-zinc-500 leading-relaxed max-w-xl mx-auto"
            >
              Train with our standard CV tracking model, eliminate speech fillers,
              analyze direct camera gaze focal coordinates, and unlock recruiter
              analytics.
            </motion.p>
          </div>
        </section>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-white/[0.03] border border-white/[0.06] p-1 rounded-full flex items-center gap-1 relative">
            {["monthly", "yearly"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle as any)}
                className={`relative z-10 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  billingCycle === cycle
                    ? "text-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cycle === "monthly" ? "Monthly billing" : "Yearly (save 20%)"}
              </button>
            ))}
            <motion.div
              layout
              className="absolute inset-y-1 rounded-full bg-white z-0"
              style={{
                left: billingCycle === "monthly" ? 4 : "53%",
                width: billingCycle === "monthly" ? "116px" : "136px",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier, idx) => {
                const IconComponent = tier.icon;
                const price = billingCycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
                const isActive = isUserSubscribed(tier.key);

                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                      tier.popular
                        ? "border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-transparent shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-500/20">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-white">{tier.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed min-h-[36px]">
                        {tier.description}
                      </p>
                    </div>

                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-heading font-black text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-zinc-500">/ mo</span>
                    </div>

                    <Button
                      onClick={() => handleCheckoutAction(tier.key)}
                      variant={tier.popular ? "primary" : "secondary"}
                      className="w-full mb-6"
                      disabled={isActive}
                    >
                      {isActive ? (
                        "Active Plan"
                      ) : (
                        <>
                          {tier.cta}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>

                    <div className="border-t border-white/[0.04] pt-6" />

                    <ul className="space-y-3 flex-1">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3 text-xs text-zinc-400">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-heading font-bold text-xl md:text-2xl text-white">
                Full Feature Comparison
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Compare plan details, facial telemetry configurations, and recruiter parameters.
              </p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border-white/[0.04]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-zinc-400 font-semibold bg-white/[0.02]">
                      <th className="p-4 font-heading">Plan Parameters</th>
                      <th className="p-4 font-heading">Mock Sandbox</th>
                      <th className="p-4 font-heading">Professional Plan</th>
                      <th className="p-4 font-heading">Recruiter Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {planFeatures.map((feat, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="text-zinc-200 font-medium">{feat.name}</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wider">{feat.category}</div>
                        </td>
                        <td className="p-4 text-zinc-500">{feat.free}</td>
                        <td className="p-4 text-zinc-200 font-medium">{feat.pro}</td>
                        <td className="p-4 premium-gradient-text font-bold">{feat.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Processing",
                  desc: "Video processing layers run in completely sandboxed cloud frames, maintaining candidate privacy.",
                  color: "text-indigo-400",
                },
                {
                  icon: Check,
                  title: "Instant Cancellation",
                  desc: "Easily change, upgrade, or pause subscription parameters at any point from account settings.",
                  color: "text-emerald-400",
                },
                {
                  icon: Zap,
                  title: "ATS Integrations",
                  desc: "Instantly link generated profiles to Greenhouse, Lever, and Greenhouse HR portals.",
                  color: "text-purple-400",
                },
              ].map((badge, idx) => (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <badge.icon className={`w-8 h-8 ${badge.color} mx-auto mb-3`} />
                  <h4 className="font-heading font-semibold text-sm text-zinc-200 mb-1.5">{badge.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{badge.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-2xl w-full max-w-sm p-6 relative"
            >
              {/* Close */}
              <button
                onClick={() => { if (!paymentRunning) setCheckoutPlan(null); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-heading font-bold text-base text-white">
                  Complete Checkout
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Secure payment for {checkoutPlan.name}
                </p>
              </div>

              {paymentSuccess ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400">Payment Successful</div>
                  <p className="text-xs text-zinc-500 text-center">
                    Subscription tier upgraded. Redirecting to dashboard...
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">{checkoutPlan.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Monthly subscription</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{checkoutPlan.price}</div>
                      <div className="text-[10px] text-zinc-500">/ month</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Payment Details</div>
                    <div className="bg-white/[0.01] border border-white/[0.06] p-3 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Cardholder:</span>
                        <span className="text-zinc-200">{user?.name || "Candidate"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Card:</span>
                        <span className="text-zinc-200">•••• 4242</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Mode:</span>
                        <span className="text-amber-400 font-semibold">Sandbox</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setCheckoutPlan(null)}
                      disabled={paymentRunning}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={executeSandboxPurchase}
                      loading={paymentRunning}
                      className="flex-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Pay {checkoutPlan.price}
                    </Button>
                  </div>
                </>
              )}

              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-600 mt-4">
                <Lock className="w-3 h-3" />
                <span>PCI-DSS Compliant Encryption Sandbox</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/[0.03] bg-[#0a0a0b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-zinc-600">
          &copy; 2026 InterviewMirror AI Platform. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
