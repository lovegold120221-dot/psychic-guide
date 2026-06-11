"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AuthLayout from "@/components/shared/AuthLayout";
import GlassCard from "@/components/shared/GlassCard";
import FormField from "@/components/shared/FormField";
import VideoPreview from "@/components/shared/VideoPreview";
import { useFormState, useCopyToClipboard } from "@/lib/hooks";
import MobileNav from "@/components/ui/MobileNav";

export default function JoinClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { copied, copy } = useCopyToClipboard();
  const { values, errors, setValue, validate } = useFormState({
    meetingId: "",
    displayName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
  });

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Auto-format meeting ID: xxx-xxx-xxx or xxxxxxxxx
  const formatMeetingId = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }, []);

  const handleJoin = useCallback(() => {
    const valid = validate({
      meetingId: (v) => {
        if (!v.trim()) return "Meeting ID is required";
        const digits = v.replace(/\D/g, "");
        if (digits.length < 9) return "Meeting ID must be 9 digits";
        return undefined;
      },
      displayName: (v) => {
        if (!v.trim()) return "Name is required";
        if (v.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;
      },
    });

    if (!valid) return;

    setIsJoining(true);
    // Simulate joining delay then navigate to meeting
    setTimeout(() => {
      router.push("/meeting");
    }, 1200);
  }, [validate, router]);

  const handlePaste = useCallback(() => {
    navigator.clipboard
      .readText()
      .then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 9);
        if (digits.length >= 9) {
          setValue("meetingId", formatMeetingId(digits));
        }
      })
      .catch(() => {});
  }, [formatMeetingId, setValue]);

  return (
    <>
    <AuthLayout
      title="Join Meeting"
      subtitle="Enter the meeting ID shared by the host"
      backHref="/"
      backLabel="Dashboard"
    >
      <GlassCard variant="elevated" className="p-5 sm:p-8 space-y-6">
        {/* Video Preview */}
        <VideoPreview
          cameraOn={cameraOn}
          micOn={micOn}
          onToggleCamera={() => setCameraOn((p) => !p)}
          onToggleMic={() => setMicOn((p) => !p)}
        />

        {/* Meeting ID */}
        <FormField
          label="Meeting ID"
          placeholder="Enter meeting ID"
          value={values.meetingId}
          onChange={(e) =>
            setValue("meetingId", formatMeetingId(e.target.value))
          }
          onPaste={(e) => {
            e.preventDefault();
            handlePaste();
          }}
          inputMode="numeric"
          maxLength={11}
          autoComplete="off"
          error={errors.meetingId}
          hint="Example: 834-291-556"
          icon={
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
          }
          rightElement={
            values.meetingId && (
              <button
                type="button"
                onClick={() => copy(values.meetingId.replace(/\D/g, ""))}
                className="text-[10px] font-semibold text-orbit-blue hover:text-blue-400 px-2 py-1 bg-orbit-blue/10 rounded-lg transition active:scale-90"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )
          }
        />

        {/* Display Name */}
        <FormField
          label="Your Name"
          placeholder="Enter your name"
          value={values.displayName}
          onChange={(e) => setValue("displayName", e.target.value)}
          maxLength={50}
          error={errors.displayName}
          icon={
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {/* Join options */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={!cameraOn}
              onChange={() => setCameraOn((p) => !p)}
              className="w-4 h-4 rounded border-zinc-600 bg-orbit-darker accent-orbit-blue cursor-pointer"
            />
            Join without video
          </label>
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={!micOn}
              onChange={() => setMicOn((p) => !p)}
              className="w-4 h-4 rounded border-zinc-600 bg-orbit-darker accent-orbit-blue cursor-pointer"
            />
            Mute on entry
          </label>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full bg-orbit-blue hover:bg-blue-500 active:bg-blue-600 disabled:opacity-60 disabled:cursor-wait text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          {isJoining ? (
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
              Joining...
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Join Meeting
            </>
          )}
        </button>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have a meeting ID?{" "}
          <Link
            href="/meeting"
            className="text-orbit-blue hover:underline font-medium"
          >
            Start a new meeting
          </Link>
        </p>
      </GlassCard>
    </AuthLayout>
    <MobileNav />
    </>
  );
}
