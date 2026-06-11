"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VideoPreview from "@/components/shared/VideoPreview";
import { useMeetingId, useCopyToClipboard } from "@/lib/hooks";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMeetingModal({
  isOpen,
  onClose,
}: CreateMeetingModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { meetingId, regenerate } = useMeetingId();
  const { copied, copy } = useCopyToClipboard();
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [usePersonalId, setUsePersonalId] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
  const userAvatar = user?.user_metadata?.avatar_url ||
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80";

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleStart = useCallback(() => {
    setIsStarting(true);
    setTimeout(() => {
      router.push("/meeting");
    }, 800);
  }, [router]);

  const handleCopyLink = useCallback(() => {
    copy(`https://orbit.vercel.app/join?mid=${meetingId.replace(/-/g, "")}`);
  }, [copy, meetingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-orbit-panel/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-white">New Meeting</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Start an instant meeting or copy the link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition active:scale-90"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-5">
          {/* Quick preview */}
          <VideoPreview
            cameraOn={cameraOn}
            micOn={micOn}
            onToggleCamera={() => setCameraOn((p) => !p)}
            onToggleMic={() => setMicOn((p) => !p)}
            compact
            userName={userName}
            userAvatar={userAvatar}
          />

          {/* Meeting ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Meeting ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-orbit-blue font-mono tracking-wider select-all text-center">
                {meetingId}
              </code>
              <button
                onClick={() => copy(meetingId)}
                className={`shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition active:scale-90 ${
                  copied
                    ? "bg-orbit-green/20 text-orbit-green border border-orbit-green/30"
                    : "bg-orbit-card text-zinc-400 hover:text-white border border-zinc-700/30 hover:border-zinc-600"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Settings toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-orbit-darker/50 rounded-xl border border-white/[0.03] cursor-pointer hover:bg-orbit-card/50 transition">
              <div>
                <span className="text-sm text-white font-medium">
                  Use Personal Meeting ID
                </span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Always use the same ID
                </p>
              </div>
              <div
                onClick={() => setUsePersonalId((p) => !p)}
                className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
                  usePersonalId ? "bg-orbit-blue" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    usePersonalId ? "translate-x-4.5 left-0.5" : "left-0.5"
                  }`}
                  style={{
                    transform: usePersonalId
                      ? "translateX(18px)"
                      : "translateX(0)",
                  }}
                />
              </div>
            </label>
          </div>

          {/* Copy meeting link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orbit-card hover:bg-orbit-card-hover border border-zinc-700/30 rounded-xl text-sm text-zinc-300 hover:text-white transition active:scale-[0.98]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {copied ? "Link Copied!" : "Copy Meeting Link"}
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full bg-orbit-blue hover:bg-blue-500 active:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Start Instant Meeting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
