"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/join",
    label: "Join",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/meeting",
    label: "Meet",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "#",
    label: "More",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Hide on meeting room — it has its own BottomToolbar
  if (pathname?.startsWith("/meeting")) return null;

  return (
    <nav className="md:hidden sticky bottom-0 inset-x-0 h-16 bg-orbit-panel/95 backdrop-blur-2xl border-t border-white/[0.04] flex items-center justify-around z-50 safe-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "#" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 active:scale-90 native-btn-soft ${
              isActive
                ? "text-orbit-blue"
                : "text-orbit-text-dim hover:text-white"
            }`}
          >
            {item.icon(isActive)}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
