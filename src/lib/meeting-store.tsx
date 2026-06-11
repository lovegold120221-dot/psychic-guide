"use client";

import {
  StreamVideo,
  StreamCall,
  useCall,
  useCallStateHooks,
  CallingState,
  useStreamVideoClient,
  type StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStreamChat, type StreamChatMessage } from "./stream";

// ─── Context ───────────────────────────────────────────────────

interface MeetingRoomValue {
  chatMessages: StreamChatMessage[];
  sendChatMessage: (text: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
  participantsCount: number;
  callState: CallingState;
  toggleCamera: () => void;
  toggleMic: () => void;
  isCameraMuted: boolean;
  isMicMuted: boolean;
  chatConnected: boolean;
  videoConnected: boolean;
}

const MeetingRoomCtx = createContext<MeetingRoomValue | null>(null);

export function useMeetingRoom() {
  const ctx = useContext(MeetingRoomCtx);
  if (!ctx) throw new Error("useMeetingRoom must be used within MeetingRoomProvider");
  return ctx;
}

// ─── Inner — lives inside <StreamVideo> AND <StreamCall> ─────

function MeetingRoomInner({
  children,
  chatMessages,
  chatConnected,
  sendChatMessage,
  sendReaction,
}: {
  children: ReactNode;
  chatMessages: StreamChatMessage[];
  chatConnected: boolean;
  sendChatMessage: (text: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
}) {
  const { useCallCallingState, useParticipants, useCameraState, useMicrophoneState } = useCallStateHooks();
  const callState = useCallCallingState();
  const participants = useParticipants();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();

  return (
    <MeetingRoomCtx.Provider
      value={{
        videoConnected: callState === CallingState.JOINED,
        chatConnected,
        chatMessages,
        sendChatMessage,
        sendReaction,
        participantsCount: participants.length,
        callState,
        toggleCamera: () => (camera.enabled ? camera.disable() : camera.enable()),
        toggleMic: () => (microphone.enabled ? microphone.disable() : microphone.enable()),
        isCameraMuted: !camera.enabled,
        isMicMuted: !microphone.enabled,
      }}
    >
      {children}
    </MeetingRoomCtx.Provider>
  );
}

// ─── Call Creator (needs StreamVideo context to use the client) ─

function CallCreator({
  callId,
  children,
  chatMessages,
  chatConnected,
  sendChatMessage,
  sendReaction,
}: {
  callId: string;
  children: ReactNode;
  chatMessages: StreamChatMessage[];
  chatConnected: boolean;
  sendChatMessage: (text: string) => Promise<boolean>;
  sendReaction: (emoji: string, sender: string) => Promise<boolean>;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;

    const newCall = client.call("default", callId);
    setCall(newCall);

    newCall.join({ create: true }).catch((err: any) => {
      console.error("Failed to join call:", err);
      setError(err.message);
    });

    return () => {
      newCall.leave().catch(() => {});
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
          <button
            onClick={() => window.location.reload()}
            className="bg-orbit-blue hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition active:scale-[0.98]"
          >
            Retry
          </button>
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
        chatMessages={chatMessages}
        chatConnected={chatConnected}
        sendChatMessage={sendChatMessage}
        sendReaction={sendReaction}
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
  children: ReactNode;
}

export function MeetingRoomProvider({ client, userId, userName, callId, children }: Props) {
  const {
    connectionState: chatConnected,
    messages: chatMessages,
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
        sendChatMessage={sendChatMessage}
        sendReaction={sendReaction}
      >
        {children}
      </CallCreator>
    </StreamVideo>
  );
}
