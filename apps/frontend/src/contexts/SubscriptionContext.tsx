"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of subscription data returned by the backend
interface SubscriptionInfo {
  tier: 'FREE' | 'PRO' | 'PREMIUM' | 'DEMO' | null; // null if not logged in or no tier
  interviewsUsed: number;
  interviewLimit: number; // max interviews per month for the tier
  // You can extend with additional feature flags if needed
}

interface SubscriptionContextProps extends SubscriptionInfo {
  isLocked: boolean; // true when usage exceeds limit
  canAccessFeature: (featureKey: string) => boolean;
  refreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(undefined);

// Helper to map tier to interview limits (adjust according to business rules)
const tierLimits: Record<string, number> = {
  FREE: 5,
  PRO: 30,
  PREMIUM: 999999,
  DEMO: 999999,
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<SubscriptionInfo['tier']>(null);
  const [interviewsUsed, setInterviewsUsed] = useState(0);
  const [interviewLimit, setInterviewLimit] = useState(0);

  const fetchSubscription = async () => {
    try {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.port === "3000" ||
         window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

      const res = await fetch(`${apiBase}/api/v1/auth/me`, {
        headers: {
          ...((typeof window !== "undefined" && window.localStorage.getItem("mock_auth_token"))
            ? { "Authorization": `Bearer ${window.localStorage.getItem("mock_auth_token")}` }
            : {})
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch subscription data');
      const json = await res.json();
      
      if (json.success && json.data) {
        const rawTier = json.data.subscription?.tier ?? null;
        // Map backend ENTERPRISE tier to frontend PREMIUM tier
        const userTier: SubscriptionInfo['tier'] = rawTier === 'ENTERPRISE' ? 'PREMIUM' : rawTier;
        const used: number = Number(json.data.interviewsUsed) || 0;
        const limit = userTier && tierLimits[userTier] ? tierLimits[userTier] : 0;
        setTier(userTier);
        setInterviewsUsed(used);
        setInterviewLimit(limit);
      } else {
        throw new Error('Subscription response invalid');
      }
    } catch (err) {
      console.error('[SubscriptionContext] error fetching subscription:', err);
      // Fallback decode from cookie
      try {
        const getCookie = (name: string) => {
          if (typeof document === "undefined") return null;
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        const token = getCookie("access_token");
        if (token) {
          const base64 = token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          const rawTier = payload.tier ?? null;
          const userTier: SubscriptionInfo['tier'] = rawTier === 'ENTERPRISE' ? 'PREMIUM' : rawTier;
          setTier(userTier);
          setInterviewsUsed(0);
          setInterviewLimit(userTier && tierLimits[userTier] ? tierLimits[userTier] : 0);
        } else {
          setTier(null);
          setInterviewsUsed(0);
          setInterviewLimit(0);
        }
      } catch (cookieErr) {
        setTier(null);
        setInterviewsUsed(0);
        setInterviewLimit(0);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchSubscription();
  }, []);

  const isLocked = interviewLimit > 0 && interviewsUsed >= interviewLimit;

  // Simple feature‑gate based on tier
  const canAccessFeature = (featureKey: string): boolean => {
    if (!tier) return false;
    // Demo user bypasses everything
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    try {
      const token = getCookie("access_token");
      if (token) {
        const base64 = token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        if (payload.email === 'demo@interviewmirror.ai') return true;
      }
    } catch {}

    const featureMap: Record<string, string[]> = {
      analytics: ['PRO', 'PREMIUM'],
      reports: ['PRO', 'PREMIUM'],
      "recruiter-intelligence": ['PREMIUM'],
      "premium-features": ['PREMIUM'],
    };
    const allowedTiers = featureMap[featureKey] || [];
    return allowedTiers.includes(tier);
  };

  const refreshSubscription = () => {
    fetchSubscription();
  };

  const contextValue: SubscriptionContextProps = {
    tier,
    interviewsUsed,
    interviewLimit,
    isLocked,
    canAccessFeature,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return ctx;
};
