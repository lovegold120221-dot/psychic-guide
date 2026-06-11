"use client";

import Link from "next/link";
import Reactions from "./Reactions";

interface BottomToolbarProps {
  localMicMuted: boolean;
  localCamOn: boolean;
  chatOpen: boolean;
  reactionsOpen: boolean;
  unreadChats: number;
  participantCount: number;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleChat: () => void;
  onToggleReactions: () => void;
  onReaction: (emoji: string) => void;
}

export default function BottomToolbar({
  localMicMuted,
  localCamOn,
  chatOpen,
  reactionsOpen,
  unreadChats,
  participantCount,
  onToggleMic,
  onToggleCam,
  onToggleChat,
  onToggleReactions,
  onReaction,
}: BottomToolbarProps) {
  return (
    <div className="orbit-toolbar h-[64px] sm:h-[68px] w-full shrink-0 flex items-center justify-between px-2 sm:px-4 z-30 relative border-t border-black/50">
      {/* Left Group — Mic + Camera */}
      <div className="flex items-center h-full gap-1">
        {/* Mic */}
        <button
          onClick={onToggleMic}
          className="flex flex-col items-center justify-center w-[50px] sm:w-[54px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition text-zinc-300 relative group"
          aria-label={localMicMuted ? "Unmute microphone" : "Mute microphone"}
        >
          <svg
            className="w-[20px] sm:w-[22px] h-[20px] sm:h-[22px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {localMicMuted && (
            <div className="absolute inset-0 flex items-center justify-center top-[-10px]">
              <div className="w-6 h-[2px] bg-[#ff3b30] transform rotate-45 border border-orbit-dark" />
            </div>
          )}
          <span className="text-[10px] mt-1 font-medium tracking-wide">
            {localMicMuted ? "Unmute" : "Mute"}
          </span>
        </button>

        {/* Camera */}
        <button
          onClick={onToggleCam}
          className="flex flex-col items-center justify-center w-[56px] sm:w-[64px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition text-zinc-300 relative"
          aria-label={localCamOn ? "Stop video" : "Start video"}
        >
          <svg
            className="w-[20px] sm:w-[22px] h-[20px] sm:h-[22px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {!localCamOn && (
            <div className="absolute inset-0 flex items-center justify-center top-[-10px]">
              <div className="w-6 h-[2px] bg-[#ff3b30] transform rotate-45 border border-orbit-dark" />
            </div>
          )}
          <span className="text-[10px] mt-1 font-medium tracking-wide">
            {localCamOn ? "Stop Video" : "Start Video"}
          </span>
        </button>
      </div>

      {/* Center Group */}
      <div className="flex items-center h-full space-x-0.5 sm:space-x-1 text-orbit-text-muted">
        {/* Security */}
        <button className="flex flex-col items-center justify-center w-[44px] sm:w-[54px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition">
          <svg
            className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">
            Security
          </span>
        </button>

        {/* Participants */}
        <button className="flex flex-col items-center justify-center w-[56px] sm:w-[68px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition relative">
          <svg
            className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="absolute top-0.5 right-[10px] sm:right-[14px] bg-orbit-dark text-white text-[9px] font-bold px-1 rounded scale-90">
            {participantCount}
          </span>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">
            Participants
          </span>
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center justify-center w-[44px] sm:w-[48px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition relative ${
            chatOpen ? "text-white" : ""
          }`}
          aria-label="Toggle chat"
        >
          <svg
            className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-medium tracking-wide">
            Chat
          </span>
          {unreadChats > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Share Screen */}
        <button className="flex flex-col items-center justify-center w-[62px] sm:w-[74px] h-[52px] sm:h-[56px] rounded orbit-btn-hover cursor-pointer transition text-[#23d959] hover:bg-[#23d959]/10">
          <svg
            className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px] mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide">
            Share
          </span>
        </button>

        {/* Reactions */}
        <Reactions
          isOpen={reactionsOpen}
          onToggle={onToggleReactions}
          onReaction={onReaction}
        />
      </div>

      {/* Right Group */}
      <div className="flex items-center h-full pr-0 sm:pr-1">
        <Link
          href="/"
          className="bg-orbit-red hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded transition"
        >
          Leave
        </Link>
      </div>
    </div>
  );
}
