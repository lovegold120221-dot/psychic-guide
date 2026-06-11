"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStreamVideo } from "@/lib/video";
import { MeetingRoomProvider, useMeetingRoom } from "@/lib/meeting-store";
import TitleBar from "@/components/ui/TitleBar";
import VideoGrid from "@/components/meeting/VideoGrid";
import ChatSidebar from "@/components/meeting/ChatSidebar";
import BottomToolbar from "@/components/meeting/BottomToolbar";
import Whiteboard from "@/components/meeting/Whiteboard";
import SecurityPanel from "@/components/meeting/SecurityPanel";
import ParticipantsSidebar from "@/components/meeting/ParticipantsSidebar";
import FloatingReactions from "@/components/meeting/FloatingReactions";
import { useMeetingState, useReactionAnimation } from "@/lib/hooks";
import { LAYOUT_OPTIONS } from "@/lib/constants";

// ─── Inner ─────────────────────────────────────────────────────

function MeetingRoomUI() {
  const {
    videoConnected,
    chatConnected,
    chatMessages,
    chatUsers,
    sendChatMessage,
    sendReaction,
    participantsCount,
    participants,
    toggleCamera,
    toggleMic,
    isCameraMuted,
    isMicMuted,
    toggleRecording,
    isRecording,
    recordingPending,
    toggleScreenShare,
    isScreenSharing,
    isHost,
    whiteboardOpen,
    setWhiteboardOpen,
    muteParticipant,
    removeParticipant,
    callId,
    hostId,
  } = useMeetingRoom();

  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";

  const {
    layoutMode,
    chatOpen,
    unreadChats,
    reactionsOpen,
    viewMenuOpen,
    toggleChat,
    toggleReactions,
    toggleViewMenu,
    switchLayout,
  } = useMeetingState();

  const { floatingReactions, triggerReaction } = useReactionAnimation();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.emoji && detail?.sender) triggerReaction(detail.emoji, detail.sender);
    };
    window.addEventListener("stream-reaction", handler);
    return () => window.removeEventListener("stream-reaction", handler);
  }, [triggerReaction]);

  const handleSendMessage = useCallback(
    async (text: string, targetUserId?: string) => await sendChatMessage(text, targetUserId),
    [sendChatMessage]
  );

  const [participantsPanelOpen, setParticipantsPanelOpen] = useState(false);
  const [securityPanelOpen, setSecurityPanelOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/meeting?call=${callId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => {});
  }, [callId]);

  const handleReaction = useCallback(
    (emoji: string) => {
      toggleReactions();
      triggerReaction(emoji, userName);
      sendReaction(emoji, userName);
    },
    [toggleReactions, triggerReaction, sendReaction, userName]
  );

  return (
    <>
      <TitleBar
        title="Orbit Meeting"
        status={
          <span className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
              videoConnected ? "text-orbit-green bg-green-900/40 border-orbit-green/50" : "text-yellow-500 bg-zinc-800 border-zinc-700"
            }`}>
              {videoConnected ? "Stream Live" : "Connecting..."}
            </span>
            {isHost && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30">
                HOST
              </span>
            )}
            {isRecording && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-red-400 bg-red-400/10 border border-red-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                REC
              </span>
            )}
            {isScreenSharing && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-orbit-blue bg-blue-400/10 border border-blue-400/30">
                SHARING
              </span>
            )}
          </span>
        }
      />

      <div className="flex-1 w-full h-full flex overflow-hidden relative">
        {/* Video / Whiteboard area */}
        <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center transition-all duration-300">
          {whiteboardOpen ? (
            <Whiteboard isHost={isHost} onClose={() => setWhiteboardOpen(false)} />
          ) : (
            <VideoGrid layoutMode={layoutMode} localMicMuted={isMicMuted} localCamOn={!isCameraMuted} />
          )}

          <FloatingReactions reactions={floatingReactions} />
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar
          isOpen={chatOpen}
          onClose={toggleChat}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          connectionState={chatConnected ? "connected" : "connecting"}
          currentUserId={user?.id}
          users={chatUsers}
        />
      </div>

      <BottomToolbar
        localMicMuted={isMicMuted}
        localCamOn={!isCameraMuted}
        chatOpen={chatOpen}
        reactionsOpen={reactionsOpen}
        unreadChats={unreadChats}
        participantCount={participantsCount}
        onToggleMic={toggleMic}
        onToggleCam={toggleCamera}
        onToggleChat={toggleChat}
        onToggleReactions={toggleReactions}
        onReaction={handleReaction}
        isRecording={isRecording}
        recordingPending={recordingPending}
        onToggleRecording={toggleRecording}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={toggleScreenShare}
        isHost={isHost}
        onToggleWhiteboard={() => setWhiteboardOpen(!whiteboardOpen)}
        whiteboardOpen={whiteboardOpen}
        onToggleSecurity={() => setSecurityPanelOpen(true)}
        onToggleParticipants={() => setParticipantsPanelOpen(true)}
        onShareLink={handleCopyLink}
        copiedLink={copiedLink}
        layoutMode={layoutMode}
        onSwitchLayout={(mode: string) => switchLayout(mode as any)}
      />

      {/* Security Panel */}
      {securityPanelOpen && (
        <SecurityPanel
          onClose={() => setSecurityPanelOpen(false)}
          isHost={isHost}
        />
      )}

      {/* Participants Sidebar */}
      <ParticipantsSidebar
        isOpen={participantsPanelOpen}
        onClose={() => setParticipantsPanelOpen(false)}
        participants={participants}
        currentUserId={user?.id || ""}
        isHost={isHost}
        hostId={hostId}
        onMuteParticipant={muteParticipant}
        onRemoveParticipant={removeParticipant}
      />
    </>
  );
}

// ─── Outer ──────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";

export default function MeetingClient() {
  const { user, loading } = useAuth();
  const [anonId] = useState(() => `anon-${Math.random().toString(36).substring(2, 10)}`);
  
  const [callId] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("call") || "orbit-main-room";
    }
    return "orbit-main-room";
  });

  const [hostId, setHostId] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) return;
    const supabase = createClient();
    const fetchHost = async () => {
      const { data, error } = await supabase.from("orbit_meetings").select("host_id").eq("meeting_id", callId).single();
      if (data?.host_id) {
        setHostId(data.host_id);
      } else if (error) {
        console.error("Failed to fetch host", error);
      }
    };
    fetchHost();
  }, [callId]);

  const urlName = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("name") : null;
  const userId = user?.id || anonId;
  const userName = urlName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";

  const { client, connectionState } = useStreamVideo({ userId, userName });

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-orbit-blue mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (connectionState === "error") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-orbit-darker">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Connection failed</h2>
          <p className="text-sm text-zinc-400 mb-6">Could not connect to Stream Video. Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="bg-orbit-blue hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition active:scale-[0.98]">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <MeetingRoomProvider client={client} userId={userId} userName={userName} callId={callId} hostId={hostId}>
      <MeetingRoomUI />
    </MeetingRoomProvider>
  );
}
