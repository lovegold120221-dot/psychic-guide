"use client";

import Link from "next/link";

interface TitleBarProps {
  title?: string;
  status?: React.ReactNode;
  showControls?: boolean;
}

export default function TitleBar({
  title = "Orbit Workspace",
  status,
  showControls = true,
}: TitleBarProps) {
  return (
    <div className="orbit-title-bar h-9 sm:h-8 w-full flex items-center justify-center sticky top-0 shrink-0 border-b border-black/40 z-50 safe-top">
      {showControls && (
        <div className="absolute left-3 sm:left-4 flex gap-2">
          <Link href="/" aria-label="Close" className="active:scale-90 transition-transform">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
          </Link>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-110 cursor-pointer transition-all shadow-sm" />
        </div>
      )}

      <div className="text-orbit-text-muted text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-2">
        {title}
        {status && status}
      </div>
    </div>
  );
}
