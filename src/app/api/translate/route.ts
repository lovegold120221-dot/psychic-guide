import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  const body = await request.json();
  const { action, targetLanguage, text } = body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Add GEMINI_API_KEY" }, { status: 501 });
  }

  if (action === "start") {
    return NextResponse.json({ status: "ok" });
  }

  if (action === "stop") {
    return NextResponse.json({ status: "disconnected" });
  }

  if (action !== "translate" || !text) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const lang = getLangName(targetLanguage || "en");

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [{ text: `Translate precisely to ${lang}. Return ONLY the translation, nothing else:\n\n${text}` }],
      }],
    });

    return NextResponse.json({
      original: text,
      translated: result.text?.trim() || "",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getLangName(code: string): string {
  const m: Record<string, string> = {
    "af":"Afrikaans","sq":"Albanian","ar":"Arabic","hy":"Armenian","az":"Azerbaijani",
    "eu":"Basque","be":"Belarusian","bn":"Bengali","bg":"Bulgarian","ca":"Catalan",
    "zh-CN":"Chinese (Simplified)","zh-TW":"Chinese (Traditional)","hr":"Croatian",
    "cs":"Czech","da":"Danish","nl":"Dutch","nl-BE":"Dutch (Belgium)","en":"English",
    "et":"Estonian","fi":"Finnish","fr":"French","de":"German","el":"Greek",
    "hi":"Hindi","hu":"Hungarian","is":"Icelandic","id":"Indonesian","ga":"Irish",
    "it":"Italian","ja":"Japanese","ko":"Korean","lv":"Latvian","lt":"Lithuanian",
    "ms":"Malay","no":"Norwegian","fa":"Persian","pl":"Polish","pt":"Portuguese",
    "ro":"Romanian","ru":"Russian","sr":"Serbian","sk":"Slovak","sl":"Slovenian",
    "es":"Spanish","sw":"Swahili","sv":"Swedish","tl":"Tagalog","ta":"Tamil",
    "th":"Thai","tr":"Turkish","uk":"Ukrainian","ur":"Urdu","vi":"Vietnamese",
  };
  return m[code] || code;
}
