"use client";

// ─── Color palette for avatar backgrounds ──────────────────────
const COLORS = [
  "from-orbit-blue to-blue-700",
  "from-orbit-orange to-orange-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-teal-500 to-teal-700",
  "from-amber-500 to-amber-700",
  "from-emerald-500 to-emerald-700",
  "from-rose-500 to-rose-700",
  "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitial(name: string): string {
  return (name || "?").trim()[0]?.toUpperCase() || "?";
}

interface InitialAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function InitialAvatar({
  name,
  size = 76,
  className = "",
}: InitialAvatarProps) {
  const gradient = hashColor(name);
  const initial = getInitial(name);

  return (
    <div
      className={`overflow-hidden rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      <span
        className="font-bold text-white select-none"
        style={{ fontSize: Math.max(size * 0.42, 14) }}
      >
        {initial}
      </span>
    </div>
  );
}
