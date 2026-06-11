"use client";

import Link from "next/link";

interface TitleBarProps {
  title?: string;
  status?: React.ReactNode;
  showControls?: boolean;
  logo?: boolean;
  rightContent?: React.ReactNode;
  backTo?: { href: string; label: string };
}

export default function TitleBar({
  title = "Orbit Workspace",
  status,
  showControls = true,
  logo,
  rightContent,
  backTo,
}: TitleBarProps) {
  return (
    <div className="orbit-title-bar h-11 w-full flex items-center sticky top-0 shrink-0 border-b border-white/[0.06] z-50 safe-top px-4">
      {/* Left section */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {backTo && (
          <Link href={backTo.href} className="flex items-center gap-1 text-zinc-400 hover:text-white transition text-xs font-medium shrink-0 mr-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {backTo.label}
          </Link>
        )}
        {logo && (
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Orbit" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">Orbit</span>
          </Link>
        )}
        {showControls && (
          <div className="flex gap-1.5">
            <Link href="/" aria-label="Close" className="active:scale-90 transition-transform">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 cursor-pointer transition-all" />
            </Link>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 cursor-pointer transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 cursor-pointer transition-all" />
          </div>
        )}
      </div>

      {/* Center title */}
      <div className="text-zinc-500 text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-2 shrink-0">
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
