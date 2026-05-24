/**
 * InterviewMirror AI - Premium Design System Tokens & Presets
 * Inspired by Linear, Vercel, and Scale AI.
 */

export const DESIGN_TOKENS = {
  colors: {
    canvas: "#09090b", // Ultra-dark canvas background
    surface: "#18181b", // Sleek card background
    surfaceElevated: "#27272a", // Elevated interface items
    border: "#27272a", // Standard micro-border
    borderMuted: "#1f1f22", // Fine separation border
    accent: "#ffffff", // Pure high-contrast white
    accentGlow: "rgba(255, 255, 255, 0.08)", // Radial light glows
    primary: "#6366f1", // Indigo core AI indicator
    success: "#10b981", // Emerald positive feedback
    warning: "#f59e0b", // Amber caution scores
    error: "#ef4444", // Red critical errors
  },
  typography: {
    fontSans: "Inter, system-ui, sans-serif",
    fontHeading: "Outfit, system-ui, sans-serif",
  },
  animations: {
    transitionSmooth: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    transitionFast: "all 0.15s ease-out",
  },
};

export const GLASSMORPHISM_STYLES = {
  card: "backdrop-blur-md bg-zinc-900/40 border border-zinc-800/80 rounded-xl",
  header: "backdrop-blur-lg bg-zinc-950/60 border-b border-zinc-900/80",
  popover: "backdrop-blur-md bg-zinc-950/80 border border-zinc-800 rounded-lg",
  input:
    "bg-zinc-900/50 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all rounded-md px-3 py-2 text-sm",
};

export const INTERACTION_CLASSES = {
  hoverGlow:
    "hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:border-zinc-700 transition-all duration-300",
  interactiveCard:
    "cursor-pointer active:scale-[0.98] transition-transform duration-100",
  primaryButton:
    "bg-white text-black hover:bg-zinc-200 active:scale-[0.97] transition-all font-medium py-2 px-4 rounded-md text-sm cursor-pointer shadow-md inline-flex items-center justify-center",
  secondaryButton:
    "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.97] transition-all font-medium py-2 px-4 rounded-md text-sm cursor-pointer inline-flex items-center justify-center",
};
