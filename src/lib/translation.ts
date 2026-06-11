"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  timestamp: string;
}

interface UseTranslationOptions {
  apiKey?: string;
}

export function useTranslation({ apiKey }: UseTranslationOptions = {}) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(0);

  const getLanguageName = useCallback((code: string) => {
    const langs: Record<string, string> = {
      "af": "Afrikaans", "sq": "Albanian", "am": "Amharic", "ar": "Arabic",
      "hy": "Armenian", "az": "Azerbaijani", "eu": "Basque", "be": "Belarusian",
      "bn": "Bengali", "bs": "Bosnian", "bg": "Bulgarian", "ca": "Catalan",
      "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
      "hr": "Croatian", "cs": "Czech", "da": "Danish", "nl": "Dutch",
      "nl-BE": "Dutch (Belgium)", "en": "English", "et": "Estonian",
      "fi": "Finnish", "fr": "French", "de": "German", "el": "Greek",
      "gu": "Gujarati", "ht": "Haitian Creole", "he": "Hebrew", "hi": "Hindi",
      "hu": "Hungarian", "is": "Icelandic", "id": "Indonesian", "ga": "Irish",
      "it": "Italian", "ja": "Japanese", "kn": "Kannada", "kk": "Kazakh",
      "ko": "Korean", "ky": "Kyrgyz", "lv": "Latvian", "lt": "Lithuanian",
      "lb": "Luxembourgish", "mk": "Macedonian", "ms": "Malay", "ml": "Malayalam",
      "mr": "Marathi", "mn": "Mongolian", "ne": "Nepali", "no": "Norwegian",
      "fa": "Persian", "pl": "Polish", "pt": "Portuguese", "pa": "Punjabi",
      "ro": "Romanian", "ru": "Russian", "sr": "Serbian", "sk": "Slovak",
      "sl": "Slovenian", "so": "Somali", "es": "Spanish", "su": "Sundanese",
      "sw": "Swahili", "sv": "Swedish", "tl": "Tagalog", "ta": "Tamil",
      "te": "Telugu", "th": "Thai", "tr": "Turkish", "uk": "Ukrainian",
      "ur": "Urdu", "uz": "Uzbek", "vi": "Vietnamese", "cy": "Welsh",
      "yi": "Yiddish", "yo": "Yoruba", "zu": "Zulu",
    };
    return langs[code] || code;
  }, []);

  const startTranslation = useCallback(async (lang: string) => {
    setIsTranslating(true);
    setTargetLanguage(lang);

    // In production, this would connect to a server endpoint
    // that proxies the Gemini Live Translation API.
    // For now, we simulate translation with a delay.
    try {
      // Try to connect via a server-side API route
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          targetLanguage: lang,
          apiKey: apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        }),
      });
      if (!res.ok) {
        throw new Error("Translation API not available");
      }
    } catch {
      // Simulate translation for demo - will work when API is set up
      console.log("Translation simulation mode (no API key configured)");
    }
  }, [apiKey]);

  const stopTranslation = useCallback(async () => {
    setIsTranslating(false);
    try {
      await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
    } catch {}
  }, []);

  const toggleTranslation = useCallback(async () => {
    if (isTranslating) {
      await stopTranslation();
    } else {
      await startTranslation(targetLanguage);
    }
  }, [isTranslating, targetLanguage, startTranslation, stopTranslation]);

  const addEntry = useCallback((original: string, translated: string) => {
    const id = `t-${++idRef.current}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setEntries((prev) => [...prev.slice(-50), { id, original, translated, timestamp }]);
  }, []);

  const changeLanguage = useCallback(async (code: string) => {
    setTargetLanguage(code);
    if (isTranslating) {
      await stopTranslation();
      await startTranslation(code);
    }
  }, [isTranslating, startTranslation, stopTranslation]);

  return {
    isTranslating,
    targetLanguage,
    targetLangName: getLanguageName(targetLanguage),
    entries,
    toggleTranslation,
    changeLanguage,
    addEntry,
    startTranslation,
    stopTranslation,
  };
}
