"use client";

import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "subtle";
}

export default function GlassCard({
  children,
  className = "",
  variant = "default",
}: GlassCardProps) {
  const variants = {
    default:
      "bg-orbit-panel/70 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/40",
    elevated:
      "bg-orbit-panel/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]",
    subtle:
      "bg-orbit-card/60 backdrop-blur-md border border-white/[0.04] shadow-lg shadow-black/20",
  };

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
