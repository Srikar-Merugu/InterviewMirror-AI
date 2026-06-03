"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthHeaders } from "@/utils/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function CashfreeReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const tier = searchParams.get("tier");

    if (!orderId) {
      setStatus("error");
      setMessage("Missing order information. Please contact support.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const isDev =
          window.location.port === "3000" ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";
        const apiBase = process.env.NEXT_PUBLIC_API_URL || (isDev ? `http://${window.location.hostname}:5001` : "");

        const res = await fetch(`${apiBase}/api/v1/subscription/cashfree/verify`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({ order_id: orderId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any).error?.message || "Verification failed");
        }

        const data = await res.json();

        if (data.status === "PAID" || data.status === "ALREADY_PAID") {
          setStatus("success");
          setMessage(`Payment successful! Upgraded to ${tier || "your plan"}. Redirecting...`);

          if (data.accessToken) {
            document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`;
          }
          if (data.refreshToken) {
            document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
          }

          setTimeout(() => {
            router.push("/dashboard/home?billing_success=true");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(`Payment status: ${data.status || "PENDING"}. Please try again.`);
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Payment verification failed. Please contact support.");
        setTimeout(() => {
          router.push("/pricing?billing_cancelled=true");
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-8 shadow-2xl">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              <p className="text-zinc-300 text-sm font-medium">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-emerald-400">Payment Verified!</h2>
              <p className="text-zinc-400 text-sm">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-red-400">Verification Failed</h2>
              <p className="text-zinc-400 text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
