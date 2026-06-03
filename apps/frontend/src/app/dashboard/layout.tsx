"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
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
import { Logo, LogoIcon } from "../../components/ui/Logo";
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
    <div
      className="min-h-screen flex relative transition-colors duration-300"
      style={{ color: "var(--color-text)", backgroundColor: "var(--color-bg)" }}
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r relative z-30 transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
        style={{ backgroundColor: "var(--color-sidebar)", borderColor: "var(--color-border)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex flex-col">
          {/* Logo */}
          <div className={`flex items-center py-5 ${collapsed ? "justify-center px-0" : "justify-between px-4"}`} style={{ borderColor: "var(--color-border)" }}>
            {collapsed ? (
              <LogoIcon size="sm" glow />
            ) : (
              <Logo variant="horizontal" size="sm" href="/dashboard/home" showText />
            )}

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
                  }`}
                  style={{
                    color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                    backgroundColor: isActive ? "var(--color-nav-active)" : "transparent",
                    borderColor: isActive ? "var(--color-border)" : "transparent",
                    borderWidth: isActive ? "1px" : "1px",
                    borderStyle: "solid",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}}
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
        <div className="p-3 space-y-1" style={{ borderColor: "var(--color-border)", borderTopWidth: "1px" }}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-xl text-xs transition-all ${
              collapsed ? "justify-center p-2.5" : "p-2.5 gap-3"
            }`}
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
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
              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all md:hidden"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </button>
          )}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-xs transition-all"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-xs transition-all ${
              collapsed ? "justify-center p-2.5" : "p-2.5 gap-3"
            }`}
            style={{ color: "rgba(248,113,113,0.7)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.05)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b backdrop-blur-xl transition-colors duration-300"
          style={{ backgroundColor: "var(--color-header)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="transition-colors md:hidden"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              {pathname.split("/").filter(Boolean).join(" / ") || "dashboard"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl transition-all"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
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
                    className="absolute right-0 top-10 w-72 p-4 rounded-2xl backdrop-blur-2xl shadow-2xl z-50"
                    style={{ backgroundColor: "var(--color-sidebar)", border: "1px solid var(--color-border)" }}
                  >
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
                      Notifications
                    </h4>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto">
                      <div className="text-xs pb-3" style={{ color: "var(--color-text-secondary)", borderBottom: "1px solid var(--color-border)" }}>
                        <span className="font-semibold" style={{ color: "var(--color-text)" }}>Session Complete</span>
                        <p className="mt-0.5" style={{ color: "var(--color-text-muted)" }}>AI feedback compiled for Technical Architect assessment.</p>
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        <span className="text-indigo-400 font-semibold">Plan Updated</span>
                        <p className="mt-0.5" style={{ color: "var(--color-text-muted)" }}>Subscription synced with current tier.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/dashboard/settings"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-nav-hover)", color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-active)"; e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
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
                className="fixed inset-y-0 left-0 w-64 backdrop-blur-2xl border-r z-50 md:hidden flex flex-col"
                style={{ backgroundColor: "var(--color-sidebar)", borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <Logo variant="horizontal" size="sm" href="/dashboard/home" showText glow={false} />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; }}
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
                        className={`flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all`}
                        style={{
                          color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                          backgroundColor: isActive ? "var(--color-nav-active)" : "transparent",
                          border: isActive ? "1px solid var(--color-border)" : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-3 space-y-1" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-xs transition-all"
                    style={{ color: "var(--color-text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-nav-hover)"; e.currentTarget.style.color = "var(--color-text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
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
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-xs transition-all"
                    style={{ color: "rgba(248,113,113,0.7)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.05)"; e.currentTarget.style.color = "#f87171"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
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
