"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Shield, User, Mail, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const presetAccounts = [
  { name: "Srikar Merugu", email: "srikar@interviewmirror.com", avatar: "SM" },
  { name: "Demo Candidate", email: "demo@interviewmirror.ai", avatar: "DC" },
  { name: "Guest User", email: "guest@interviewmirror.com", avatar: "GU" },
];

export default function GoogleOAuthPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const handleOAuthSubmit = async (selectedName: string, selectedEmail: string) => {
    setError(null);
    setSubmitting(true);

    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const response = await fetch(`${apiBase}/api/v1/auth/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: "google",
          providerId: `google-id-${selectedEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
          email: selectedEmail,
          name: selectedName,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Google OAuth authentication failed");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("mock_auth_token", result.accessToken || "mock-user-token");
        if (result.accessToken) {
          document.cookie = `access_token=${result.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
        }
        if (result.refreshToken) {
          document.cookie = `refresh_token=${result.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
        }
      }

      const userTier = result.data?.subscription?.tier;
      if (!userTier) {
        router.push("/onboarding/plan");
      } else {
        router.push("/dashboard/home");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Make sure backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-2xl w-full max-w-md p-8 relative z-10 space-y-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-heading font-bold text-xl text-white tracking-tight">
            Sign in with Google
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            to continue to <span className="text-zinc-300 font-semibold">InterviewMirror AI</span>
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/5 border border-red-500/10 text-red-400 p-3 rounded-xl text-xs"
          >
            {error}
          </motion.div>
        )}

        {submitting ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-zinc-500 font-mono">Synchronizing Google sessions...</span>
          </div>
        ) : !customMode ? (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Select an active profile
            </div>

            <div className="space-y-2">
              {presetAccounts.map((account) => (
                <motion.button
                  key={account.email}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOAuthSubmit(account.name, account.email)}
                  className="w-full glass-card rounded-xl p-3.5 flex items-center justify-between text-left group glass-card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                      {account.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {account.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {account.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </motion.button>
              ))}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/[0.04]" />
              <span className="flex-shrink mx-3 text-[10px] text-zinc-600 uppercase font-bold">or</span>
              <div className="flex-grow border-t border-white/[0.04]" />
            </div>

            <Button
              variant="secondary"
              onClick={() => setCustomMode(true)}
              className="w-full"
            >
              Use another Google account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Enter custom Google account
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customName && customEmail) {
                  handleOAuthSubmit(customName, customEmail);
                }
              }}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="e.g. Richard Hendricks"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. richard@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="flex gap-3 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setCustomMode(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Authorize
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="border-t border-white/[0.04] pt-4 flex items-center justify-between text-[10px] text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure 256-bit OAuth frame</span>
          </div>
          <span>InterviewMirror Inc</span>
        </div>
      </motion.div>
    </div>
  );
}
