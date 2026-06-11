"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, [supabase]);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  // No session — user probably navigated here directly
  if (hasSession === false) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orbit-blue/5 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40 p-8">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No active session</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Please click the link from your password reset email to set a new password.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-orbit-blue hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hasSession === null) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <svg className="w-6 h-6 animate-spin text-zinc-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Password updated</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Your password has been changed successfully.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-orbit-blue hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              Go to Dashboard
            </button>
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
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Choose a strong password you haven&apos;t used before
          </p>
        </div>

        <div className="bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8">
          <form onSubmit={handleUpdate} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Password</label>
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

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your new password"
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
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
