"use client";

interface FloatingReactionsProps {
  reactions: { id: number; emoji: string; sender: string; left: number }[];
}

export default function FloatingReactions({
  reactions,
}: FloatingReactionsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="reaction-bubble flex flex-col items-center"
          style={{ left: `${r.left}%` }}
        >
          <span className="text-3xl drop-shadow-xl">{r.emoji}</span>
          <span className="text-[9px] bg-black/60 px-1 rounded mt-1 font-bold text-white">
            {r.sender}
          </span>
        </div>
      ))}
    </div>
  );
}
