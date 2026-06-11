"use client";

import InitialAvatar from "@/components/shared/InitialAvatar";

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
  if (!isOpen) return null;

  // Sort: host first, speaking second, then rest
  const sorted = [...participants].sort((a, b) => {
    const aHost = a.roles?.includes("host") || (!!hostId && a.userId === hostId) ? 1 : 0;
    const bHost = b.roles?.includes("host") || (!!hostId && b.userId === hostId) ? 1 : 0;
    if (aHost !== bHost) return bHost - aHost;
    if (a.isSpeaking && !b.isSpeaking) return -1;
    if (!a.isSpeaking && b.isSpeaking) return 1;
    return 0;
  });

  return (
    <div className="w-full sm:w-72 h-full bg-orbit-dark/95 backdrop-blur-sm border-l border-white/[0.04] flex flex-col shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="h-11 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <span className="font-semibold text-sm text-white">
          Participants <span className="text-zinc-500 font-normal ml-1">{participants.length}</span>
        </span>
        <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition" aria-label="Close">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((p) => {
          const isMe = p.userId === currentUserId;
          const isUserHost = p.roles?.includes("host") || (!!hostId && p.userId === hostId);
          const name = p.name || p.userId || "Unknown";
          const isMuted = !p.isAudioEnabled;
          const hasVideo = !!p.videoStream;
          const isLocalHost = isHost && !isMe;

          return (
            <div
              key={p.sessionId}
              className={`flex items-center gap-3 px-4 py-2.5 transition group ${
                isMe ? "bg-white/[0.02]" : "hover:bg-white/[0.02]"
              } ${p.isSpeaking ? "bg-orbit-green/[0.03]" : ""}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <InitialAvatar name={name} size={32} />
                {isUserHost && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 flex items-center justify-center rounded-full bg-amber-500 text-[6px] font-bold text-black">H</span>
                )}
                {p.isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orbit-green rounded-full border-2 border-orbit-dark" />
                )}
              </div>

              {/* Name + status icons */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-sm text-white truncate">{name}</span>
                {isMe && <span className="text-[11px] text-zinc-500 shrink-0">(You)</span>}
                {isUserHost && (
                  <span className="text-[9px] font-bold text-amber-400 shrink-0">HOST</span>
                )}
              </div>

              {/* Status icons */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Mic */}
                <span className={`p-1 rounded ${isMuted ? "bg-red-500/15 text-red-400" : "text-zinc-500"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMuted ? (
                      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" /></>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </span>
                {/* Video */}
                <span className={`p-1 rounded ${!hasVideo ? "text-zinc-600" : "text-zinc-500"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {!hasVideo ? (
                      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" /></>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                  </svg>
                </span>
                {/* Host actions */}
                {isLocalHost && (
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

      {/* Footer — mute all for host */}
      {isHost && (
        <div className="px-4 py-2.5 border-t border-white/[0.04]">
          <button
            onClick={() => participants.forEach((p) => !p.isLocal && onMuteParticipant(p.userId))}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" />
            </svg>
            Mute all
          </button>
        </div>
      )}
    </div>
  );
}
