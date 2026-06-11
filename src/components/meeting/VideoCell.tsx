"use client";

import type { Participant } from "@/lib/constants";

interface VideoCellProps {
  participant: Participant;
  isLocal: boolean;
  localMicMuted: boolean;
  localCamOn: boolean;
  className?: string;
  isActiveSpeaker?: boolean;
}

const MicOffIcon = () => (
  <svg
    className="w-3 h-3 text-[#ff3b30]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
    <line
      x1="3"
      y1="3"
      x2="21"
      y2="21"
      strokeWidth={2}
      stroke="#ff3b30"
      strokeLinecap="round"
    />
  </svg>
);

export default function VideoCell({
  participant,
  isLocal,
  localMicMuted,
  localCamOn,
  className = "",
  isActiveSpeaker = false,
}: VideoCellProps) {
  const showVideo = isLocal ? localCamOn : participant.hasVideo;
  const isMuted = isLocal ? localMicMuted : participant.muted;
  const activeBorder = isActiveSpeaker ? "active-speaker" : "";

  if (!showVideo) {
    return (
      <div
        className={`relative bg-orbit-panel flex items-center justify-center overflow-hidden border border-zinc-800 ${className} ${activeBorder}`}
      >
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 overflow-hidden rounded-full shadow-2xl">
          <img
            src={participant.img}
            alt={participant.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Nameplate */}
        <div className="absolute bottom-0 left-0 nameplate rounded-tr z-10">
          {isMuted && <MicOffIcon />}
          <span className="text-white">{participant.name}</span>
          {isLocal && (
            <span className="text-[10px] text-orbit-text-dim ml-0.5">(You)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-black flex items-center justify-center overflow-hidden border border-zinc-800 ${className} ${activeBorder}`}
    >
      {/* Video feed image */}
      <img
        src={participant.img}
        alt={participant.name}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Nameplate */}
      <div className="absolute bottom-0 left-0 nameplate rounded-tr z-10">
        {isMuted && <MicOffIcon />}
        <span className="text-white">{participant.name}</span>
        {isLocal && (
          <span className="text-[10px] text-orbit-text-dim ml-0.5">(You)</span>
        )}
      </div>
    </div>
  );
}
