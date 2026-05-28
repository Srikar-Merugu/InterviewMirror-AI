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
import { GLASSMORPHISM_STYLES, INTERACTION_CLASSES } from "@interviewmirror/ui";
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

  // Sync theme with DOM on mount
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

      // Call backend logout to clear HttpOnly cookies securely
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
        // Force expire client side copies in case they exist
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex text-zinc-100 relative bg-canvas theme-transition">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] radial-glowing-effect pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-zinc-900 bg-zinc-950/40 backdrop-blur-lg relative z-30 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Brand area */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-zinc-900/60">
            <Link
              href="/dashboard/home"
              className="flex items-center space-x-3 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              {!collapsed && (
                <span className="font-heading font-black text-sm tracking-tight text-white truncate">
                  InterviewMirror
                </span>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer hidden md:block"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-4">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center p-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-zinc-900 border border-zinc-800 text-white shadow-md"
                      : "text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200 border border-transparent"
                  } ${collapsed ? "justify-center" : "space-x-3"}`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-zinc-900 space-y-2">
          {/* Theme toggler inside Collapsible sidebar */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center p-2.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200 cursor-pointer transition-all ${
              collapsed ? "justify-center" : "space-x-3"
            }`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-purple-400" />
            )}
            {!collapsed && (
              <span>
                {theme === "dark" ? "Light theme" : "Dark brand theme"}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-2.5 rounded-lg text-xs text-red-400 hover:bg-red-950/20 hover:text-red-200 cursor-pointer transition-all ${
              collapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        {/* Top Header bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-md">
          {/* Left: Mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-zinc-400 hover:text-zinc-200 cursor-pointer md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-zinc-500 font-mono hidden md:block">
              {pathname}
            </div>
          </div>

          {/* Right: Notifications and Quick user settings */}
          <div className="flex items-center space-x-3 relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </button>

            {/* Simulated notification dropdown drawer */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-12 top-10 w-72 p-4 shadow-2xl z-50 ${GLASSMORPHISM_STYLES.popover}`}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-900 pb-1.5">
                    Recent Alerts
                  </h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    <div className="text-[11px] text-zinc-300 leading-relaxed border-b border-zinc-900/60 pb-2">
                      <span className="font-semibold text-emerald-400">
                        Mock Session Completed
                      </span>
                      : AI feedback metrics successfully compiled for Technical
                      Architect assessment.
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-relaxed">
                      <span className="font-semibold text-indigo-400">
                        Subscription Updated
                      </span>
                      : Account synched with Clerk standard sandbox access
                      levels.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Link
              href="/dashboard/settings"
              className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900 text-zinc-400 cursor-pointer"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="fixed inset-y-0 left-0 w-64 bg-zinc-950 p-6 border-r border-zinc-900 z-50 md:hidden flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <span className="font-heading font-black text-sm tracking-tight text-white flex items-center space-x-2">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                      <span>InterviewMirror</span>
                    </span>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-2">
                    {navLinks.map((link) => {
                      const IconComponent = link.icon;
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center p-3 rounded-lg text-xs font-semibold cursor-pointer border ${
                            isActive
                              ? "bg-zinc-900 border-zinc-800 text-white"
                              : "text-zinc-400 hover:bg-zinc-900/30 border-transparent"
                          } space-x-3`}
                        >
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-900">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center p-3 rounded-lg text-xs text-zinc-400 hover:bg-zinc-900/30 cursor-pointer space-x-3"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-purple-400" />
                    )}
                    <span>
                      {theme === "dark" ? "Light theme" : "Dark theme"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center p-3 rounded-lg text-xs text-red-400 hover:bg-red-950/20 cursor-pointer space-x-3"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Nested Inner Route Frame */}
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
}
