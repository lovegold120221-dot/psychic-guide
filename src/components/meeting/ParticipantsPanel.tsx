"use client";

import InitialAvatar from "@/components/shared/InitialAvatar";

interface ParticipantInfo {
  userId: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isAudioEnabled: boolean;
  videoStream?: any;
  roles?: string[];
}

interface ParticipantsPanelProps {
  participants: any[];
  currentUserId: string;
  isHost: boolean;
  onMuteParticipant: (userId: string) => Promise<void>;
  onRemoveParticipant: (userId: string) => Promise<void>;
  onClose: () => void;
}

export default function ParticipantsPanel({
  participants,
  currentUserId,
  isHost,
  onMuteParticipant,
  onRemoveParticipant,
  onClose,
}: ParticipantsPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-orbit-panel/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] shrink-0">
          <h2 className="text-lg font-bold text-white">
            Participants <span className="text-sm text-zinc-400 font-normal">({participants.length})</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {participants.map((p) => {
            const isMe = p.userId === currentUserId;
            const isUserHost = p.roles?.includes("host");
            const name = p.name || p.userId || "Unknown";

            return (
              <div
                key={p.sessionId}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition group"
              >
                <div className="relative">
                  <InitialAvatar name={name} size={36} />
                  {p.isSpeaking && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orbit-green rounded-full border-2 border-orbit-panel" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{name}</span>
                    {isMe && <span className="text-[10px] text-zinc-500">(You)</span>}
                    {isUserHost && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">HOST</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {!p.isAudioEnabled && (
                      <span className="flex items-center gap-1 text-[10px] text-red-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="#ef4444" />
                        </svg>
                        Muted
                      </span>
                    )}
                    {!p.videoStream && (
                      <span className="text-[10px] text-zinc-500">Camera off</span>
                    )}
                  </div>
                </div>

                {/* Host actions */}
                {isHost && !isMe && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onMuteParticipant(p.userId)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition active:scale-90"
                      title="Mute"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemoveParticipant(p.userId)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition active:scale-90"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12h-4m-4 0H8m0 0l-3-3m3 3l-3 3" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-white/[0.04] text-[11px] text-zinc-500">
          {participants.length === 1 ? "Only you in this meeting" : `${participants.length} participants in the meeting`}
        </div>
      </div>
    </div>
  );
}
