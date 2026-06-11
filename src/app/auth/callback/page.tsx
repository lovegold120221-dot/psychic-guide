"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    // Password recovery flow
    if (type === "recovery") {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        supabase.auth.getSession().then(({ data: { session }, error: err }) => {
          if (err || !session) {
            setError("Failed to verify recovery link. Please try again.");
            return;
          }
          router.push("/auth/update-password");
          router.refresh();
        });
      } else {
        router.push("/auth/login");
      }
      return;
    }

    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      // Exchange the hash for a session (signup / magic link)
      supabase.auth.getSession().then(({ data: { session }, error: err }) => {
        if (err || !session) {
          setError("Failed to verify your email. Please try again.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
      });
    } else {
      // Check for code in query params (email confirmation)
      const code = params.get("code");
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
          if (err) {
            setError("Failed to verify your email. Please try again.");
            return;
          }
          router.push("/dashboard");
          router.refresh();
        });
      } else {
        router.push("/auth/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/auth/login" className="text-orbit-blue hover:underline text-sm">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="text-center">
        <svg className="w-8 h-8 animate-spin text-orbit-blue mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-zinc-400">Verifying your email...</p>
      </div>
    </div>
  );
}
