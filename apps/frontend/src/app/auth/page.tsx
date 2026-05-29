"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { GLASSMORPHISM_STYLES } from "@interviewmirror/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode !== "forgot" && (!email || !password || (authMode === "signup" && !name))) {
      setError("Please fill out all fields correctly.");
      return;
    }
    if (authMode === "forgot" && !email) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      let endpoint = "";
      if (authMode === "signin") endpoint = `${apiBase}/api/v1/auth/login`;
      else if (authMode === "signup") endpoint = `${apiBase}/api/v1/auth/signup`;
      else endpoint = `${apiBase}/api/v1/auth/forgot-password`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error?.message || "Authentication failed");
      }

      if (authMode === "forgot") {
        setAuthMode("signin");
        setError(null);
        alert(result.message || "Password reset verification link has been dispatched.");
      } else if (authMode === "signin") {
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
      } else {
        setAuthMode("signin");
        setPassword("");
        setError(null);
        alert("Account created successfully! Please sign in.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Check that the backend server is running on port 5001.");
      } else {
        setError(err.message || "An unexpected authentication error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative bg-[#0a0a0b] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none z-0" />

      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-8 relative z-10 border-r border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            InterviewMirror AI
          </span>
        </Link>

        <div className="max-w-md my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED INTERVIEW COACHING</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-black text-3xl md:text-4xl tracking-tight leading-tight text-white mb-4"
          >
            Master communication confidence under{" "}
            <span className="premium-gradient-text">realistic settings</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-zinc-500 leading-relaxed"
          >
            Our microservices measure body postures, record smile indexes, and
            count verbal transition fillers instantly. Join 12,000+ candidates
            landing top roles today.
          </motion.p>
        </div>

        <div className="text-xs text-zinc-600">
          &copy; 2026 InterviewMirror AI Platform. Secure sandbox verified.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <Link href="/" className="flex md:hidden items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-white">InterviewMirror AI</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-2xl w-full max-w-sm p-8"
        >
          <div className="text-center mb-6">
            <h1 className="font-heading font-bold text-xl text-white">
              {authMode === "signin"
                ? "Welcome back"
                : authMode === "signup"
                  ? "Create your account"
                  : "Reset password"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              {authMode === "signin"
                ? "Enter credentials to open sandbox"
                : authMode === "signup"
                  ? "Start mock assessments in less than 2 minutes"
                  : "Enter email to receive password reset link"}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-500/5 border border-red-500/10 text-red-400 p-3 rounded-xl text-xs"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {authMode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    label="Full Name"
                    placeholder="e.g. Richard Hendricks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. richard@piedpiper.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <AnimatePresence mode="popLayout">
              {authMode !== "forgot" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                      Password
                    </label>
                    {authMode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={submitting} className="w-full">
              {authMode === "signin"
                ? "Open Sandbox"
                : authMode === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Social Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.04]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0a0a0b] px-3 text-[10px] uppercase text-zinc-600 font-bold tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => router.push("/auth/google")}
              className="premium-btn premium-btn-secondary text-xs w-full"
            >
              Google
            </button>
            <button
              onClick={() => router.push("/auth/github")}
              className="premium-btn premium-btn-secondary text-xs w-full"
            >
              GitHub
            </button>
          </div>

          {/* Toggle */}
          <div className="text-center text-xs text-zinc-500">
            {authMode === "signin" ? (
              <>
                <span>New to InterviewMirror? </span>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Create account
                </button>
              </>
            ) : authMode === "signup" ? (
              <>
                <span>Already have an account? </span>
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthMode("signin")}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Back to Sign in
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
