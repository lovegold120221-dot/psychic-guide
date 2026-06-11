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
  isRecording: boolean;
  recordingPending: boolean;
  onToggleRecording: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  isHost: boolean;
  onToggleWhiteboard: () => void;
  whiteboardOpen: boolean;
  // NEW
  onToggleSecurity?: () => void;
  onToggleParticipants?: () => void;
  onShareLink?: () => void;
  copiedLink?: boolean;
}

export default function BottomToolbar({
  localMicMuted, localCamOn, chatOpen, reactionsOpen, unreadChats, participantCount,
  onToggleMic, onToggleCam, onToggleChat, onToggleReactions, onReaction,
  isRecording, recordingPending, onToggleRecording,
  isScreenSharing, onToggleScreenShare,
  isHost, onToggleWhiteboard, whiteboardOpen,
  onToggleSecurity, onToggleParticipants, onShareLink, copiedLink,
}: BottomToolbarProps) {
  const [captionsOn, setCaptionsOn] = useState(false);
  const [hostMenuOpen, setHostMenuOpen] = useState(false);

  return (
    <div className="orbit-toolbar h-auto min-h-[60px] sm:h-[64px] w-full shrink-0 sticky bottom-0 z-30 border-t border-black/50 safe-bottom">
      <div className="flex items-center justify-between px-1.5 sm:px-3 h-full overflow-x-auto overscroll-contain scrollbar-none gap-0.5 sm:gap-1">
        {/* Left — Mic + Camera */}
        <div className="flex items-center h-full gap-0.5 sm:gap-1 shrink-0">
          <ToolbarBtn active={!localMicMuted} label={localMicMuted ? "Unmute" : "Mute"} onClick={onToggleMic} activeColor="text-white">
            <MicIcon />
            {localMicMuted && <Slash />}
          </ToolbarBtn>
          <ToolbarBtn active={localCamOn} label={localCamOn ? "Stop Video" : "Start Video"} onClick={onToggleCam} activeColor="text-white">
            <CamIcon />
            {!localCamOn && <Slash />}
          </ToolbarBtn>
        </div>

        {/* Center */}
        <div className="flex items-center h-full gap-0.5 sm:gap-1 text-orbit-text-muted">
          <ToolbarBtn label="Security" onClick={onToggleSecurity}>
            <SecurityIcon />
          </ToolbarBtn>
          <ToolbarBtn label="Participants" onClick={onToggleParticipants} className="relative">
            <PeopleIcon />
            <span className="absolute -top-0.5 -right-0.5 bg-orbit-dark text-white text-[8px] font-bold px-1 rounded min-w-[14px] text-center leading-4">{participantCount}</span>
          </ToolbarBtn>
          <ToolbarBtn label="Chat" active={chatOpen} onClick={onToggleChat} activeColor="text-white" className="relative">
            <ChatIcon />
            {unreadChats > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
          </ToolbarBtn>

          {/* Share Screen */}
          <ToolbarBtn label="Share" active={isScreenSharing} onClick={onToggleScreenShare} activeColor="text-[#23d959]" hoverBg="hover:bg-[#23d959]/10">
            <ShareIcon />
          </ToolbarBtn>

          {/* Recording */}
          <ToolbarBtn
            label={isRecording ? "Stop Rec" : "Record"}
            active={isRecording}
            onClick={onToggleRecording}
            activeColor="text-red-400"
            disabled={recordingPending}
          >
            <RecordIcon />
            {isRecording && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </ToolbarBtn>

          {/* Whiteboard */}
          <ToolbarBtn label="Board" active={whiteboardOpen} onClick={onToggleWhiteboard} activeColor="text-orange-400">
            <BoardIcon />
          </ToolbarBtn>

          {/* Captions */}
          <ToolbarBtn label="Captions" active={captionsOn} onClick={() => setCaptionsOn(p => !p)} activeColor="text-orbit-green">
            <CcIcon />
          </ToolbarBtn>

          {/* Share Link */}
          <ToolbarBtn
            label={copiedLink ? "Copied!" : "Share"}
            active={!!copiedLink}
            onClick={onShareLink}
            activeColor="text-orbit-blue"
          >
            <LinkIcon />
          </ToolbarBtn>

          {/* Reactions */}
          <Reactions isOpen={reactionsOpen} onToggle={onToggleReactions} onReaction={onReaction} />

          {/* Host Controls (only visible to host) */}
          {isHost && (
            <div className="relative">
              <ToolbarBtn label="Host" active={hostMenuOpen} onClick={() => setHostMenuOpen(p => !p)} activeColor="text-amber-400">
                <CrownIcon />
              </ToolbarBtn>
              {hostMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-orbit-panel border border-zinc-700 rounded-xl shadow-2xl py-1 z-40 animate-fade-in overflow-hidden">
                  <div className="px-4 py-2 text-[10px] text-zinc-400 font-semibold border-b border-zinc-700">Host Controls</div>
                  <button onClick={() => { setHostMenuOpen(false); onToggleWhiteboard(); }} className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/5 transition flex items-center gap-2">
                    <BoardIcon /> Whiteboard
                  </button>
                  <button onClick={() => { setHostMenuOpen(false); onToggleRecording(); }} className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/5 transition flex items-center gap-2">
                    <RecordIcon /> {isRecording ? "Stop Recording" : "Record Meeting"}
                  </button>
                  <div className="border-t border-zinc-700 my-1" />
                  <div className="px-4 py-2 text-[10px] text-zinc-500">Lock meeting, mute all — coming soon</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Leave */}
        <div className="flex items-center h-full gap-1 shrink-0">
          <Link href="/" className="bg-orbit-red hover:bg-red-700 active:bg-red-800 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg transition-all duration-150 shadow-lg shadow-red-500/20">
            Leave
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable button ───────────────────────────────────────────

function ToolbarBtn({ children, label, onClick, active = true, activeColor = "text-zinc-300", hoverBg = "hover:bg-white/[0.06]", disabled = false, className = "" }: {
  children: React.ReactNode; label: string; onClick?: () => void; active?: boolean;
  activeColor?: string; hoverBg?: string; disabled?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center w-[44px] sm:w-[50px] h-[48px] sm:h-[54px] rounded-xl native-btn-soft ${hoverBg} transition-all duration-150 relative shrink-0 ${active ? activeColor : "text-orbit-text-muted"} ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
      aria-label={label}
    >
      {children}
      <span className="text-[8px] sm:text-[9px] font-medium leading-tight mt-0.5 whitespace-nowrap">{label}</span>
    </button>
  );
}

function Slash() {
  return <span className="control-slash"><span className="control-slash-line" /></span>;
}

// ─── Icons ─────────────────────────────────────────────────────

function MicIcon() { return (
  <svg className="w-[18px] sm:w-[20px] h-[18px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);}

function CamIcon() { return (
  <svg className="w-[18px] sm:w-[20px] h-[18px] sm:h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);}

function SecurityIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);}

function PeopleIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);}

function ChatIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);}

function ShareIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);}

function RecordIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth={1.5} />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);}

function BoardIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="15" rx="2" stroke="currentColor" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8M12 18v3" />
  </svg>
);}

function CcIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12h2" />
  </svg>
);}

function CrownIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);}

function LinkIcon() { return (
  <svg className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);}
