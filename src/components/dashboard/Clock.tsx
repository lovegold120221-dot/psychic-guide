"use client";

import { useClock } from "@/lib/hooks";

export default function Clock() {
  const { time, date, ampm } = useClock();

  return (
    <div className="clock-gradient rounded-2xl h-44 sm:h-48 w-full border border-zinc-700/50 p-6 sm:p-8 flex flex-col justify-center shadow-xl relative overflow-hidden">
      {/* Decorative blur circle */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-zinc-700/20 rounded-full blur-2xl" />

      <div className="text-5xl sm:text-6xl font-light tracking-tight text-white mb-2 relative z-10">
        {time}{" "}
        <span className="text-xl sm:text-2xl font-semibold ml-1">{ampm}</span>
      </div>
      <div className="text-base sm:text-lg text-orbit-text-dim font-medium relative z-10">
        {date}
      </div>
    </div>
  );
}
