"use client";

import { useCallStateHooks, Video, CallingState } from "@stream-io/video-react-sdk";
import type { LayoutMode } from "@/lib/constants";
import InitialAvatar from "@/components/shared/InitialAvatar";

interface VideoGridProps {
  layoutMode: LayoutMode;
  localMicMuted: boolean;
  localCamOn: boolean;
}

export default function VideoGrid({
  layoutMode,
  localMicMuted,
  localCamOn,
}: VideoGridProps) {
  const { useParticipants, useCallCallingState, useLocalParticipant } = useCallStateHooks();
  const callState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const isJoined = callState === CallingState.JOINED;
  const visible = isJoined ? participants : [];
  const isSingle = visible.length === 1;
  const localUserId = localParticipant?.userId;

  // Detect if local user is host
  const isHost = localParticipant?.roles?.includes("host") ?? false;

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

  if (visible.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs text-zinc-600">Waiting for participants...</p>
      </div>
    );
  }

  // ─── SINGLE PARTICIPANT — fills the full stage ───────────
  if (isSingle) {
    return (
      <div className="w-full h-full">
        <FullScreenParticipantTile participant={visible[0]} isHost={isHost} />
      </div>
    );
  }

  // ─── 2-SPEAKER LAYOUT ────────────────────────────────────
  if (layoutMode === "2-speaker") {
    const [first, second] = visible;
    return (
      <div className="w-full h-full p-2 flex flex-col sm:flex-row items-center justify-center gap-1">
        {first && <ParticipantTile participant={first} className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]" isSpeaking={first.isSpeaking} isHost={isHost} />}
        {second && <ParticipantTile participant={second} className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]" isSpeaking={second.isSpeaking} />}
      </div>
    );
  }

  // ─── 3-GALLERY ───────────────────────────────────────────
  if (layoutMode === "3-gallery") {
    return (
      <div className="w-full h-full p-2 flex flex-col gap-1 max-w-5xl mx-auto">
        <div className="flex w-full h-1/2 gap-1 justify-center">
          {visible[0] && <ParticipantTile participant={visible[0]} className="w-1/2 h-full" isSpeaking={visible[0].isSpeaking} isHost={isHost} />}
          {visible[2] && <ParticipantTile participant={visible[2]} className="w-1/2 h-full" isSpeaking={visible[2].isSpeaking} />}
        </div>
        <div className="flex w-full h-1/2 gap-1 justify-center">
          {visible[1] && <ParticipantTile participant={visible[1]} className="w-1/2 h-full" isSpeaking={visible[1].isSpeaking} />}
        </div>
      </div>
    );
  }

  // ─── 4-GALLERY ───────────────────────────────────────────
  if (layoutMode === "4-gallery") {
    return (
      <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-2 gap-1 max-w-5xl mx-auto max-h-[90vh]">
        {visible.slice(0, 4).map((p) => (
          <ParticipantTile key={p.sessionId} participant={p} className="w-full h-full" isSpeaking={p.isSpeaking} isHost={isHost && p.userId === localUserId} />
        ))}
      </div>
    );
  }

  // ─── 18-GALLERY (default) ────────────────────────────────
  return (
    <div className="w-full h-full p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-fr gap-1 overflow-y-auto content-start">
      {visible.map((p) => (
        <ParticipantTile key={p.sessionId} participant={p} className="w-full aspect-video" isSpeaking={p.isSpeaking} isHost={isHost && p.userId === localUserId} />
      ))}
    </div>
  );
}

// ─── Standard tile ────────────────────────────────────────────

function ParticipantTile({
  participant,
  className = "",
  isSpeaking = false,
  isHost = false,
}: {
  participant: any;
  className?: string;
  isSpeaking?: boolean;
  isHost?: boolean;
}) {
  const isLocal = participant.isLocal;
  const hasVideo = participant.videoStream !== undefined && participant.videoStream !== null;
  const name = participant.name || participant.userId || "Unknown";
  const isMuted = !participant.isAudioEnabled;
  const activeBorder = isSpeaking ? "active-speaker" : "";

  if (!hasVideo) {
    return (
      <div className={`relative bg-orbit-panel flex items-center justify-center overflow-hidden border border-zinc-800 rounded-lg ${className} ${activeBorder}`}>
        <InitialAvatar name={name} size={80} />
        <Nameplate name={name} isLocal={isLocal} isMuted={isMuted} isHost={isHost} />
      </div>
    );
  }

  return (
    <div className={`relative bg-black flex items-center justify-center overflow-hidden border border-zinc-800 rounded-lg ${className} ${activeBorder}`}>
      <Video className="absolute inset-0 w-full h-full object-cover" participant={participant} trackType="videoTrack" playsInline muted={isLocal} />
      <Nameplate name={name} isLocal={isLocal} isMuted={isMuted} isHost={isHost} />
    </div>
  );
}

// ─── Full-screen single participant ────────────────────────────

function FullScreenParticipantTile({
  participant,
  isHost = false,
}: {
  participant: any;
  isHost?: boolean;
}) {
  const hasVideo = participant.videoStream !== undefined && participant.videoStream !== null;
  const name = participant.name || participant.userId || "Unknown";
  const isMuted = !participant.isAudioEnabled;
  const isLocal = participant.isLocal;

  if (!hasVideo) {
    return (
      <div className="relative w-full h-full bg-orbit-panel flex items-center justify-center overflow-hidden">
        <InitialAvatar name={name} size={140} />
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <span className="text-white text-lg font-semibold drop-shadow-lg">{name}</span>
          {isLocal && <span className="text-zinc-400 text-sm">(You)</span>}
          {isHost && (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">HOST</span>
          )}
          {isMuted && <MicOffIcon />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <Video className="absolute inset-0 w-full h-full object-cover" participant={participant} trackType="videoTrack" playsInline muted={isLocal} />
      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <span className="text-white text-lg font-semibold drop-shadow-lg">{name}</span>
        {isLocal && <span className="text-zinc-400 text-sm">(You)</span>}
        {isHost && (
          <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">HOST</span>
        )}
        {isMuted && <MicOffIcon />}
      </div>
    </div>
  );
}

// ─── Shared nameplate ──────────────────────────────────────────

function Nameplate({
  name,
  isLocal,
  isMuted,
  isHost,
}: {
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  isHost?: boolean;
}) {
  return (
    <div className="absolute bottom-0 left-0 nameplate rounded-tr z-10 flex items-center gap-1.5">
      {isMuted && <MicOffIcon />}
      <span className="text-white">{name}</span>
      {isLocal && <span className="text-[10px] text-orbit-text-dim ml-0.5">(You)</span>}
      {isHost && (
        <span className="text-[9px] font-bold text-amber-400 ml-1">HOST</span>
      )}
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
