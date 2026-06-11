"use client";

import { useState } from "react";
import InitialAvatar from "@/components/shared/InitialAvatar";

interface ParticipantInfo {
  userId: string;
  sessionId: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isAudioEnabled: boolean;
  videoStream?: any;
  roles?: string[];
  screenShareStream?: any;
}

interface ParticipantsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  currentUserId: string;
  isHost: boolean;
  hostId?: string | null;
  onMuteParticipant: (userId: string) => Promise<void>;
  onRemoveParticipant: (userId: string) => Promise<void>;
}

export default function ParticipantsSidebar({
  isOpen,
  onClose,
  participants,
  currentUserId,
  isHost,
  hostId,
  onMuteParticipant,
  onRemoveParticipant,
}: ParticipantsSidebarProps) {
  const [showVideo, setShowVideo] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-80 h-full bg-orbit-dark/95 backdrop-blur-sm border-l border-white/[0.04] flex flex-col shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <span className="font-bold text-sm text-white">Participants ({participants.length})</span>
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => participants.forEach((p) => !p.isLocal && onMuteParticipant(p.userId))}
              className="text-[10px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition"
              title="Mute all"
            >
              Mute All
            </button>
          )}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition ${showVideo ? "bg-orbit-blue/20 text-orbit-blue" : "text-zinc-400"}`}
            title={showVideo ? "Show names only" : "Show video thumbnails"}
          >
            {showVideo ? "Video" : "Names"}
          </button>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-lg leading-none" aria-label="Close">✕</button>
        </div>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;
          const isUserHost = p.roles?.includes("host") || (!!hostId && p.userId === hostId);
          const name = p.name || p.userId || "Unknown";
          const isMuted = !p.isAudioEnabled;
          const hasVideo = !!p.videoStream;

          return (
            <div
              key={p.sessionId}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition group ${
                isMe ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
              } ${isUserHost ? "ring-1 ring-amber-500/20" : ""}`}
            >
              {/* Avatar + video thumbnail */}
              <div className="relative shrink-0">
                {showVideo && hasVideo ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-zinc-700">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay playsInline muted
                      ref={(el) => {
                        if (el && p.videoStream) {
                          if (el.srcObject !== p.videoStream) el.srcObject = p.videoStream;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <InitialAvatar name={name} size={36} />
                    {isUserHost && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-amber-500 text-[7px] font-bold text-black" title="Host">H</span>
                    )}
                  </div>
                )}
                {p.isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orbit-green rounded-full border-2 border-orbit-dark" />
                )}
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white truncate">{name}</span>
                  {isMe && <span className="text-[10px] text-zinc-500">(You)</span>}
                  {isUserHost && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1 rounded">HOST</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {isMuted && <span className="text-[10px] text-red-400">Muted</span>}
                  {!hasVideo && <span className="text-[10px] text-zinc-600">Camera off</span>}
                  {!isMuted && hasVideo && <span className="text-[10px] text-orbit-green">Active</span>}
                </div>
              </div>

              {/* Mic / Video / Host icons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Mic icon */}
                <span className={`p-1 rounded ${isMuted ? "text-red-400 bg-red-500/10" : "text-zinc-500"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </span>
                {/* Video icon */}
                <span className={`p-1 rounded ${!hasVideo ? "text-zinc-600" : "text-zinc-500"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
                {/* Host actions */}
                {isHost && !isMe && (
                  <>
                    <button
                      onClick={() => onMuteParticipant(p.userId)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                      title="Mute"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemoveParticipant(p.userId)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.04] text-[11px] text-zinc-500">
        {isHost ? (
          <div className="flex items-center justify-between">
            <span>You are the host</span>
            <button
              onClick={() => participants.forEach((p) => !p.isLocal && onMuteParticipant(p.userId))}
              className="text-[10px] text-orange-400 hover:text-orange-300 transition font-medium"
            >
              Mute all
            </button>
          </div>
        ) : (
          <span>{participants.length} participant{participants.length !== 1 ? "s" : ""}</span>
        )}
      </div>
    </div>
  );
}
