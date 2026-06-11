"use client";

import { StreamChat } from "stream-chat";
import { useState, useCallback, useEffect, useRef } from "react";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || "5h6dzs74tch5";

export type StreamConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface StreamChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  time: string;
}

// ---- Stream Chat Hook ----
export function useStreamChat(userId: string, userName: string) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<StreamConnectionState>("disconnected");
  const [messages, setMessages] = useState<StreamChatMessage[]>([]);
  const clientRef = useRef<StreamChat | null>(null);

  // Connect to Stream
  const connectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (clientRef.current || connectingRef.current) return;
    connectingRef.current = true;

    setConnectionState("connecting");

    try {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      clientRef.current = chatClient;

      // Fetch token from our API route
      const res = await fetch("/api/stream-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName }),
      });

      if (!res.ok) {
        // Fallback to dev token if API route unavailable
        console.warn("Stream token API unavailable, using dev token");
        const devToken = chatClient.devToken(userId);
        await chatClient.connectUser(
          { id: userId, name: userName },
          devToken
        );
      } else {
        const { token } = await res.json();
        await chatClient.connectUser(
          { id: userId, name: userName },
          token
        );
      }

      // Create or join the Orbit meeting channel
      const meetingChannel = chatClient.channel("messaging", "orbit_meeting_room_main", {
        name: "Orbit Main Meeting Room",
        image: "https://eburon.ai/icon-eburon.svg",
      });

      await meetingChannel.watch();

      // Listen for new messages
      meetingChannel.on("message.new", (event: any) => {
        const msg = event.message;
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            userId: msg.user?.id || "unknown",
            userName: msg.user?.name || msg.user?.id || "Unknown",
            text: msg.text || "",
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      });

      // Listen for reaction events
      meetingChannel.on("custom.reaction" as any, (event: any) => {
        if (event.custom?.emoji) {
          // Dispatch custom event for reactions
          window.dispatchEvent(
            new CustomEvent("stream-reaction", {
              detail: {
                emoji: event.custom.emoji,
                sender: event.custom.sender || "Someone",
              },
            })
          );
        }
      });

      // Load existing messages
      if (meetingChannel.state.messages?.length > 0) {
        const existing: StreamChatMessage[] = meetingChannel.state.messages.map(
          (msg: any) => ({
            id: msg.id,
            userId: msg.user?.id || "unknown",
            userName: msg.user?.name || msg.user?.id || "Unknown",
            text: msg.text || "",
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })
        );
        setMessages(existing);
      }

      setClient(chatClient);
      setChannel(meetingChannel);
      setConnectionState("connected");
    } catch (err) {
      console.error("Stream connection error:", err);
      setConnectionState("error");
      clientRef.current?.disconnectUser();
      clientRef.current = null;
    }
  }, [userId, userName]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!channel || !text.trim()) return false;
      try {
        await channel.sendMessage({ text: text.trim() });
        return true;
      } catch (err) {
        console.error("Stream send error:", err);
        return false;
      }
    },
    [channel]
  );

  // Send reaction event
  const sendReaction = useCallback(
    async (emoji: string, sender: string) => {
      if (!channel) return false;
      try {
        await channel.sendEvent({
          type: "custom.reaction",
          custom: { emoji, sender },
        });
        return true;
      } catch {
        return false;
      }
    },
    [channel]
  );

  // Disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
        clientRef.current = null;
      }
      connectingRef.current = false;
    };
  }, [connect]);

  return {
    client,
    channel,
    connectionState,
    messages,
    sendMessage,
    sendReaction,
  };
}
