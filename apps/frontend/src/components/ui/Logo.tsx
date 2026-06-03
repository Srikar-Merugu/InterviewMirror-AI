"use client";

import React from "react";
import Link from "next/link";

type LogoVariant = "horizontal" | "icon-only" | "mark" | "animated";

interface LogoProps {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
  className?: string;
  glow?: boolean;
}

const sizeMap = {
  sm: { box: "w-7 h-7", icon: "w-3.5 h-3.5", text: "text-sm", svgSize: 20 },
  md: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-lg", svgSize: 24 },
  lg: { box: "w-10 h-10", icon: "w-5 h-5", text: "text-xl", svgSize: 28 },
};

export function LogoIcon({ size = "md", className = "", glow = false }: { size?: "sm" | "md" | "lg"; className?: string; glow?: boolean }) {
  const s = sizeMap[size];
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 ${s.box} ${glow ? "shadow-lg shadow-cyan-500/20" : "shadow-lg shadow-cyan-500/10"} transition-all duration-300 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={s.icon}
      >
        <polygon points="12,3 20,11 4,11" fill="white" opacity="0.95" />
        <polygon points="12,21 20,13 4,13" fill="white" opacity="0.35" />
        <rect x="3.5" y="11" width="17" height="2" rx="1" fill="white" opacity="0.7" />
        <circle cx="4" cy="4" r="1.5" fill="white" opacity="0.6" />
        <circle cx="20" cy="20" r="1.5" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}

export function Logo({
  variant = "horizontal",
  size = "md",
  href = "/",
  showText = true,
  className = "",
  glow = true,
}: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <LogoIcon size={size} glow={glow} />
      {showText && variant !== "icon-only" && (
        <span
          className={`font-heading font-bold ${s.text} tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-300`}
        >
          InterviewMirror AI
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function AnimatedLogo({ size = "lg", text = "InterviewMirror AI" }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const s = sizeMap[size];
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative animate-pulse-soft">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 blur-xl opacity-50 animate-pulse" />
        <LogoIcon size={size} glow />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span
          className={`font-heading font-bold ${s.text} tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent`}
        >
          {text}
        </span>
        <div className="flex gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
