"use client";

import {
  StreamVideo,
  StreamCall,
  useCall,
  useCallStateHooks,
  CallingState,
  useStreamVideoClient,
  useToggleCallRecording,
  type StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { useStreamChat, type StreamChatMessage } from "./stream";

// ─── Types ─────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  name: string;
  online: boolean;
}

interface MeetingRoomValue {
  // Chat
  chatMessages: StreamChatMessage[];
  sendChatMessage: (text: string, targetUserId?: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
  chatConnected: boolean;
  chatUsers: ChatUser[];

  // Call state
  participantsCount: number;
  callState: CallingState;
  videoConnected: boolean;
  isHost: boolean;
  participants: any[];
  callId: string;
  hostId: string | null;

  // Camera / Mic
  toggleCamera: () => void;
  toggleMic: () => void;
  isCameraMuted: boolean;
  isMicMuted: boolean;

  // Recording
  toggleRecording: () => void;
  isRecording: boolean;
  recordingPending: boolean;

  // Screen Share
  toggleScreenShare: () => void;
  isScreenSharing: boolean;

  // Whiteboard
  whiteboardOpen: boolean;
  setWhiteboardOpen: (v: boolean) => void;

  // Host controls
  muteParticipant: (userId: string) => Promise<void>;
  removeParticipant: (userId: string) => Promise<void>;
}

const MeetingRoomCtx = createContext<MeetingRoomValue | null>(null);

export function useMeetingRoom() {
  const ctx = useContext(MeetingRoomCtx);
  if (!ctx) throw new Error("useMeetingRoom must be used within MeetingRoomProvider");
  return ctx;
}

// ─── Inner (inside StreamCall) ─────────────────────────────────

function MeetingRoomInner({
  children,
  chatMessages,
  chatConnected,
  chatUsers,
  sendChatMessage,
  sendReaction,
  callId,
  hostId,
}: {
  children: ReactNode;
  chatMessages: StreamChatMessage[];
  chatConnected: boolean;
  chatUsers: ChatUser[];
  sendChatMessage: (text: string, targetUserId?: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
  callId: string;
  hostId: string | null;
}) {
  const call = useCall();
  const {
    useCallCallingState,
    useParticipants,
    useCameraState,
    useMicrophoneState,
    useLocalParticipant,
  } = useCallStateHooks();
  const callState = useCallCallingState();
  const participants = useParticipants();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();
  const localParticipant = useLocalParticipant();
  const {
    toggleCallRecording,
    isCallRecordingInProgress,
    isAwaitingResponse: recordingPending,
  } = useToggleCallRecording();

  const isHost = (hostId && localParticipant?.userId === hostId) || localParticipant?.roles?.includes("host") || localParticipant?.roles?.includes("admin") || false;
  const isScreenSharing = participants.some((p) => p.userId === localParticipant?.userId && !!p.screenShareStream);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  const toggleScreenShare = useCallback(async () => {
    if (!call) return;
    try {
      const ss = (call as any).screenShare;
      if (isScreenSharing) {
        await ss.disable();
      } else {
        await ss.enable();
      }
    } catch (err) {
      console.error("Screen share toggle error:", err);
    }
  }, [call, isScreenSharing]);

  const muteParticipant = useCallback(
    async (userId: string) => {
      if (!call || !isHost) return;
      try {
        await (call as any).muteUser(userId, "audio");
      } catch (err) {
        console.error("Failed to mute participant:", err);
      }
    },
    [call, isHost]
  );

  const removeParticipant = useCallback(
    async (userId: string) => {
      if (!call || !isHost) return;
      try {
        await (call as any).blockUser(userId);
      } catch (err) {
        console.error("Failed to remove participant:", err);
      }
    },
    [call, isHost]
  );

  return (
    <MeetingRoomCtx.Provider
      value={{
        videoConnected: callState === CallingState.JOINED,
        chatConnected,
        chatMessages,
        chatUsers,
        sendChatMessage,
        sendReaction,
        participants,
        participantsCount: participants.length,
        callState,
        isHost,
        callId,
        hostId,
        toggleCamera: () => (camera.enabled ? camera.disable() : camera.enable()),
        toggleMic: () => (microphone.enabled ? microphone.disable() : microphone.enable()),
        isCameraMuted: !camera.enabled,
        isMicMuted: !microphone.enabled,
        toggleRecording: toggleCallRecording,
        isRecording: isCallRecordingInProgress,
        recordingPending,
        toggleScreenShare,
        isScreenSharing,
        whiteboardOpen,
        setWhiteboardOpen,
        muteParticipant,
        removeParticipant,
      }}
    >
      {children}
    </MeetingRoomCtx.Provider>
  );
}

// ─── Call Creator ──────────────────────────────────────────────

function CallCreator({
  callId,
  children,
  chatMessages,
  chatConnected,
  chatUsers,
  sendChatMessage,
  sendReaction,
  hostId,
}: {
  callId: string;
  children: ReactNode;
  chatMessages: StreamChatMessage[];
  chatConnected: boolean;
  chatUsers: ChatUser[];
  sendChatMessage: (text: string, targetUserId?: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
  hostId: string | null;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const joinedRef = useRef(false);

  useEffect(() => {
    if (!client) return;
    if (joinedRef.current) return; // prevent double-join in Strict Mode
    joinedRef.current = true;

    const newCall = client.call("default", callId);
    setCall(newCall);
    newCall.join({ create: true }).catch((err: any) => {
      console.error("Failed to join call:", err);
      setError(err.message);
    });
    return () => {
      // Don't reset joinedRef or leave the call on cleanup —
      // Strict Mode double-mount would create duplicate participants.
      // The call persists across mounts naturally.
    };
  }, [client, callId]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Call failed</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-orbit-blue hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition active:scale-[0.98]">Retry</button>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-orbit-blue mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-500">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <MeetingRoomInner
        callId={callId}
        chatMessages={chatMessages}
        chatConnected={chatConnected}
        chatUsers={chatUsers}
        sendChatMessage={sendChatMessage}
        sendReaction={sendReaction}
        hostId={hostId}
      >
        {children}
      </MeetingRoomInner>
    </StreamCall>
  );
}

// ─── Provider ───────────────────────────────────────────────────

interface Props {
  client: StreamVideoClient | null;
  userId: string;
  userName: string;
  callId: string;
  hostId: string | null;
  children: ReactNode;
}

export function MeetingRoomProvider({ client, userId, userName, callId, hostId, children }: Props) {
  const {
    connectionState: chatConnected,
    messages: chatMessages,
    users: chatUsers,
    sendMessage: sendChatMessage,
    sendReaction,
  } = useStreamChat(userId, userName);

  if (!client) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-orbit-blue mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-500">Connecting to Stream Video...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallCreator
        callId={callId}
        chatMessages={chatMessages}
        chatConnected={chatConnected === "connected"}
        chatUsers={chatUsers}
        sendChatMessage={sendChatMessage}
        sendReaction={sendReaction}
        hostId={hostId}
      >
        {children}
      </CallCreator>
    </StreamVideo>
  );
}
