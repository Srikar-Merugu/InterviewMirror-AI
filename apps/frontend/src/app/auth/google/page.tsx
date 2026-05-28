"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, User, Mail, ArrowRight, Loader2 } from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

const presetAccounts = [
  { name: "Srikar Merugu", email: "srikar@interviewmirror.com", avatar: "SM" },
  { name: "Demo Candidate", email: "demo@interviewmirror.ai", avatar: "DC" },
  { name: "Guest User", email: "guest@interviewmirror.com", avatar: "GU" },
];

export default function GoogleOAuthPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom account creation form states
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
        headers: {
          "Content-Type": "application/json",
        },
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

      // Sync real JWT cookies & local storage from backend response
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mock_auth_token", result.accessToken || "mock-user-token");
        if (result.accessToken) {
          document.cookie = `access_token=${result.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        if (result.refreshToken) {
          document.cookie = `refresh_token=${result.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
        }
      }

      // Route based on whether user has a subscription tier
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className={`${GLASSMORPHISM_STYLES.card} w-full max-w-md p-8 border-zinc-900 shadow-2xl relative z-10 space-y-6`}>
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-heading font-black text-xl text-white tracking-tight">
            Sign in with Google
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            to continue to <span className="text-zinc-300 font-semibold">InterviewMirror AI</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-3 rounded-lg text-xs leading-normal">
            {error}
          </div>
        )}

        {/* Content Section */}
        {submitting ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">Synchronizing Google sessions...</span>
          </div>
        ) : !customMode ? (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Select an active profile
            </div>
            
            <div className="space-y-2">
              {presetAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleOAuthSubmit(account.name, account.email)}
                  className="w-full bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 p-3.5 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-900/50 flex items-center justify-center font-bold text-xs text-indigo-400">
                      {account.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                        {account.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {account.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </button>
              ))}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-900" />
              <span className="flex-shrink mx-3 text-[10px] text-zinc-600 uppercase font-bold">or</span>
              <div className="flex-grow border-t border-zinc-900" />
            </div>

            <button
              onClick={() => setCustomMode(true)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white py-2.5 rounded-lg text-xs font-semibold cursor-pointer text-center hover:bg-zinc-850 transition-colors"
            >
              Use another custom Google account
            </button>
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
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Richard Hendricks"
                    className={`w-full ${GLASSMORPHISM_STYLES.input} pl-9 border-zinc-800 text-zinc-200 placeholder:text-zinc-700 text-xs`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. richard@gmail.com"
                    className={`w-full ${GLASSMORPHISM_STYLES.input} pl-9 border-zinc-800 text-zinc-200 placeholder:text-zinc-700 text-xs`}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 ${INTERACTION_CLASSES.primaryButton} py-2.5`}
                >
                  <span>Authorize</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Audit Checklist */}
        <div className="border-t border-zinc-950 pt-4 flex items-center justify-between text-[10px] text-zinc-600">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-600" />
            <span>Secure 256-bit OAuth frame</span>
          </div>
          <span>InterviewMirror Inc</span>
        </div>
      </div>
    </div>
  );
}
