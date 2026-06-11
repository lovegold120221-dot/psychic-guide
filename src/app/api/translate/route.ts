import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const LANG_NAMES: Record<string, string> = {
  "af":"Afrikaans","sq":"Albanian","am":"Amharic","ar":"Arabic","hy":"Armenian",
  "az":"Azerbaijani","eu":"Basque","be":"Belarusian","bn":"Bengali","bs":"Bosnian",
  "bg":"Bulgarian","ca":"Catalan","zh-CN":"Chinese (Simp.)","zh-TW":"Chinese (Trad.)",
  "hr":"Croatian","cs":"Czech","da":"Danish","nl":"Dutch","nl-BE":"Dutch (Belgium)",
  "en":"English","et":"Estonian","fi":"Finnish","fr":"French","de":"German",
  "el":"Greek","gu":"Gujarati","ht":"Haitian Creole","he":"Hebrew","hi":"Hindi",
  "hu":"Hungarian","is":"Icelandic","id":"Indonesian","ga":"Irish","it":"Italian",
  "ja":"Japanese","kn":"Kannada","kk":"Kazakh","ko":"Korean","ky":"Kyrgyz",
  "lv":"Latvian","lt":"Lithuanian","lb":"Luxembourgish","mk":"Macedonian",
  "ms":"Malay","ml":"Malayalam","mr":"Marathi","mn":"Mongolian","ne":"Nepali",
  "no":"Norwegian","fa":"Persian","pl":"Polish","pt":"Portuguese","pa":"Punjabi",
  "ro":"Romanian","ru":"Russian","sr":"Serbian","sk":"Slovak","sl":"Slovenian",
  "so":"Somali","es":"Spanish","su":"Sundanese","sw":"Swahili","sv":"Swedish",
  "tl":"Tagalog","ta":"Tamil","te":"Telugu","th":"Thai","tr":"Turkish",
  "uk":"Ukrainian","ur":"Urdu","uz":"Uzbek","vi":"Vietnamese","cy":"Welsh",
  "yi":"Yiddish","yo":"Yoruba","zu":"Zulu",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetLanguage, text } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local" }, { status: 501 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const langName = LANG_NAMES[targetLanguage || "en"] || targetLanguage || "English";

    if (action === "translate" && text) {
      // Use gemini-2.0-flash for translation — the Live Translation model
      // requires WebSocket audio streaming and isn't suitable for REST API.
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{
          role: "user",
          parts: [{ text: `Translate this precisely to ${langName}. Return ONLY the translation, nothing else:\n\n${text}` }]
        }],
      });

      return NextResponse.json({
        original: text,
        translated: result.text?.trim() || "",
      });
    }

    if (action === "start") {
      return NextResponse.json({ status: "ok" });
    }

    if (action === "stop") {
      return NextResponse.json({ status: "disconnected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
