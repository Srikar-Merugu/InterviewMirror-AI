"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  CreditCard,
  Sparkles,
  Check,
  Sun,
  Moon,
  Save,
  RefreshCw,
  Loader2,
  ChevronRight,
  Mail,
} from "lucide-react";
import { getAuthHeaders, getCookie } from "../../../utils/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [profileName, setProfileName] = useState("Loading...");
  const [profileEmail, setProfileEmail] = useState("loading@interviewmirror.com");
  const [targetRole, setTargetRole] = useState("Senior AI Systems Architect");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("FREE");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("app_theme") as "dark" | "light" | null;
      setTheme(storedTheme || "dark");
    }

    const fallbackFromToken = () => {
      try {
        const token = getCookie("access_token");
        if (token) {
          const decoded = JSON.parse(window.atob(token));
          setProfileName(decoded.name || decoded.email?.split("@")[0] || "Candidate User");
          setProfileEmail(decoded.email || "candidate@interviewmirror.com");
          setSubscriptionTier(decoded.subscription?.tier || "FREE");
        } else {
          setProfileName("Candidate User");
          setProfileEmail("candidate@interviewmirror.com");
          setSubscriptionTier("FREE");
        }
      } catch {
        setProfileName("Candidate User");
        setProfileEmail("candidate@interviewmirror.com");
        setSubscriptionTier("FREE");
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
            setSubscriptionTier(user.subscription?.tier || "FREE");
          } else {
            fallbackFromToken();
          }
        } else {
          fallbackFromToken();
        }
      } catch {
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
        body: JSON.stringify({ name: profileName, email: profileEmail }),
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
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your profile, notifications, billing, and theme preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/[0.04]">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Profile Details
              </h3>
            </div>

            {success && (
              <div className="mb-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                Profile saved successfully.
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 bg-red-500/5 border border-red-500/10 text-red-400 p-3 rounded-xl text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Target Tech Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />

              <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/[0.04]">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Email assessment summary on compilation",
                  desc: "Receive completed rubrics right after ending a session.",
                },
                {
                  label: "Weekly progress analytics digest",
                  desc: "Summarizes posture, WPM deviations, and gaze metrics.",
                },
                {
                  label: "New recruiter connection alerts",
                  desc: "Notify when hiring managers view your share links.",
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 accent-indigo-500 rounded border-white/[0.08] bg-white/[0.03] w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-medium text-zinc-300">{item.label}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Theme */}
          <GlassCard className="p-5">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-3">
              Theme
            </h3>

            <button
              onClick={handleToggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all text-xs"
            >
              <div className="flex items-center gap-2 text-zinc-300">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-purple-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          </GlassCard>

          {/* Subscription */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.04] mb-4">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="font-heading font-semibold text-sm text-zinc-200">
                Subscription
              </h3>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl mb-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                Current Plan
              </div>
              <div className="text-xl font-heading font-black premium-gradient-text mt-1">
                {subscriptionTier === "FREE"
                  ? "Starter"
                  : subscriptionTier === "PRO"
                    ? "Pro"
                    : "Premium"}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {subscriptionTier === "FREE"
                  ? "$0 / month (5 runs/mo)"
                  : subscriptionTier === "PRO"
                    ? "$19 / month (30 runs/mo)"
                    : "$49 / month (Unlimited)"}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {subscriptionTier === "FREE" ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Check className="w-3.5 h-3.5 text-zinc-600" />
                    <span>5 Mock interviews / month</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Check className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Standard dashboard analytics</span>
                  </div>
                </>
              ) : subscriptionTier === "PRO" ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>30 Mock interviews / month</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Iris & slumping telemetry</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unlimited interviews</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All recruiter analytics</span>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => { window.location.href = "/pricing"; }}
              className="w-full"
              size="sm"
            >
              Manage Billing
              <ChevronRight className="w-3 h-3" />
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
