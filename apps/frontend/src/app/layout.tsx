import React from "react";
import "../styles/global.css";

export const metadata = {
  title:
    "InterviewMirror AI — mock interview and behavioral intelligence platform",
  description:
    "Silicon Valley grade real-time eye-contact, posture, facial expressions and speech confidence AI analytics platform.",
};

import { SubscriptionProvider } from "../contexts/SubscriptionContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen relative bg-[#09090b]">
        {/* Glow overlay at the top to add luxury SaaS feel */}
        <div className="absolute top-0 left-0 right-0 h-[600px] radial-glowing-effect pointer-events-none z-0" />

        <SubscriptionProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </SubscriptionProvider>
      </body>
    </html>
  );
}
