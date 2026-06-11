"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { StreamVideoClient, type User } from "@stream-io/video-react-sdk";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export type VideoConnectionState = "idle" | "connecting" | "connected" | "error";

interface UseStreamVideoOptions {
  userId: string;
  userName: string;
}

export function useStreamVideo({ userId, userName }: UseStreamVideoOptions) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [connectionState, setConnectionState] = useState<VideoConnectionState>("idle");
  const clientRef = useRef<StreamVideoClient | null>(null);
  const connectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (clientRef.current || connectingRef.current) return;
    connectingRef.current = true;
    setConnectionState("connecting");

    try {
      // Fetch token from our API route (same JWT works for Chat + Video)
      const res = await fetch("/api/stream-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch Stream token");
      }

      const { token } = await res.json();

      const streamUser: User = {
        id: userId,
        name: userName,
      };

      if (!STREAM_API_KEY) throw new Error("Stream API key missing");
      const videoClient = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: streamUser,
        tokenProvider: () => Promise.resolve(token),
      });

      clientRef.current = videoClient;
      setClient(videoClient);
      setConnectionState("connected");
    } catch (err) {
      console.error("Stream Video connection error:", err);
      setConnectionState("error");
      // Retry after 3s
      connectingRef.current = false;
      setTimeout(() => {
        if (!clientRef.current) {
          setConnectionState("idle");
        }
      }, 3000);
    } finally {
      connectingRef.current = false;
    }
  }, [userId, userName]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnectUser();
      clientRef.current = null;
    }
    connectingRef.current = false;
    setClient(null);
    setConnectionState("idle");
  }, []);

  useEffect(() => {
    if (userId && userName && !clientRef.current) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, userName, connect, disconnect]);

  return { client, connectionState };
}
