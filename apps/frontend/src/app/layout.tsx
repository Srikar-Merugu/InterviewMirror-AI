import React from "react";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../styles/global.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "InterviewMirror AI — AI-Powered Interview Coaching Platform",
  description:
    "Master every interview with real-time AI feedback on posture, eye contact, speech confidence, and behavioral responses. Silicon Valley-grade interview intelligence.",
  keywords: [
    "AI interview coach",
    "mock interview",
    "behavioral training",
    "speech analytics",
    "posture tracking",
  ],
  openGraph: {
    title: "InterviewMirror AI — AI-Powered Interview Coaching",
    description:
      "Master every interview with real-time AI feedback on posture, eye contact, and speech confidence.",
    type: "website",
  },
};

import { SubscriptionProvider } from "../contexts/SubscriptionContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} antialiased min-h-screen relative bg-[#0a0a0b] font-sans`}
      >
        <div className="fixed top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0" />
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none z-0" />

        <SubscriptionProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </SubscriptionProvider>
      </body>
    </html>
  );
}
