"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              <Link
                href="/auth/reset-password"
                className="text-[11px] text-zinc-500 hover:text-orbit-blue transition font-medium"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orbit-blue hover:bg-blue-500 active:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-orbit-blue hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
