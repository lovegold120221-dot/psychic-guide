"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStreamVideo } from "@/lib/video";
import { MeetingRoomProvider, useMeetingRoom } from "@/lib/meeting-store";
import TitleBar from "@/components/ui/TitleBar";
import VideoGrid from "@/components/meeting/VideoGrid";
import ChatSidebar from "@/components/meeting/ChatSidebar";
import BottomToolbar from "@/components/meeting/BottomToolbar";
import FloatingReactions from "@/components/meeting/FloatingReactions";
import { useMeetingState, useReactionAnimation } from "@/lib/hooks";
import { LAYOUT_OPTIONS } from "@/lib/constants";

// ─── Inner — has access to MeetingRoom context ─────────────────

function MeetingRoomUI() {
  const {
    videoConnected,
    chatConnected,
    chatMessages,
    sendChatMessage,
    sendReaction,
    participantsCount,
    toggleCamera,
    toggleMic,
    isCameraMuted,
    isMicMuted,
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
    setUnreadChats,
  } = useMeetingState();

  const { floatingReactions, triggerReaction } = useReactionAnimation();

  // Listen for incoming Stream reactions
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.emoji && detail?.sender) {
        triggerReaction(detail.emoji, detail.sender);
      }
    };
    window.addEventListener("stream-reaction", handler);
    return () => window.removeEventListener("stream-reaction", handler);
  }, [triggerReaction]);

  const handleSendMessage = useCallback(
    async (text: string) => await sendChatMessage(text),
    [sendChatMessage]
  );

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
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
              videoConnected
                ? "text-orbit-green bg-green-900/40 border-orbit-green/50"
                : "text-yellow-500 bg-zinc-800 border-zinc-700"
            }`}
          >
            {videoConnected ? "Stream Live" : "Connecting..."}
          </span>
        }
      />

      <div className="flex-1 w-full h-full flex overflow-hidden relative">
        {/* Video Grid Area */}
        <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center transition-all duration-300">
          {/* Top-left badge */}
          <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 orbit-panel-bg text-orbit-text-secondary text-xs px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-800 transition shadow-lg">
              <svg className="w-3.5 h-3.5 text-orbit-green" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path fill="#1a1a1a" d="M10.5 14.5l-3-3 1.5-1.5 1.5 1.5 4.5-4.5 1.5 1.5-6 6z" />
              </svg>
              <span className="font-medium tracking-wide">End-to-end Encrypted</span>
            </div>
          </div>

          {/* View menu */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleViewMenu}
              className="flex items-center gap-2 orbit-panel-bg text-orbit-text-secondary text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-zinc-800 transition shadow-lg border border-zinc-700/50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium">View</span>
            </button>

            {viewMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-orbit-panel border border-zinc-700 rounded-xl shadow-2xl py-1 z-30 animate-fade-in overflow-hidden">
                <div className="px-4 py-2 text-xs text-zinc-400 font-semibold border-b border-zinc-700">Layouts</div>
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => switchLayout(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition ${layoutMode === opt.value ? "bg-orbit-blue text-white" : "text-white hover:bg-white/5"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Video Grid — now renders with Stream Video SDK participants */}
          <VideoGrid
            layoutMode={layoutMode}
            localMicMuted={isMicMuted}
            localCamOn={!isCameraMuted}
          />

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
      />
    </>
  );
}

// ─── Outer — sets up Stream Video client ───────────────────────

export default function MeetingClient() {
  const { user } = useAuth();
  const userId = user?.id || `anon-${Date.now()}`;
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const [callId] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("call") || "orbit-main-room";
    }
    return "orbit-main-room";
  });

  const { client, connectionState } = useStreamVideo({ userId, userName });

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

  return (
    <MeetingRoomProvider
      client={client}
      userId={userId}
      userName={userName}
      callId={callId}
    >
      <MeetingRoomUI />
    </MeetingRoomProvider>
  );
}
