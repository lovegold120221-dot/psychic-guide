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
  isPrivate?: boolean;
  targetUserId?: string;
}

export interface ChatUserInfo {
  id: string;
  name: string;
  online: boolean;
}

// ---- Stream Chat Hook ----
export function useStreamChat(userId: string, userName: string) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<StreamConnectionState>("disconnected");
  const [messages, setMessages] = useState<StreamChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUserInfo[]>([]);
  const clientRef = useRef<StreamChat | null>(null);
  const connectingRef = useRef(false);
  const channelRef = useRef<any>(null);

  const connect = useCallback(async () => {
    if (clientRef.current || connectingRef.current) return;
    connectingRef.current = true;
    setConnectionState("connecting");

    try {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      clientRef.current = chatClient;

      const res = await fetch("/api/stream-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName }),
      });

      if (!res.ok) {
        console.warn("Stream token API unavailable, using dev token");
        const devToken = chatClient.devToken(userId);
        await chatClient.connectUser({ id: userId, name: userName }, devToken);
      } else {
        const { token } = await res.json();
        await chatClient.connectUser({ id: userId, name: userName }, token);
      }

      const meetingChannel = chatClient.channel("messaging", "orbit_meeting_room_main", {
        name: "Orbit Main Meeting Room",
        image: "https://eburon.ai/icon-eburon.svg",
      });

      await meetingChannel.watch();
      channelRef.current = meetingChannel;

      // Track channel members (for private chat user list)
      const updateUsers = () => {
        const membersMap = meetingChannel.state.members;
        const chatUsers: ChatUserInfo[] = [];
        if (membersMap && typeof membersMap === "object") {
          // members can be a Map or an object
          const entries = membersMap instanceof Map
            ? Array.from(membersMap.values())
            : Object.values(membersMap);
          entries.forEach((member: any) => {
            if (member.user?.id) {
              chatUsers.push({
                id: member.user.id,
                name: member.user.name || member.user.id,
                online: member.user.online || false,
              });
            }
          });
        }
        setUsers(chatUsers);
      };
      updateUsers();

      // Listen for member updates
      meetingChannel.on("member.added", updateUsers);
      meetingChannel.on("member.removed", updateUsers);
      meetingChannel.on("user.watching.start", updateUsers);
      meetingChannel.on("user.watching.stop", updateUsers);

      // Listen for new messages (including private)
      meetingChannel.on("message.new", (event: any) => {
        const msg = event.message;
        const isPrivate = msg.text?.startsWith("/dm ") || false;
        const targetId = isPrivate ? msg.text?.match(/^\/dm\s+(\S+)/)?.[1] : undefined;
        const cleanText = isPrivate && targetId ? msg.text?.replace(/^\/dm\s+\S+\s*/, "") : msg.text;

        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            userId: msg.user?.id || "unknown",
            userName: msg.user?.name || msg.user?.id || "Unknown",
            text: cleanText || msg.text || "",
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isPrivate,
            targetUserId: targetId,
          },
        ]);
      });

      // Listen for reaction events
      meetingChannel.on("custom.reaction" as any, (event: any) => {
        if (event.custom?.emoji) {
          window.dispatchEvent(
            new CustomEvent("stream-reaction", {
              detail: { emoji: event.custom.emoji, sender: event.custom.sender || "Someone" },
            })
          );
        }
      });

      // Load existing messages
      if (meetingChannel.state.messages?.length > 0) {
        const existing: StreamChatMessage[] = meetingChannel.state.messages.map((msg: any) => ({
          id: msg.id,
          userId: msg.user?.id || "unknown",
          userName: msg.user?.name || msg.user?.id || "Unknown",
          text: msg.text || "",
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
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

  // Send message (global or private)
  const sendMessage = useCallback(
    async (text: string, targetUserId?: string) => {
      const ch = channelRef.current;
      if (!ch || !text.trim()) return false;
      try {
        if (targetUserId) {
          // Send as private message using Stream's /dm prefix
          await ch.sendMessage({ text: `/dm ${targetUserId} ${text.trim()}` });
        } else {
          await ch.sendMessage({ text: text.trim() });
        }
        return true;
      } catch (err) {
        console.error("Stream send error:", err);
        return false;
      }
    },
    []
  );

  // Send reaction event
  const sendReaction = useCallback(
    async (emoji: string, sender: string) => {
      if (!channelRef.current) return false;
      try {
        await channelRef.current.sendEvent({
          type: "custom.reaction",
          custom: { emoji, sender },
        });
        return true;
      } catch { return false; }
    },
    []
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

  return { client, channel, connectionState, messages, users, sendMessage, sendReaction };
}
