"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [captionsOn, setCaptionsOn] = useState(false);

  return (
    <div className="orbit-toolbar h-auto min-h-[60px] sm:h-[64px] w-full shrink-0 sticky bottom-0 z-30 border-t border-black/50 safe-bottom">
      {/* Mobile: single row scrollable */}
      <div className="flex items-center justify-between px-1.5 sm:px-3 h-full overflow-x-auto overscroll-contain scrollbar-none gap-0.5 sm:gap-1">
        {/* Left Group — Mic + Camera */}
        <div className="flex items-center h-full gap-0.5 sm:gap-1 shrink-0">
          {/* Mic */}
          <ToolbarButton
            active={!localMicMuted}
            label={localMicMuted ? "Unmute" : "Mute"}
            onClick={onToggleMic}
            activeColor="text-white"
          >
            <svg className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {localMicMuted && <span className="control-slash"><span className="control-slash-line" /></span>}
          </ToolbarButton>

          {/* Camera */}
          <ToolbarButton
            active={localCamOn}
            label={localCamOn ? "Stop Video" : "Start Video"}
            onClick={onToggleCam}
            activeColor="text-white"
          >
            <svg className="w-[18px] sm:w-[22px] h-[18px] sm:h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {!localCamOn && <span className="control-slash"><span className="control-slash-line" /></span>}
          </ToolbarButton>
        </div>

        {/* Center Group — scrolling row */}
        <div className="flex items-center h-full gap-0.5 sm:gap-1 text-orbit-text-muted">
          {/* Security */}
          <ToolbarButton label="Security" activeColor="text-white">
            <svg className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </ToolbarButton>

          {/* Participants */}
          <ToolbarButton label="Participants" className="relative" activeColor="text-white">
            <svg className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 bg-orbit-dark text-white text-[8px] font-bold px-1 rounded min-w-[14px] text-center leading-4">
              {participantCount}
            </span>
          </ToolbarButton>

          {/* Chat */}
          <ToolbarButton
            label="Chat"
            active={chatOpen}
            onClick={onToggleChat}
            activeColor="text-white"
            className="relative"
          >
            <svg className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadChats > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
          </ToolbarButton>

          {/* Share Screen */}
          <ToolbarButton label="Share" activeColor="text-[#23d959]" hoverBg="hover:bg-[#23d959]/10">
            <svg className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </ToolbarButton>

          {/* Captions — NEW */}
          <ToolbarButton
            label="Captions"
            active={captionsOn}
            onClick={() => setCaptionsOn((p) => !p)}
            activeColor="text-orbit-green"
          >
            <svg className="w-[16px] sm:w-[20px] h-[16px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12h2" />
            </svg>
          </ToolbarButton>

          {/* Reactions */}
          <Reactions isOpen={reactionsOpen} onToggle={onToggleReactions} onReaction={onReaction} />
        </div>

        {/* Right Group — Leave */}
        <div className="flex items-center h-full gap-1 shrink-0">
          <Link
            href="/"
            className="bg-orbit-red hover:bg-red-700 active:bg-red-800 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg transition-all duration-150 shadow-lg shadow-red-500/20"
          >
            Leave
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable toolbar button ───────────────────────────────────

function ToolbarButton({
  children,
  label,
  onClick,
  active = true,
  activeColor = "text-zinc-300",
  hoverBg = "hover:bg-white/[0.06]",
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  hoverBg?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[44px] sm:w-[52px] h-[48px] sm:h-[54px] rounded-xl native-btn-soft ${hoverBg} transition-all duration-150 relative shrink-0 ${active ? activeColor : "text-orbit-text-muted"} ${className}`}
      aria-label={label}
    >
      {children}
      <span className="text-[8px] sm:text-[10px] font-medium leading-tight mt-0.5 whitespace-nowrap">{label}</span>
    </button>
  );
}
