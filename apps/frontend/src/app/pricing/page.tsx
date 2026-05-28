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
  MessageSquareCode,
  CreditCard,
  Loader2,
  Lock,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
import { getAuthHeaders } from "../../utils/auth";

const planFeatures = [
  { category: "Interviews", name: "Monthly Mock Interviews Limit", free: "5 sessions", pro: "30 sessions", enterprise: "Unlimited" },
  { category: "Interviews", name: "Speech Filler Audio Analysis", free: "Standard count", pro: "Whisper detail logs", enterprise: "Whisper priority" },
  { category: "Body Language", name: "MediaPipe Posture Landmarks", free: "Basic slump count", pro: "Detailed shoulder tilts", enterprise: "Advanced body vectors" },
  { category: "Body Language", name: "Iris Eye Contact Focus Coords", free: "❌", pro: "88% gaze detection", enterprise: "Direct iris focus mapping" },
  { category: "Recruiters", name: "Shareable Performance Reports", free: "❌", pro: "White-labeled pages", enterprise: "Public sync Greenhouse links" },
  { category: "Support", name: "AI Feedback Response Latency", free: "Standard 3s", pro: "Priority 0.5s", enterprise: "SLA Dedicated" },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  // Dynamic user profile states
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Payment checkout modal states
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [paymentRunning, setPaymentRunning] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load profile on mount to resolve plan state
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
      // Downgrade to FREE instantly
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
        alert("Plan changed to Free Sandbox.");
        router.push("/dashboard/home");
      } catch (err: any) {
        alert(err.message || "Error changing plan.");
      } finally {
        setPaymentRunning(false);
      }
      return;
    }
    
    // Call backend to initialize checkout session
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
          // Redirect to stripe checkout page
          window.location.href = resJson.url;
          return;
        }
      }
    } catch (err) {
      console.warn("Stripe backend checkout route failed, falling back to simulated modal UI:", err);
    }

    // Set active modal states for simulated sandbox
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
        body: JSON.stringify({
          tier: checkoutPlan.tier,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        throw new Error(resJson.message || "Failed execution of simulated payment session");
      }

      setPaymentSuccess(true);
      
      // Update local state
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
      icon: MessageSquareCode,
      glow: "group-hover:bg-zinc-800/10",
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
      glow: "group-hover:bg-indigo-600/15",
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
      glow: "group-hover:bg-purple-600/15",
    },
  ];

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative pb-12 bg-canvas">
      {/* Background Radial Glowing highlights */}
      <div className="absolute top-0 left-0 right-0 h-[600px] radial-glowing-effect pointer-events-none z-0" />

      {/* Header bar */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 ${GLASSMORPHISM_STYLES.header}`}>
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            InterviewMirror AI
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          {user ? (
            <Link href="/dashboard/home" className={INTERACTION_CLASSES.secondaryButton}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth" className={INTERACTION_CLASSES.primaryButton}>
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
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
            className="font-heading font-black text-3xl md:text-5xl tracking-tight bg-gradient-to-b from-white to-zinc-450 bg-clip-text text-transparent mb-4"
          >
            Flexible plans for absolute interview confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs md:text-sm text-zinc-500 leading-relaxed"
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
                billingCycle === "monthly" ? "text-black" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 relative z-10 ${
                billingCycle === "yearly" ? "text-black" : "text-zinc-400 hover:text-zinc-200"
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

        {/* Pricing matrix grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pricingTiers.map((tier, idx) => {
            const IconComponent = tier.icon;
            const price = billingCycle === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;
            const isActive = isUserSubscribed(tier.key);

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.1 }}
                className={`${GLASSMORPHISM_STYLES.card} p-6 flex flex-col relative overflow-hidden group hover:border-zinc-700 hover:shadow-2xl transition-all duration-300 ${
                  tier.popular ? "border-indigo-500/50 bg-zinc-900/30" : ""
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${tier.glow}`} />

                {tier.popular && (
                  <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-150 mb-4 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    {tier.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6 flex items-baseline space-x-1">
                  <span className="text-3xl font-heading font-black text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-zinc-500">/ mo</span>
                </div>

                <button
                  onClick={() => handleCheckoutAction(tier.key)}
                  disabled={isActive}
                  className={`w-full py-2 px-4 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? "bg-zinc-950/60 text-zinc-500 border border-zinc-900 cursor-not-allowed"
                      : tier.popular
                        ? "bg-white text-black hover:bg-zinc-200 active:scale-[0.97]"
                        : "bg-zinc-900 text-zinc-250 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.97]"
                  } mb-6`}
                >
                  <span>{tier.cta}</span>
                  {!isActive && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                </button>

                <hr className="border-zinc-950 mb-6" />

                <ul className="space-y-3 flex-1 text-[11px] text-zinc-400">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading font-bold text-xl md:text-2xl tracking-tight text-white">
              Full Feature Comparison Matrix
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">
              Compare plan details, facial telemetry configurations, and recruiter parameters.
            </p>
          </div>

          <div className={`${GLASSMORPHISM_STYLES.card} overflow-x-auto border-zinc-900/60 bg-zinc-950/10`}>
            <table className="w-full text-left text-[11px] border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-400 font-bold bg-zinc-900/10">
                  <th className="p-4">Plan Parameters</th>
                  <th className="p-4">Mock Sandbox</th>
                  <th className="p-4">Professional Plan</th>
                  <th className="p-4">Recruiter Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-zinc-300">
                {planFeatures.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-200">{feat.name}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">{feat.category}</div>
                    </td>
                    <td className="p-4 text-zinc-400">{feat.free}</td>
                    <td className="p-4 text-zinc-200 font-semibold">{feat.pro}</td>
                    <td className="p-4 text-indigo-400 font-bold">{feat.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Badges footer section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-950 pt-12 text-center">
          <div className="flex flex-col items-center p-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-2" />
            <h4 className="font-heading font-semibold text-xs mb-1">
              Secure processing models
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Video processing layers run in completely sandboxed cloud frames, maintaining candidate privacy.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Check className="w-8 h-8 text-emerald-400 mb-2" />
            <h4 className="font-heading font-semibold text-xs mb-1">
              Instant Cancellation
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Easily change, upgrade, or pause subscription parameters at any point from account settings.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Zap className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-heading font-semibold text-xs mb-1">
              ATS Integrations
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Instantly link generated profiles to Greenhouse, Lever, and Greenhouse HR portals.
            </p>
          </div>
        </div>
      </main>

      {/* Checkout simulated pop-up center */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className={`${GLASSMORPHISM_STYLES.card} w-full max-w-sm p-6 border-zinc-800 shadow-2xl relative space-y-5 bg-zinc-950`}
            >
              {/* Header */}
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-900/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-white text-base">
                  Simulated Billing Portal
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Secure checkout for {checkoutPlan.name}
                </p>
              </div>

              {/* Status Section */}
              {paymentSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-900/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/10">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-emerald-400">Payment Authorization Successful</div>
                  <div className="text-[9px] text-zinc-500 text-center leading-normal">
                    Database subscription tier upgraded. Synced cookies verified. Redirecting...
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#09090b]/80 border border-zinc-900 p-3.5 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-zinc-200">{checkoutPlan.name}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">Subscription active for 30 days</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white text-sm">{checkoutPlan.price}</div>
                      <div className="text-[9px] text-zinc-500">/ month</div>
                    </div>
                  </div>

                  <div className="space-y-3 leading-relaxed">
                    <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                      Simulated Payment details
                    </div>
                    <div className="bg-[#09090b]/40 border border-zinc-900 p-2.5 rounded text-[10px] text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Cardholder:</span>
                        <span className="text-zinc-200">{user?.name || "Demo Candidate"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Simulated Card:</span>
                        <span className="text-zinc-200">•••• •••• •••• 4242</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stripe Env Mode:</span>
                        <span className="text-amber-400 font-bold">Dev Sandbox</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => setCheckoutPlan(null)}
                      disabled={paymentRunning}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 py-2 rounded-md text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSandboxPurchase}
                      disabled={paymentRunning}
                      className={`flex-1 ${INTERACTION_CLASSES.primaryButton} py-2 rounded-md text-xs font-semibold flex items-center justify-center`}
                    >
                      {paymentRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" />
                          <span>Pay {checkoutPlan.price}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Secure lock footer */}
              <div className="flex items-center justify-center space-x-1 text-[9px] text-zinc-600">
                <Lock className="w-3 h-3" />
                <span>PCI-DSS Compliant Encryption Sandbox</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-zinc-950/80 pt-6 text-center text-[10px] text-zinc-600">
        © 2026 InterviewMirror AI Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
