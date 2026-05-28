"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, User, Mail, ArrowRight, Loader2 } from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

const presetAccounts = [
  { name: "Srikar Merugu (Git)", email: "srikar_git@interviewmirror.com", avatar: "SG" },
  { name: "Demo Developer", email: "demo_dev@interviewmirror.ai", avatar: "DD" },
  { name: "GitHub Guest", email: "github_guest@interviewmirror.com", avatar: "GG" },
];

export default function GitHubOAuthPage() {
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
          provider: "github",
          providerId: `github-id-${selectedEmail.replace(/[^a-zA-Z0-9]/g, "")}`,
          email: selectedEmail,
          name: selectedName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "GitHub OAuth authentication failed");
      }

      // Sync cookies & local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem("mock_auth_token", "mock-user-token");
        const fakeToken = btoa(
          JSON.stringify({
            id: result.data?.id,
            email: result.data?.email,
            role: result.data?.role,
            name: result.data?.name,
          })
        );
        document.cookie = `access_token=${fakeToken}; path=/; max-age=900; SameSite=Lax`;
        document.cookie = `refresh_token=mock-refresh-token; path=/; max-age=604800; SameSite=Lax`;
      }

      router.push("/dashboard/home");
    } catch (err: any) {
      setError(err.message || "Network error. Make sure backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-zinc-200 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md p-8 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <h2 className="font-heading font-black text-xl text-white tracking-tight">
            Authorize InterviewMirror AI
          </h2>
          <p className="text-xs text-[#8b949e] mt-1">
            to connect to your <span className="text-[#c9d1d9] font-semibold">GitHub developer profile</span>
          </p>
        </div>

        {error && (
          <div className="bg-[#f8514915] border border-[#f8514930] text-[#f85149] p-3 rounded-lg text-xs leading-normal">
            {error}
          </div>
        )}

        {/* Content Section */}
        {submitting ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#58a6ff] animate-spin" />
            <span className="text-xs text-[#8b949e] font-mono">Synchronizing GitHub sessions...</span>
          </div>
        ) : !customMode ? (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider">
              Authorize an active account
            </div>
            
            <div className="space-y-2">
              {presetAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleOAuthSubmit(account.name, account.email)}
                  className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#8b949e] p-3.5 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center font-bold text-xs text-[#58a6ff]">
                      {account.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#c9d1d9] group-hover:text-white">
                        {account.name}
                      </div>
                      <div className="text-[10px] text-[#8b949e]">
                        {account.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8b949e] group-hover:text-[#c9d1d9] transition-colors" />
                </button>
              ))}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#30363d]" />
              <span className="flex-shrink mx-3 text-[10px] text-[#8b949e] uppercase font-bold">or</span>
              <div className="flex-grow border-t border-[#30363d]" />
            </div>

            <button
              onClick={() => setCustomMode(true)}
              className="w-full bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:text-white py-2.5 rounded-lg text-xs font-semibold cursor-pointer text-center hover:bg-[#30363d] transition-colors"
            >
              Authorize custom GitHub account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider">
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
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#8b949e]">
                  Profile Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#8b949e]" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. richard-hendricks"
                    className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all rounded-md pl-9 pr-3 py-2 text-[#c9d1d9] placeholder:text-[#5c6370] text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#8b949e]">
                  Public Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#8b949e]" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. developer@github.com"
                    className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all rounded-md pl-9 pr-3 py-2 text-[#c9d1d9] placeholder:text-[#5c6370] text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#238636] hover:bg-[#2ea44f] active:scale-[0.97] transition-all text-white font-medium py-2 px-4 rounded-md text-xs cursor-pointer inline-flex items-center justify-center"
                >
                  <span>Authorize</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Audit Checklist */}
        <div className="border-t border-[#30363d] pt-4 flex items-center justify-between text-[10px] text-[#8b949e]">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-[#8b949e]" />
            <span>GitHub OAuth verified sandbox</span>
          </div>
          <span>InterviewMirror Inc</span>
        </div>
      </div>
    </div>
  );
}
