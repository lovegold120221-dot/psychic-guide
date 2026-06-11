"use client";

import { useState, useCallback, useRef } from "react";

export interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  timestamp: string;
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [apiReady, setApiReady] = useState(true);
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
    setTargetLanguage(lang);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", targetLanguage: lang }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Translation API not available");
      }
      setIsTranslating(true);
      setApiReady(true);
    } catch (err: any) {
      console.error("Translation start error:", err.message);
      setApiReady(false);
      setIsTranslating(false);
    }
  }, []);

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

  const translateText = useCallback(async (text: string) => {
    if (!isTranslating || !text.trim()) return;
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          targetLanguage,
          text,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.translated) {
        const id = `t-${++idRef.current}`;
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setEntries((prev) => [...prev.slice(-50), { id, original: data.original, translated: data.translated, timestamp }]);
      }
    } catch {}
  }, [isTranslating, targetLanguage]);

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
    apiReady,
    toggleTranslation,
    changeLanguage,
    translateText,
    setEntries,
  };
}
