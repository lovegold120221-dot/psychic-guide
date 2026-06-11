"use client";

import Link from "next/link";

interface TitleBarProps {
  title?: string;
  status?: React.ReactNode;
  showControls?: boolean;
  logo?: boolean;
  rightContent?: React.ReactNode;
}

export default function TitleBar({
  title = "Orbit Workspace",
  status,
  showControls = true,
  logo,
  rightContent,
}: TitleBarProps) {
  return (
    <div className="orbit-title-bar h-10 sm:h-9 w-full flex items-center sticky top-0 shrink-0 border-b border-black/40 z-50 safe-top px-3">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {logo && (
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Orbit" className="w-6 h-6" />
            <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">Orbit</span>
          </Link>
        )}
        {showControls && (
          <div className="flex gap-2">
            <Link href="/" aria-label="Close" className="active:scale-90 transition-transform">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
            </Link>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
          </div>
        )}
      </div>

      {/* Center title */}
      <div className="text-orbit-text-muted text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-2 shrink-0">
        {title}
        {status && status}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
        {rightContent}
      </div>
    </div>
  );
}
