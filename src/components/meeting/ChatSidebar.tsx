"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  time: string;
  isPrivate?: boolean;
  targetUserId?: string;
}

interface ChatUser {
  id: string;
  name: string;
  online: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, targetUserId?: string) => Promise<boolean>;
  connectionState: "disconnected" | "connecting" | "connected" | "error";
  currentUserId?: string;
  users?: ChatUser[];
}

export default function ChatSidebar({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  connectionState,
  currentUserId = "",
  users = [],
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [privateTarget, setPrivateTarget] = useState<ChatUser | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    const ok = await onSendMessage(text, privateTarget?.id);
    if (!ok) setInput(text);
    setSending(false);
  }

  const statusBadge = {
    connected: "text-orbit-green bg-green-900/30",
    connecting: "text-yellow-500 bg-yellow-900/20",
    error: "text-red-400 bg-red-900/30",
    disconnected: "text-zinc-500 bg-zinc-800",
  }[connectionState];

  const statusLabel = {
    connected: "Live",
    connecting: "Connecting...",
    error: "Error",
    disconnected: "Offline",
  }[connectionState];

  const filtered = privateTarget
    ? messages.filter(
        (m) =>
          (m.userId === currentUserId && m.targetUserId === privateTarget.id) ||
          (m.userId === privateTarget.id && m.isPrivate)
      )
    : messages;

  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } w-full sm:w-80 h-full bg-orbit-dark/95 backdrop-blur-sm border-l border-white/[0.04] flex-col shrink-0 animate-slide-in-right`}
    >
      {/* Header */}
      <div className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <span className="font-bold text-sm text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          {privateTarget ? `@${privateTarget.name}` : "Meeting Chat"}
        </span>
        <div className="flex items-center gap-2">
          {privateTarget && (
            <button
              onClick={() => setPrivateTarget(null)}
              className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition"
            >
              All
            </button>
          )}
          <button
            onClick={() => setShowUsers(!showUsers)}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded transition ${
              showUsers ? "bg-orbit-blue/20 text-orbit-blue" : "text-zinc-400 hover:text-white"
            }`}
          >
            {users.length}
          </button>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${statusBadge}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {statusLabel}
          </span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-lg leading-none" aria-label="Close chat">✕</button>
        </div>
      </div>

      {/* User list */}
      {showUsers && (
        <div className="border-b border-white/[0.04] max-h-32 overflow-y-auto py-1">
          {users
            .filter((u) => u.id !== currentUserId)
            .map((u) => (
              <button
                key={u.id}
                onClick={() => { setPrivateTarget(u); setShowUsers(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-left hover:bg-white/5 transition"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${u.online ? "bg-orbit-green" : "bg-zinc-600"}`} />
                <span className="text-zinc-300">{u.name}</span>
                <span className="text-[10px] text-zinc-500 ml-auto">DM</span>
              </button>
            ))}
        </div>
      )}

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center text-[10px] text-zinc-500 my-2">
          {connectionState === "connected"
            ? privateTarget
              ? `Private chat with ${privateTarget.name}`
              : "Orbit Chat — Powered by Stream"
            : "Connecting to Stream..."}
        </div>

        {filtered.map((msg) => {
          const isMe = msg.userId === currentUserId;
          const isPrivate = msg.isPrivate;
          return (
            <div key={msg.id} className="animate-fade-in">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-semibold text-xs ${isMe ? "text-orbit-green" : "text-blue-400"}`}>
                  {msg.userName}
                  {isMe && <span className="text-[10px] text-zinc-500 ml-0.5">(You)</span>}
                </span>
                <span className="text-[9px] text-zinc-500">{msg.time}</span>
                {isPrivate && <span className="text-[8px] text-amber-500 font-semibold">PRIVATE</span>}
              </div>
              <div className={`text-xs ${isPrivate ? "text-amber-200 bg-amber-500/5 border border-amber-500/10" : "text-zinc-200 bg-white/[0.04] border border-white/[0.04]"} p-2.5 rounded-xl inline-block max-w-[90%]`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && connectionState === "connected" && (
          <div className="text-center text-zinc-500 text-xs py-8">
            {privateTarget ? `No private messages with ${privateTarget.name} yet.` : "No messages yet. Say hello! 👋"}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/[0.04] bg-orbit-panel/80">
        {privateTarget && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="text-[10px] text-amber-400 font-medium">To: @{privateTarget.name}</span>
            <button onClick={() => setPrivateTarget(null)} className="text-zinc-500 hover:text-white text-xs ml-auto">Cancel</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              connectionState === "connected"
                ? privateTarget
                  ? `Message @${privateTarget.name}...`
                  : "Type a message..."
                : "Connecting..."
            }
            disabled={connectionState !== "connected" || sending}
            className="flex-1 bg-orbit-darker border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 transition disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={connectionState !== "connected" || sending || !input.trim()}
            className="bg-orbit-blue hover:bg-blue-500 disabled:bg-zinc-700 disabled:opacity-40 text-white rounded-xl px-3.5 py-2.5 flex items-center justify-center transition active:scale-90"
            aria-label="Send message"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
