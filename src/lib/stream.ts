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
        const devToken = chatClient.devToken(userId);
        await chatClient.connectUser({ id: userId, name: userName }, devToken);
      } else {
        const { token } = await res.json();
        await chatClient.connectUser({ id: userId, name: userName }, token);
      }

      const meetingChannel = chatClient.channel("messaging", "orbit_meeting_room_main", {
        name: "Orbit Main Meeting Room",
      });

      await meetingChannel.watch();
      channelRef.current = meetingChannel;

      // Track members
      const updateUsers = () => {
        const membersMap: any = meetingChannel.state.members;
        const chatUsers: ChatUserInfo[] = [];
        if (membersMap && typeof membersMap === "object") {
          const entries = membersMap instanceof Map
            ? Array.from(membersMap.values())
            : Object.values(membersMap);
          entries.forEach((member: any) => {
            if (member.user?.id && member.user.id !== userId) {
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
      meetingChannel.on("member.added", updateUsers);
      meetingChannel.on("member.removed", updateUsers);

      // ─── Message receive handler with private message support ──
      meetingChannel.on("message.new", (event: any) => {
        const msg = event.message;
        const msgUserId = msg.user?.id || "unknown";
        const msgUserName = msg.user?.name || msg.user?.id || "Unknown";
        const isPrivate = msg.is_private === true;
        const targetUserId = msg.target_user_id || undefined;

        // Skip private messages not intended for us
        if (isPrivate && targetUserId && targetUserId !== userId) return;

        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            userId: msgUserId,
            userName: msgUserName,
            text: msg.text || "",
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isPrivate,
            targetUserId,
          },
        ]);
      });

      // Reaction events
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
        const existing: StreamChatMessage[] = meetingChannel.state.messages
          .filter((msg: any) => {
            // Filter out private msgs not for us
            if (msg.is_private && msg.target_user_id && msg.target_user_id !== userId) return false;
            return true;
          })
          .map((msg: any) => ({
            id: msg.id,
            userId: msg.user?.id || "unknown",
            userName: msg.user?.name || msg.user?.id || "Unknown",
            text: msg.text || "",
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isPrivate: msg.is_private === true,
            targetUserId: msg.target_user_id || undefined,
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

  // ─── Send message (global or private) ───────────────────────
  const sendMessage = useCallback(
    async (text: string, targetUserId?: string) => {
      const ch = channelRef.current;
      if (!ch || !text.trim()) return false;
      try {
        const msgData: any = { text: text.trim() };
        if (targetUserId) {
          msgData.is_private = true;
          msgData.target_user_id = targetUserId;
        }
        await ch.sendMessage(msgData);
        return true;
      } catch (err) {
        console.error("Stream send error:", err);
        return false;
      }
    },
    []
  );

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
