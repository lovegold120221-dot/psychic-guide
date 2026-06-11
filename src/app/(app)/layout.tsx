"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import MobileNav from "@/components/ui/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isMeeting = pathname?.startsWith("/meeting");

  useEffect(() => {
    if (!loading && !user && !isMeeting) {
      router.push("/auth/login");
    }
  }, [user, loading, router, isMeeting]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-orbit-blue mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow anonymous users to access the meeting page
  if (!user && !isMeeting) return null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Main content fills all available space */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {children}
      </div>

      {/* Mobile bottom nav — hidden on meeting page (uses BottomToolbar instead) */}
      {!isMeeting && <MobileNav />}
    </div>
  );
}
