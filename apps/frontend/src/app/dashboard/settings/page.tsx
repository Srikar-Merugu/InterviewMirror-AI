"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Sparkles,
  Check,
  Sun,
  Moon,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
import { getAuthHeaders, getCookie } from "../../../utils/auth";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profileName, setProfileName] = useState("Loading...");
  const [profileEmail, setProfileEmail] = useState(
    "loading@interviewmirror.com",
  );
  const [targetRole, setTargetRole] = useState("Senior AI Systems Architect");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync theme with local storage & fetch dynamic user details on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("app_theme") as
        | "dark"
        | "light"
        | null;
      setTheme(storedTheme || "dark");
    }

    const fallbackFromToken = () => {
      try {
        const token = getCookie("access_token");
        if (token) {
          const decoded = JSON.parse(window.atob(token));
          setProfileName(decoded.name || decoded.email?.split("@")[0] || "Candidate User");
          setProfileEmail(decoded.email || "candidate@interviewmirror.com");
        } else {
          setProfileName("Candidate User");
          setProfileEmail("candidate@interviewmirror.com");
        }
      } catch (e) {
        setProfileName("Candidate User");
        setProfileEmail("candidate@interviewmirror.com");
      }
    };

    const fetchProfile = async () => {
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
            const user = resJson.data;
            setProfileName(user.name || "");
            setProfileEmail(user.email || "");
          } else {
            fallbackFromToken();
          }
        } else {
          fallbackFromToken();
        }
      } catch (err) {
        console.error("Failed to load registered user details:", err);
        fallbackFromToken();
      }
    };

    fetchProfile();
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg(null);

    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const response = await fetch(`${apiBase}/api/v1/auth/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to update profile details");
      }

      if (resJson.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error("Failed to update profile details:", err);
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
          Portal Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage your candidate profile details, notification limits, billing
          subscriptions, and theme modes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Profile settings */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${GLASSMORPHISM_STYLES.card} p-6 border-zinc-900/60`}
          >
            <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-zinc-900">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Candidate Profile Details
              </h3>
            </div>

            {success && (
              <div className="mb-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-2.5 rounded text-xs">
                Profile details successfully saved and synced to database nodes.
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 bg-red-950/20 border border-red-900/30 text-red-400 p-2.5 rounded text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full ${GLASSMORPHISM_STYLES.input} border-zinc-800 text-zinc-200 placeholder:text-zinc-700 text-xs`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className={`w-full ${GLASSMORPHISM_STYLES.input} border-zinc-800 text-zinc-200 placeholder:text-zinc-700 text-xs`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">
                  Target Tech Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={`w-full ${GLASSMORPHISM_STYLES.input} border-zinc-800 text-zinc-200 placeholder:text-zinc-700 text-xs`}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`${INTERACTION_CLASSES.primaryButton} py-2 px-4 flex items-center justify-center`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    <span>Save profile details</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Notification bounds */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${GLASSMORPHISM_STYLES.card} p-6 border-zinc-900/60`}
          >
            <div className="flex items-center space-x-2.5 mb-4 pb-2 border-b border-zinc-900">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Alert Checkpoints Configuration
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Email assessment summary immediately on compilation",
                  desc: "Sends completed rubrics metrics right after you press End Session in sandbox.",
                },
                {
                  label: "Weekly progress analytics email digest",
                  desc: "Summarizes posture slump counts, wpm deviations, and average gazes.",
                },
                {
                  label: "New recruiter connection notifications",
                  desc: "Notify when hiring managers click on public share links.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 text-xs leading-normal"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 accent-indigo-500 rounded border-zinc-800 bg-zinc-900 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="font-semibold text-zinc-300">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Theme & Billing summary info */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60`}
          >
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-3">
              Layout Color theme
            </h3>

            <button
              onClick={handleToggleTheme}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 p-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2 text-zinc-300">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-purple-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {theme === "dark"
                    ? "Dark Canvas (Selected)"
                    : "Slate Light (Selected)"}
                </span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${GLASSMORPHISM_STYLES.card} p-5 border-zinc-900/60 space-y-4`}
          >
            <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-900">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Active Subscription
              </h3>
            </div>

            <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-lg">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Plan Name
              </div>
              <div className="text-lg font-heading font-black text-emerald-400 mt-1">
                Professional Candidate
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                $15 / month (Billed annually)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Unlimited AI Mock sessions</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Recruiter links sharing enabled</span>
              </div>
            </div>

            <button className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              Manage billing parameters
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
