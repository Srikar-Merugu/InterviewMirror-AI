"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Bell,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAuthHeaders } from "../../utils/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("app_theme") as
        | "dark"
        | "light"
        | null;
      const initialTheme = storedTheme || "dark";
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
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

  const navLinks = [
    { name: "Home Dashboard", href: "/dashboard/home", icon: Home },
    { name: "Mock Sandbox", href: "/dashboard/interview", icon: Camera },
    { name: "Visual Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Portal Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout failed, executing local fallback:", err);
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("mock_auth_token");
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex text-zinc-100 relative bg-[#0a0a0b]">
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-white/[0.04] bg-[#0a0a0b]/80 backdrop-blur-2xl relative z-30 transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo */}
          <div className={`flex items-center py-5 border-b border-white/[0.04] ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
            <Link
              href="/dashboard/home"
              className="flex items-center gap-3 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!collapsed && (
                <span className="font-heading font-bold text-sm text-white truncate">
                  InterviewMirror
                </span>
              )}
            </Link>

            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 mt-3">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center rounded-xl text-xs font-medium transition-all duration-200 relative ${
                    collapsed ? "justify-center p-2.5" : "p-2.5 gap-3"
                  } ${
                    isActive
                      ? "bg-white/[0.06] text-white border border-white/[0.06]"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-400"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.04] space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all ${
              collapsed ? "justify-center p-2.5" : "p-2.5 gap-3"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
            )}
          </button>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all md:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </button>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all ${
              collapsed ? "justify-center p-2.5" : "p-2.5 gap-3"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.04] bg-[#0a0a0b]/60 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              {pathname.split("/").filter(Boolean).join(" / ") || "dashboard"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping-slow" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-10 w-72 p-4 rounded-2xl bg-[#0a0a0b]/95 backdrop-blur-2xl border border-white/[0.06] shadow-2xl z-50"
                  >
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                      Notifications
                    </h4>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto">
                      <div className="text-xs text-zinc-400 pb-3 border-b border-white/[0.04]">
                        <span className="text-emerald-400 font-semibold">Session Complete</span>
                        <p className="text-zinc-500 mt-0.5">AI feedback compiled for Technical Architect assessment.</p>
                      </div>
                      <div className="text-xs text-zinc-400">
                        <span className="text-indigo-400 font-semibold">Plan Updated</span>
                        <p className="text-zinc-500 mt-0.5">Subscription synced with current tier.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/dashboard/settings"
              className="w-8 h-8 rounded-xl border border-white/[0.06] flex items-center justify-center bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0b]/95 backdrop-blur-2xl border-r border-white/[0.04] z-50 md:hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
                  <span className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    InterviewMirror
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 p-3 space-y-1 mt-2">
                  {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? "bg-white/[0.06] text-white border border-white/[0.06]"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-3 border-t border-white/[0.04] space-y-1">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-all"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-purple-400" />
                    )}
                    <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
