"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.01] backdrop-blur-2xl ${
        hover
          ? "transition-all duration-300 hover:from-white/[0.08] hover:to-white/[0.02] hover:border-white/[0.1] hover:-translate-y-0.5"
          : ""
      } ${glow ? "shadow-[0_0_30px_-5px_rgba(99,102,241,0.1)]" : "shadow-premium"} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
