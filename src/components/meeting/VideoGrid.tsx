"use client";

import { useCallStateHooks, Video, CallingState } from "@stream-io/video-react-sdk";
import type { LayoutMode } from "@/lib/constants";
import InitialAvatar from "@/components/shared/InitialAvatar";

interface VideoGridProps {
  layoutMode: LayoutMode;
  localMicMuted: boolean;
  localCamOn: boolean;
}

export default function VideoGrid({ layoutMode, localMicMuted, localCamOn }: VideoGridProps) {
  const { useParticipants, useCallCallingState, useLocalParticipant } = useCallStateHooks();
  const callState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const isJoined = callState === CallingState.JOINED;
  const visible = isJoined ? participants : [];
  const localUserId = localParticipant?.userId;
  const isHost = localParticipant?.roles?.includes("host") ?? false;

  // Find screen share participant
  const screenSharer = visible.find((p) => p.screenShareStream);
  const videoParticipants = visible.filter((p) => !p.screenShareStream);
  const isScreenSharing = !!screenSharer;

  // Single participant — full screen (or screen share full screen)
  const displayParticipants = isScreenSharing ? videoParticipants : visible;
  const isSingle = displayParticipants.length <= 1;

  if (!isJoined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-zinc-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-zinc-500">Joining call...</p>
        </div>
      </div>
    );
  }

  if (displayParticipants.length === 0 && !isScreenSharing) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs text-zinc-600">Waiting for participants...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Screen Share — full-width top area */}
      {screenSharer && (
        <div className="flex-1 min-h-0 p-1">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-zinc-800">
            <Video
              className="absolute inset-0 w-full h-full object-contain"
              participant={screenSharer}
              trackType="screenShareTrack"
              playsInline
              muted={(screenSharer as any).isLocal}
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[11px] text-white flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {screenSharer.name || screenSharer.userId}'s screen
            </div>
          </div>
        </div>
      )}

      {/* Participant tiles */}
      <div className={isScreenSharing ? "h-32 sm:h-40 shrink-0 flex gap-1 p-1 overflow-x-auto" : "flex-1 flex"}>
        {isScreenSharing ? (
          /* Filmstrip during screen share */
          displayParticipants.length === 0 ? (
            <div className="flex items-center justify-center w-full text-xs text-zinc-600">
              Only the presenter
            </div>
          ) : (
            displayParticipants.map((p) => (
              <ParticipantTile
                key={p.sessionId}
                participant={p}
                className="h-full aspect-video shrink-0"
                isSpeaking={p.isSpeaking}
                isHost={isHost && p.userId === localUserId}
              />
            ))
          )
        ) : isSingle ? (
          /* Full-screen single */
          <FullScreenParticipantTile participant={displayParticipants[0]} isHost={isHost} />
        ) : layoutMode === "2-speaker" ? (
          <div className="w-full h-full p-2 flex flex-col sm:flex-row items-center justify-center gap-1">
            {displayParticipants[0] && <ParticipantTile participant={displayParticipants[0]} className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]" isSpeaking={displayParticipants[0].isSpeaking} isHost={isHost} />}
            {displayParticipants[1] && <ParticipantTile participant={displayParticipants[1]} className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]" isSpeaking={displayParticipants[1].isSpeaking} />}
          </div>
        ) : layoutMode === "3-gallery" ? (
          <div className="w-full h-full p-2 flex flex-col gap-1 max-w-5xl mx-auto">
            <div className="flex w-full h-1/2 gap-1 justify-center">
              {displayParticipants[0] && <ParticipantTile participant={displayParticipants[0]} className="w-1/2 h-full" isSpeaking={displayParticipants[0].isSpeaking} isHost={isHost} />}
              {displayParticipants[2] && <ParticipantTile participant={displayParticipants[2]} className="w-1/2 h-full" isSpeaking={displayParticipants[2].isSpeaking} />}
            </div>
            <div className="flex w-full h-1/2 gap-1 justify-center">
              {displayParticipants[1] && <ParticipantTile participant={displayParticipants[1]} className="w-1/2 h-full" isSpeaking={displayParticipants[1].isSpeaking} />}
            </div>
          </div>
        ) : layoutMode === "4-gallery" ? (
          <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-2 gap-1 max-w-5xl mx-auto max-h-[90vh]">
            {displayParticipants.slice(0, 4).map((p) => (
              <ParticipantTile key={p.sessionId} participant={p} className="w-full h-full" isSpeaking={p.isSpeaking} isHost={isHost && p.userId === localUserId} />
            ))}
          </div>
        ) : (
          <div className="w-full h-full p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-fr gap-1 overflow-y-auto content-start">
            {displayParticipants.map((p) => (
              <ParticipantTile key={p.sessionId} participant={p} className="w-full aspect-video" isSpeaking={p.isSpeaking} isHost={isHost && p.userId === localUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Zoom-style tile ──────────────────────────────────────────

function ParticipantTile({ participant, className = "", isSpeaking = false, isHost = false }: {
  participant: any; className?: string; isSpeaking?: boolean; isHost?: boolean;
}) {
  const p = participant as any;
  const isLocal = p.isLocal;
  const hasVideo = p.videoStream !== undefined && p.videoStream !== null;
  const name = p.name || p.userId || "Unknown";
  const isMuted = !p.isAudioEnabled;
  const showSpeaking = isSpeaking ? "ring-2 ring-[#c1c35e]" : "";

  if (!hasVideo) {
    return (
      <div className={`relative bg-[#1c1c1e] flex items-center justify-center overflow-hidden rounded-xl ${className} ${showSpeaking}`}>
        <InitialAvatar name={name} size={72} />
        <Nameplate name={name} isLocal={isLocal} isMuted={isMuted} isHost={isHost} />
      </div>
    );
  }

  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden rounded-xl ${className} ${showSpeaking}`}>
      <Video className="absolute inset-0 w-full h-full object-cover" participant={participant} trackType="videoTrack" playsInline muted={isLocal} />
      <Nameplate name={name} isLocal={isLocal} isMuted={isMuted} isHost={isHost} />
    </div>
  );
}

// ─── Full-screen single ──────────────────────────────────────

function FullScreenParticipantTile({ participant, isHost = false }: { participant: any; isHost?: boolean }) {
  const p = participant as any;
  const hasVideo = p.videoStream !== undefined && p.videoStream !== null;
  const name = p.name || p.userId || "Unknown";
  const isMuted = !p.isAudioEnabled;
  const isLocal = p.isLocal;

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {hasVideo ? (
        <Video className="absolute inset-0 w-full h-full object-cover" participant={participant} trackType="videoTrack" playsInline muted={isLocal} />
      ) : (
        <div className="w-full h-full bg-[#1c1c1e] flex items-center justify-center">
          <InitialAvatar name={name} size={120} />
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
        {isMuted && <MicOffIcon />}
        <span className="text-white text-sm font-medium drop-shadow-lg">{name}</span>
        {isLocal && <span className="text-zinc-400 text-xs">(You)</span>}
        {isHost && <span className="text-[10px] font-bold text-amber-400">HOST</span>}
      </div>
    </div>
  );
}

function Nameplate({ name, isLocal, isMuted, isHost }: { name: string; isLocal: boolean; isMuted: boolean; isHost?: boolean }) {
  return (
    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm z-10 flex items-center gap-1.5">
      {isMuted && <MicOffIcon />}
      <span className="text-white text-xs font-medium">{name}</span>
      {isLocal && <span className="text-[10px] text-zinc-400">(You)</span>}
      {isHost && <span className="text-[9px] font-bold text-amber-400">HOST</span>}
    </div>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-3 h-3 text-[#ff3b30] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="#ff3b30" strokeLinecap="round" />
    </svg>
  );
}
