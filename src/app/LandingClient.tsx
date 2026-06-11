"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import CreateMeetingModal from "@/components/dashboard/CreateMeetingModal";
import TitleBar from "@/components/ui/TitleBar";

export default function LandingClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If user is already logged in, skip the landing
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleJoin = useCallback(() => {
    const digits = joinId.replace(/\D/g, "");
    if (digits.length < 9) {
      setJoinError("Meeting ID must be 9 digits");
      return;
    }
    router.push(`/join?mid=${digits}`);
  }, [joinId, router]);

  const formatJoinId = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }, []);

  // Still loading — show nothing flashy
  if (loading || !mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <svg className="w-6 h-6 animate-spin text-zinc-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // User is authenticated — will redirect
  if (user) return null;

  return (
    <div className="h-full w-full flex flex-col bg-[#0c0c0d]">
      <TitleBar title="Orbit" showControls={false} />

      {/* Stage area — mimics the mockup's video stage layout */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Decorative topbar strip (like the mockup's topbar) */}
        <div className="absolute top-0 inset-x-0 h-12 border-b border-white/[0.04] flex items-center justify-between px-5 z-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-medium tracking-wide">
              <svg className="w-3.5 h-3.5 text-zinc-700" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l7 3v6c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V5l7-3z" fill="#1a1a1a" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              End-to-end encrypted
            </span>
            <span className="w-px h-3 bg-white/[0.06]" />
            <span className="text-[11px] text-zinc-600 font-medium">Orbit · v1.0</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-[11px] text-zinc-500 hover:text-white font-medium transition px-2 py-1 rounded-lg hover:bg-white/[0.04]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-[11px] font-semibold text-white bg-orbit-blue/90 hover:bg-orbit-blue px-3 py-1.5 rounded-lg transition active:scale-95"
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Ambient — subtle, like the mockup */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orbit-blue/[0.02] rounded-full blur-[120px]" />
        </div>

        {/* Hero — compact, no splash, no marketing fluff */}
        <div className="relative z-10 w-full max-w-lg mx-auto px-6 -mt-8">
          <div className="text-center mb-9">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none" className="text-[#7dd44a]">
                <ellipse cx="16" cy="16" rx="13" ry="6" stroke="currentColor" strokeWidth="2.2" transform="rotate(-28 16 16)"/>
                <circle cx="16" cy="16" r="3.4" fill="currentColor"/>
                <circle cx="26.2" cy="10.5" r="1.7" fill="currentColor"/>
              </svg>
              <span className="text-sm font-semibold text-white/80 tracking-wide">Orbit Meeting</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Secure video meetings. Start instantly — no account needed to join.
            </p>
          </div>

          {/* Action panel — glass card, single-column, clean */}
          <div className="bg-[#141416]/90 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Quick Join */}
            <div className="p-5 pb-4 border-b border-white/[0.04]">
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={joinId}
                    onChange={(e) => { setJoinId(formatJoinId(e.target.value)); setJoinError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="Enter meeting ID"
                    inputMode="numeric"
                    maxLength={11}
                    className="w-full bg-[#0c0c0d] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#7dd44a]/60 focus:ring-1 focus:ring-[#7dd44a]/20"
                  />
                  {joinError && (
                    <p className="absolute -bottom-5 left-1 text-[10px] text-red-400">{joinError}</p>
                  )}
                </div>
                <button
                  onClick={handleJoin}
                  className="bg-[#7dd44a] hover:bg-[#6dc43a] active:bg-[#5db42a] text-[#0c0c0d] font-semibold text-sm px-5 py-3 rounded-xl transition active:scale-[0.97] shrink-0"
                >
                  Join
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-3 ml-1">xxx-xxx-xxx · no account required</p>
            </div>

            {/* Action links */}
            <div className="flex">
              <button
                onClick={() => setCreateOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.03] transition border-r border-white/[0.04] active:bg-white/[0.06]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                New Meeting
              </button>
              <Link
                href="/auth/signup"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.03] transition active:bg-white/[0.06]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar — like the mockup's control bar silhouette */}
        <div className="absolute bottom-0 inset-x-0 h-16 border-t border-white/[0.03] flex items-center justify-center gap-6 px-5 z-10">
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-700">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            No time limits
          </span>
          <span className="w-px h-3 bg-white/[0.04]" />
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-700">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><path d="M8.5 14a4 4 0 007 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Up to 100 participants
          </span>
        </div>
      </main>

      <CreateMeetingModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
