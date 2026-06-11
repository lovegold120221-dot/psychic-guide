"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orbit-green/5 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40 p-8">
            <div className="w-16 h-16 bg-orbit-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orbit-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-zinc-400 mb-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-semibold text-orbit-blue mb-4">{email}</p>
            <p className="text-xs text-zinc-500">
              Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.
            </p>
            <Link
              href="/auth/login"
              className="inline-block mt-6 text-sm text-orbit-blue hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orbit-blue/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-orbit-panel border border-zinc-700/50 p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center mb-5">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Orbit Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your Orbit account</h1>
          <p className="text-sm text-zinc-400 mt-2">Start meeting in seconds</p>
        </div>

        <div className="bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Victor"
                  required
                  className="w-full bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Email
                </label>
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
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orbit-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
