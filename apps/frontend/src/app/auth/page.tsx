"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">(
    "signin",
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      authMode !== "forgot" &&
      (!email || !password || (authMode === "signup" && !name))
    ) {
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
      if (authMode === "signin") {
        endpoint = `${apiBase}/api/v1/auth/login`;
      } else if (authMode === "signup") {
        endpoint = `${apiBase}/api/v1/auth/signup`;
      } else {
        endpoint = `${apiBase}/api/v1/auth/forgot-password`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error?.message || "Authentication failed",
        );
      }

      // Handle successful forgot password dispatch
      if (authMode === "forgot") {
        setAuthMode("signin");
        setError(null);
        alert(
          result.message ||
            "Password reset verification link has been dispatched.",
        );
      } else if (authMode === "signin") {
        // If user successfully logged in, set local storage and fallback cookies
        if (typeof window !== "undefined") {
          window.localStorage.setItem("mock_auth_token", "mock-user-token");
          // Also set client side fallback cookies to ensure Next.js middleware is 100% resilient
          const fakeToken = btoa(
            JSON.stringify({
              id: result.data?.id,
              email: result.data?.email,
              role: result.data?.role,
              name: result.data?.name || name || result.data?.email?.split("@")[0] || "Mock Candidate",
            }),
          );
          document.cookie = `access_token=${fakeToken}; path=/; max-age=900; SameSite=Lax`;
          document.cookie = `refresh_token=mock-refresh-token; path=/; max-age=604800; SameSite=Lax`;
        }
        router.push("/dashboard/home");
      } else {
        // Toggle to signin mode on successful signup
        setAuthMode("signin");
        setError(null);
        alert("Account registered successfully! You can now log in.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col md:flex-row relative bg-canvas">
      {/* Glow overlay */}
      <div className="absolute top-0 left-0 right-0 h-[600px] radial-glowing-effect pointer-events-none z-0" />

      {/* Left visual column */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-8 relative z-10 border-r border-zinc-950/80">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
            className="inline-flex items-center space-x-2 bg-zinc-900 border border-zinc-800 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>CLERK-READY STARTUP INTEGRATION</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-black text-3xl md:text-4xl tracking-tight leading-tight text-white mb-4"
          >
            Master communication confidence under realistic settings
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs md:text-sm text-zinc-400 leading-relaxed"
          >
            Our microservices measure body postures, record smile indexes, and
            count verbal transition fillers instantly. Join 12,000+ candidates
            landing top roles today.
          </motion.p>
        </div>

        <div className="text-[10px] text-zinc-600">
          © 2026 InterviewMirror AI Platform. Secure sandbox verified.
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        {/* Mobile Brand Link */}
        <Link href="/" className="flex md:hidden items-center space-x-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-white">
            InterviewMirror AI
          </span>
        </Link>

        {/* Glass Card form container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${GLASSMORPHISM_STYLES.card} w-full max-w-sm p-6 md:p-8 shadow-2xl relative overflow-hidden`}
        >
          {/* Header */}
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
            <div className="mb-4 bg-red-950/20 border border-red-900/30 text-red-400 p-2.5 rounded text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {authMode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] uppercase font-bold text-zinc-500">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Richard Hendricks"
                      className={`w-full ${GLASSMORPHISM_STYLES.input} pl-9 border-zinc-800 text-zinc-200 placeholder:text-zinc-600`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. richard@piedpiper.com"
                  className={`w-full ${GLASSMORPHISM_STYLES.input} pl-9 border-zinc-800 text-zinc-200 placeholder:text-zinc-600`}
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {authMode !== "forgot" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">
                      Password
                    </label>
                    {authMode === "signin" && (
                      <span
                        onClick={() => setAuthMode("forgot")}
                        className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full ${GLASSMORPHISM_STYLES.input} pl-9 pr-9 border-zinc-800 text-zinc-200 placeholder:text-zinc-600`}
                      required={true}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-zinc-600 hover:text-zinc-400 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full ${INTERACTION_CLASSES.primaryButton} flex items-center justify-center`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Syncing identities...</span>
                </>
              ) : (
                <span>
                  {authMode === "signin"
                    ? "Open Sandbox"
                    : authMode === "signup"
                      ? "Create Account"
                      : "Send Reset Link"}
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-950/80" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#09090b] border border-zinc-950/80 px-2 rounded-full text-zinc-600 font-bold">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => {
                router.push("/auth/google");
              }}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 transition-colors py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => {
                router.push("/auth/github");
              }}
              className="bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 transition-colors py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>GitHub</span>
            </button>
          </div>

          {/* Toggle */}
          <div className="text-center text-xs text-zinc-500">
            {authMode === "signin" ? (
              <>
                <span>New to InterviewMirror? </span>
                <span
                  onClick={() => setAuthMode("signup")}
                  className="text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  Create account
                </span>
              </>
            ) : authMode === "signup" ? (
              <>
                <span>Already have an account? </span>
                <span
                  onClick={() => setAuthMode("signin")}
                  className="text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  Sign in
                </span>
              </>
            ) : (
              <span
                onClick={() => setAuthMode("signin")}
                className="text-indigo-400 hover:underline cursor-pointer font-medium"
              >
                Back to Sign in
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
