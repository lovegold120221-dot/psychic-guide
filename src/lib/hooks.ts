"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LayoutMode, Participant } from "./constants";

// ---- Meeting State Hook ----
export function useMeetingState() {
  const [localMicMuted, setLocalMicMuted] = useState(true);
  const [localCamOn, setLocalCamOn] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("2-speaker");
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  // Dynamic participants — starts empty, filled by real data
  const [participants, setParticipants] = useState<Participant[]>([]);

  const toggleMic = useCallback(() => setLocalMicMuted((p) => !p), []);
  const toggleCam = useCallback(() => setLocalCamOn((p) => !p), []);
  const toggleChat = useCallback(() => {
    setChatOpen((p) => !p);
    setUnreadChats(0);
  }, []);
  const toggleReactions = useCallback(() => setReactionsOpen((p) => !p), []);
  const toggleViewMenu = useCallback(() => setViewMenuOpen((p) => !p), []);

  const switchLayout = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    setViewMenuOpen(false);
  }, []);

  return {
    localMicMuted,
    localCamOn,
    layoutMode,
    chatOpen,
    unreadChats,
    reactionsOpen,
    viewMenuOpen,
    participants,
    setParticipants,
    toggleMic,
    toggleCam,
    toggleChat,
    toggleReactions,
    toggleViewMenu,
    switchLayout,
    setUnreadChats,
  };
}

// ---- Reaction Animation Hook ----
export function useReactionAnimation() {
  const [floatingReactions, setFloatingReactions] = useState<
    { id: number; emoji: string; sender: string; left: number }[]
  >([]);
  const idRef = useRef(0);

  const triggerReaction = useCallback((emoji: string, sender: string) => {
    const id = ++idRef.current;
    const left = Math.random() * 80 + 10;
    setFloatingReactions((prev) => [...prev, { id, emoji, sender, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2600);
  }, []);

  return { floatingReactions, triggerReaction };
}

// ---- Clock Hook (SSR-safe) ----
export function useClock() {
  const [time, setTime] = useState<string>("--:--");
  const [date, setDate] = useState<string>("Loading...");
  const [ampm, setAmpm] = useState<string>("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const am = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? "0" + m : m}`);
      setAmpm(am);
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, date, ampm };
}

// ---- Media Query Hook ----
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// ---- Copy to Clipboard Hook ----
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    }
  }, []);

  return { copied, copy };
}

// ---- Meeting ID Generator (SSR-safe) ----
export function useMeetingId() {
  const [mounted, setMounted] = useState(false);
  const [meetingId, setMeetingId] = useState("000-000-000");

  const generate = useCallback(() => {
    const part = () =>
      Math.floor(Math.random() * 900 + 100)
        .toString()
        .padStart(3, "0");
    return `${part()}-${part()}-${part()}`;
  }, []);

  useEffect(() => {
    setMeetingId(generate());
    setMounted(true);
  }, [generate]);

  const regenerate = useCallback(() => setMeetingId(generate()), [generate]);

  return { meetingId, regenerate, mounted };
}

// ---- Form State Hook ----
export function useFormState<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const setValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const validate = useCallback(
    (rules: Partial<Record<keyof T, (v: string) => string | undefined>>) => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      for (const [key, rule] of Object.entries(rules) as [
        keyof T,
        (v: string) => string | undefined
      ][]) {
        const err = rule(values[key]);
        if (err) newErrors[key] = err;
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values]
  );

  return { values, errors, setValue, validate };
}
