import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  /**
   * Decode JWT or base64 JSON token payload.
   * Real JWTs: header.payload.signature (3 parts, decode part[1])
   * Fake signup tokens: single base64 blob (decode the whole token)
   */
  const getTokenPayload = (token: string): any => {
    try {
      const parts = token.split(".");
      let payloadBase64: string;

      if (parts.length === 3) {
        // Real JWT — decode the payload part (index 1)
        payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      } else {
        // Fake base64 JSON token (signup flow)
        payloadBase64 = token.replace(/-/g, "+").replace(/_/g, "/");
      }

      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  };

  /**
   * Check if a token is expired.
   * - Real JWTs with an `exp` claim: compare against current time.
   * - Tokens without `exp` (signup fake tokens): treat as NOT expired.
   */
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = getTokenPayload(token);
      if (!payload.exp) return false; // no exp = treat as valid
      return Date.now() >= payload.exp * 1000;
    } catch {
      return false; // never block on decode error
    }
  };

  // ── Dashboard: require valid token ──────────────────────────────────────────
  if (isDashboardRoute) {
    if (!accessToken || isTokenExpired(accessToken)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }
    const payload = getTokenPayload(accessToken);
    const tier = payload.tier;
    // Demo account bypasses all plan gating
    if (payload.email !== "demo@interviewmirror.ai" && !tier) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/onboarding/plan";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ── Onboarding: require a token, block if they already have a plan ──────────
  if (isOnboardingRoute) {
    if (!accessToken || isTokenExpired(accessToken)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }
    const payload = getTokenPayload(accessToken);
    const tier = payload.tier;
    // If they already picked a plan, send to dashboard
    if (tier === "FREE" || tier === "PRO" || tier === "ENTERPRISE") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard/home";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ── Auth pages: always show login page (no auto-redirect) ──────────────────
  // (intentionally empty — always let /auth pass through)

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth", "/onboarding/:path*"],
};
