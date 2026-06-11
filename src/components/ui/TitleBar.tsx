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
    <div className="orbit-title-bar h-8 w-full flex items-center justify-center relative shrink-0 border-b border-black/40 z-50">
      {showControls && (
        <div className="absolute left-4 flex gap-2">
          <Link href="/" aria-label="Close">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 cursor-pointer transition" />
          </Link>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 cursor-pointer transition" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 cursor-pointer transition" />
        </div>
      )}

      <div className="text-orbit-text-muted text-xs font-medium tracking-wide flex items-center gap-2">
        {title}
        {status && status}
      </div>
    </div>
  );
}
