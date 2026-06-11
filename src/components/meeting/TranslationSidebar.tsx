"use client";

import { useState, useCallback } from "react";
import { LANGUAGES, type LanguageOption } from "@/lib/languages";

interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  timestamp: string;
}

interface TranslationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isTranslating: boolean;
  onToggleTranslate: () => void;
  targetLanguage: string;
  onLanguageChange: (code: string) => void;
  entries: TranslationEntry[];
  targetLangName: string;
}

export default function TranslationSidebar({
  isOpen,
  onClose,
  isTranslating,
  onToggleTranslate,
  targetLanguage,
  onLanguageChange,
  entries,
  targetLangName,
}: TranslationSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-80 h-full bg-orbit-dark/95 backdrop-blur-sm border-l border-white/[0.04] flex flex-col shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0">
        <span className="font-bold text-sm text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m0 4l-3 8m0 0H3m3 0h3m8-7l-3 8m6-8h3m-3 0h-3m3 0l-3 8m6-8h3" />
          </svg>
          Translate
        </span>
        <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition" aria-label="Close">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-b border-white/[0.04] space-y-3">
        {/* Language selector + toggle */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <select
              value={targetLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-orbit-darker border border-zinc-700/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orbit-blue transition appearance-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button
            onClick={onToggleTranslate}
            className={`p-2 rounded-lg transition active:scale-90 ${
              isTranslating ? "bg-orbit-green/20 text-orbit-green" : "bg-zinc-800 text-zinc-500 hover:text-white"
            }`}
            title={isTranslating ? "Stop translation" : "Start translation"}
          >
            {isTranslating ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l2 2" />
              </svg>
            )}
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {isTranslating
              ? `Translating to ${targetLangName || targetLanguage}`
              : "Translation off"}
          </span>
          {isTranslating && (
            <span className="flex items-center gap-1.5 text-[10px] text-orbit-green">
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-green animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Translation entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {entries.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m0 4l-3 8m0 0H3m3 0h3m8-7l-3 8m6-8h3m-3 0h-3m3 0l-3 8m6-8h3" />
            </svg>
            <p className="text-xs text-zinc-500">
              {isTranslating
                ? "Waiting for speech..."
                : "Enable translation to see live captions"}
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1.5 animate-fade-in">
            {/* Original */}
            {entry.original && (
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Original</span>
                  <span className="text-[9px] text-zinc-600">{entry.timestamp}</span>
                </div>
                <p className="text-xs text-zinc-300">{entry.original}</p>
              </div>
            )}
            {/* Translation */}
            {entry.translated && (
              <div className="p-2.5 rounded-lg bg-orbit-blue/5 border border-orbit-blue/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-wider">{targetLangName || targetLanguage}</span>
                </div>
                <p className="text-xs text-zinc-200">{entry.translated}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Powered by */}
      <div className="px-4 py-2.5 border-t border-white/[0.04] text-[10px] text-zinc-600 text-center">
        Powered by Gemini Live Translation
      </div>
    </div>
  );
}
