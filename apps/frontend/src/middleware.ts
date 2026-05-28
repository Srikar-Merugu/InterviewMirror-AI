import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth");
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  // Decodes JWT payload and checks expiration
  const isTokenExpired = (token: string): boolean => {
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return true;

      // Handle Base64Url padding
      const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const payload = JSON.parse(jsonPayload);
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  // Decode token to extract tier claim
  const getTokenPayload = (token: string): any => {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return {};
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  };

  if (isDashboardRoute) {
    if (!accessToken || isTokenExpired(accessToken)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }
    const payload = getTokenPayload(accessToken);
    const tier = payload.tier;
    // Exclude demo user from tier gating
    if (payload.email !== 'demo@interviewmirror.ai' && !tier) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/onboarding/plan';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isOnboardingRoute) {
    if (!accessToken || isTokenExpired(accessToken)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth";
      return NextResponse.redirect(redirectUrl);
    }
    const payload = getTokenPayload(accessToken);
    const tier = payload.tier;
    if (tier === 'FREE' || tier === 'PRO' || tier === 'ENTERPRISE') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard/home';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthRoute) {
    if (accessToken && !isTokenExpired(accessToken)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard/home";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth", "/onboarding/:path*"],
};
