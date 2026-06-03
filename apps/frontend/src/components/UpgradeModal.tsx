import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { X, Zap, Crown, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { refreshSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'PREMIUM' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const apiBaseUrl = (() => {
    if (typeof window === "undefined") return "";
    const isDev =
      window.location.port === "3000" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");
  })();

  const getCommonHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mock_auth_token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const runSandboxUpgrade = async (tier: string) => {
    const res = await fetch(`${apiBaseUrl}/api/v1/subscription/sandbox-upgrade`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ tier }),
    });
    if (!res.ok) throw new Error("Sandbox upgrade failed");
    return res.json();
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

  const runCashfreeCheckout = async (tier: string): Promise<void> => {
    const mappedTier = tier === "PREMIUM" ? "ENTERPRISE" : tier;

    const createRes = await fetch(`${apiBaseUrl}/api/v1/subscription/cashfree/create`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ tier: mappedTier }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error((err as any).error?.message || "Failed to create payment order");
    }
    const orderData = await createRes.json();

    await loadCashfreeSdk();

    const cashfreeEnv = orderData.order_currency === "INR" ? "PRODUCTION" : "SANDBOX";
    const cashfree = new (window as any).Cashfree({ mode: cashfreeEnv === "PRODUCTION" ? "production" : "sandbox" });

    const paymentResult = await cashfree.checkout({
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: "modal",
    });

    if (paymentResult.error) {
      throw new Error(paymentResult.error.message || "Payment failed or cancelled");
    }

    const verifyRes = await fetch(`${apiBaseUrl}/api/v1/subscription/cashfree/verify`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ order_id: orderData.order_id }),
    });
    if (!verifyRes.ok) throw new Error("Payment verification failed");
    const verifyData = await verifyRes.json();

    if (verifyData.status !== "PAID") {
      throw new Error("Payment not completed. Please try again.");
    }

    if (verifyData.accessToken) {
      document.cookie = `access_token=${verifyData.accessToken}; path=/; max-age=900; SameSite=Lax`;
    }
    if (verifyData.refreshToken) {
      document.cookie = `refresh_token=${verifyData.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    }
  };

  const handleUpgrade = async (targetPlan: 'PRO' | 'PREMIUM') => {
    setLoadingPlan(targetPlan);
    setErrorMsg(null);

    try {
      const mappedTier = targetPlan === "PREMIUM" ? "ENTERPRISE" : targetPlan;

      const checkoutRes = await fetch(`${apiBaseUrl}/api/v1/subscription/checkout`, {
        method: "POST",
        headers: getCommonHeaders(),
        credentials: "include",
        body: JSON.stringify({ tier: mappedTier }),
      });
      if (!checkoutRes.ok) throw new Error("Failed to initiate upgrade flow");
      const checkoutData = await checkoutRes.json();

      if (checkoutData.url && checkoutData.mode === "stripe") {
        window.location.href = checkoutData.url;
        return;
      }

      if (checkoutData.mode !== "sandbox") {
        throw new Error("Invalid checkout response");
      }

      const cashfreeAppId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
      if (cashfreeAppId) {
        await runCashfreeCheckout(targetPlan);
      } else {
        await runSandboxUpgrade(mappedTier);
      }

      await refreshSubscription();
      const planName = targetPlan === "PREMIUM" ? "Premium" : "Pro";
      alert(`Successfully upgraded to ${planName}!`);
      onClose();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during the upgrade transaction.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 md:p-8 text-zinc-100 shadow-2xl"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/80 border border-indigo-800/40 text-indigo-400">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>

          <div className="text-center">
            <h2 className="font-heading text-2xl font-black tracking-tight text-white md:text-3xl">
              Interview Limit Reached
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              You&apos;ve completed all 5 interviews available in your Free Plan this month. Upgrade your plan to continue unlimited AI interview practice and unlock premium recruiter analytics.
            </p>
          </div>

          {errorMsg && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-900/30 bg-red-950/20 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700/60 hover:bg-zinc-900/60">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Pro Plan Edge
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      30 interviews/mo &bull; Full AI coaching & reports
                    </p>
                  </div>
                </div>
                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleUpgrade('PRO')}
                  className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {loadingPlan === 'PRO' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>
              </div>
            </div>

            <div className="group relative rounded-xl border border-indigo-500/30 bg-indigo-950/10 p-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-950/20">
              <div className="absolute right-4 -top-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow">
                Premium
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Crown className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      Premium Unlimited
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Unlimited interviews &bull; Recruiter dashboard unlocked
                    </p>
                  </div>
                </div>
                <button
                  disabled={loadingPlan !== null}
                  onClick={() => handleUpgrade('PREMIUM')}
                  className="flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition disabled:opacity-50"
                >
                  {loadingPlan === 'PREMIUM' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Upgrade to Premium'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-zinc-600">
            Secure checkout powered by Cashfree & Stripe
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
