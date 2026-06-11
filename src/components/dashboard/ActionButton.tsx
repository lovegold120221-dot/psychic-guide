"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface ActionButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  color: "orange" | "blue";
  onClick?: () => void;
}

export default function ActionButton({
  href,
  icon,
  label,
  color,
  onClick,
}: ActionButtonProps) {
  const colorClasses =
    color === "orange"
      ? "bg-orbit-orange group-hover:shadow-orange-500/30"
      : "bg-orbit-blue group-hover:shadow-blue-500/30";

  const Wrapper = href === "#" || onClick ? "button" : Link;
  const wrapperProps =
    href === "#" || onClick
      ? { onClick, type: "button" as const }
      : { href };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="action-btn flex flex-col items-center justify-center gap-3 sm:gap-4 bg-transparent cursor-pointer group p-2"
    >
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${colorClasses} flex items-center justify-center text-white shadow-lg transition-shadow`}
      >
        {icon}
      </div>
      <span className="font-medium text-[13px] sm:text-[15px] text-white">
        {label}
      </span>
    </Wrapper>
  );
}
