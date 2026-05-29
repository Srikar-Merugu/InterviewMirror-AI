"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Shield, User, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const presetAccounts = [
  { name: "Srikar Merugu (Git)", email: "srikar_git@interviewmirror.com", avatar: "SG" },
  { name: "Demo Developer", email: "demo_dev@interviewmirror.ai", avatar: "DD" },
  { name: "GitHub Guest", email: "github_guest@interviewmirror.com", avatar: "GG" },
];

export default function GitHubOAuthPage() {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${apiBase}/api/v1/auth/oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          provider: "github",
          providerId: `github-id-${selectedEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
          email: selectedEmail,
          name: selectedName,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "GitHub OAuth authentication failed");
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
      if (err.name === "AbortError") {
        setError("Request timed out. Check that the backend server is running on port 5001.");
      } else {
        setError(err.message || "Network error. Make sure backend is running.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-2xl w-full max-w-md p-8 relative z-10 space-y-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-xl text-white tracking-tight">
            Authorize InterviewMirror AI
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            to connect to your <span className="text-zinc-300 font-semibold">GitHub developer profile</span>
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
            <span className="text-xs text-zinc-500 font-mono">Synchronizing GitHub sessions...</span>
          </div>
        ) : !customMode ? (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Authorize an active account
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
              Authorize custom GitHub account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Enter GitHub profile
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
                label="Profile Name"
                placeholder="e.g. richard-hendricks"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Public Email"
                type="email"
                placeholder="e.g. developer@github.com"
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
            <span>GitHub OAuth verified sandbox</span>
          </div>
          <span>InterviewMirror Inc</span>
        </div>
      </motion.div>
    </div>
  );
}
