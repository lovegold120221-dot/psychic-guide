"use client";

import { REACTIONS } from "@/lib/constants";

interface ReactionsProps {
  isOpen: boolean;
  onToggle: () => void;
  onReaction: (emoji: string) => void;
}

export default function Reactions({
  isOpen,
  onToggle,
  onReaction,
}: ReactionsProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex flex-col items-center justify-center w-[56px] h-[56px] rounded orbit-btn-hover cursor-pointer transition relative"
        aria-label="Reactions"
      >
        <svg
          className="w-[22px] h-[22px] mb-1 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="absolute top-1 right-[12px] text-zinc-300 font-bold text-[10px]">
          +
        </span>
        <span className="text-[10px] font-medium tracking-wide text-zinc-400">
          Reactions
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-orbit-panel border border-zinc-700 p-3 rounded-xl flex items-center gap-2 shadow-2xl z-50 animate-slide-up">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform active:scale-90"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
