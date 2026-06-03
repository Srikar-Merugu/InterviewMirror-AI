import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { X, Zap, Crown, Sparkles, AlertCircle, Loader2, CreditCard, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { refreshSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'PREMIUM' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mockCheckout, setMockCheckout] = useState<{
    tier: string;
    orderId: string;
    amount: number;
  } | null>(null);
  const [mockProcessing, setMockProcessing] = useState(false);
  const [mockSuccess, setMockSuccess] = useState(false);

  if (!isOpen) return null;

  const apiBaseUrl = (() => {
    if (typeof window === "undefined") return "";
    const isDev =
      window.location.port === "3000" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    return process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");
  })();

  const getHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? window.localStorage.getItem("mock_auth_token") : null;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const handleMockComplete = async () => {
    if (!mockCheckout) return;
    setMockProcessing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/subscription/cashfree/mock-success`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ order_id: mockCheckout.orderId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || "Mock payment failed");
      }
      const data = await res.json();
      if (data.accessToken) {
        document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
      }
      if (data.refreshToken) {
        document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      setMockSuccess(true);
      await refreshSubscription();
      setTimeout(() => {
        setMockCheckout(null);
        setMockSuccess(false);
        onClose();
        if (typeof window !== "undefined") window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Mock payment failed");
    } finally {
      setMockProcessing(false);
    }
  };

  const handleUpgrade = async (targetPlan: 'PRO' | 'PREMIUM') => {
    setLoadingPlan(targetPlan);
    setErrorMsg(null);
    setMockCheckout(null);

    try {
      const mappedTier = targetPlan === "PREMIUM" ? "ENTERPRISE" : targetPlan;

      const checkoutRes = await fetch(`${apiBaseUrl}/api/v1/subscription/checkout`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ tier: mappedTier }),
      });
      if (!checkoutRes.ok) throw new Error("Failed to initiate upgrade flow");
      const checkoutData = await checkoutRes.json();

      if (checkoutData.url && checkoutData.mode === "stripe") {
        window.location.href = checkoutData.url;
        return;
      }

      // Try Cashfree (mock or real)
      const cfRes = await fetch(`${apiBaseUrl}/api/v1/subscription/cashfree/create`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ tier: mappedTier }),
      });

      if (cfRes.ok) {
        const cfData = await cfRes.json();

        if (cfData.gateway === "cashfree_mock") {
          setMockCheckout({
            tier: targetPlan,
            orderId: cfData.order_id,
            amount: cfData.order_amount,
          });
          setLoadingPlan(null);
          return;
        }

        // Redirect to Cashfree hosted checkout
        const checkoutUrl = `https://sandbox.cashfree.com/pg/view/sessions/${cfData.payment_session_id}`;
        window.location.href = checkoutUrl;
        return;

        // Verify payment
        const verifyRes = await fetch(`${apiBaseUrl}/api/v1/subscription/cashfree/verify`, {
          method: "POST",
          headers: getHeaders(),
          credentials: "include",
          body: JSON.stringify({ order_id: cfData.order_id }),
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
      } else {
        // Cashfree unavailable — use sandbox upgrade
        const upgradeRes = await fetch(`${apiBaseUrl}/api/v1/subscription/sandbox-upgrade`, {
          method: "POST",
          headers: getHeaders(),
          credentials: "include",
          body: JSON.stringify({ tier: mappedTier }),
        });
        if (!upgradeRes.ok) throw new Error("Fallback sandbox upgrade failed");
        const upgradeData = await upgradeRes.json();
        if (upgradeData.accessToken) {
          document.cookie = `access_token=${upgradeData.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        if (upgradeData.refreshToken) {
          document.cookie = `refresh_token=${upgradeData.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
        }
      }

      await refreshSubscription();
      const planName = targetPlan === "PREMIUM" ? "Premium" : "Pro";
      alert(`Successfully upgraded to ${planName}!`);
      onClose();
      if (typeof window !== "undefined") window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during the upgrade transaction.");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Render mock checkout modal
  if (mockCheckout) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { if (!mockProcessing) setMockCheckout(null); }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 md:p-8 text-zinc-100 shadow-2xl"
          >
            {mockSuccess ? (
              <>
                <div className="py-8 flex flex-col items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-emerald-400">Payment Successful</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Subscription upgraded. Redirecting...
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/80 border border-indigo-800/40 text-indigo-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white">Cashfree Test Checkout</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    This is a simulated payment in test mode
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 mb-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Plan</span>
                    <span className="font-semibold text-white">{mockCheckout.tier === "PREMIUM" ? "Premium" : "Pro"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Amount</span>
                    <span className="font-semibold text-white">₹{mockCheckout.amount}/month</span>
                  </div>
                  <div className="border-t border-white/[0.04] pt-3">
                    <div className="text-xs text-zinc-600 mb-2 font-medium">Test Card Details</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                        <div className="text-zinc-600">Card</div>
                        <div className="text-zinc-300 font-mono">4111 1111 1111 1111</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                        <div className="text-zinc-600">Expiry</div>
                        <div className="text-zinc-300 font-mono">12/28</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                        <div className="text-zinc-600">CVV</div>
                        <div className="text-zinc-300 font-mono">123</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                        <div className="text-zinc-600">OTP</div>
                        <div className="text-zinc-300 font-mono">1234</div>
                      </div>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setMockCheckout(null)}
                    disabled={mockProcessing}
                    className="flex-1 rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-900 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMockComplete}
                    disabled={mockProcessing}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {mockProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        Complete Test Payment
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 text-center text-[10px] text-zinc-600">
                  Test Mode &bull; No real charges applied
                </div>
              </>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

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
            Secure checkout powered by Cashfree (Test Mode)
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
