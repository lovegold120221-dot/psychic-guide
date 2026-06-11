"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import TitleBar from "@/components/ui/TitleBar";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  backHref,
  backLabel,
}: AuthLayoutProps) {
  return (
    <>
      <TitleBar title={title} />

      <div className="flex-1 w-full h-full flex flex-col items-center justify-center overflow-y-auto pb-20 md:pb-0">
        {/* Background ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orbit-blue/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
          {/* Back link */}
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backLabel || "Back"}
            </Link>
          )}

          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
}
