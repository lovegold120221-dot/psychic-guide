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

const MODEL = "gemini-2.0-flash";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetLanguage, text } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Add GEMINI_API_KEY to .env.local" },
        { status: 501 }
      );
    }

    // Detect Vertex AI key (AQ prefix) vs Google AI Studio key (AIza prefix)
    const isVertexAI = apiKey.startsWith("AQ.");
    const aiOpts: Record<string, any> = { apiKey };
    if (isVertexAI) {
      // Vertex AI: use v1beta endpoint with project location
      Object.assign(aiOpts, {
        httpOptions: { apiVersion: "v1beta", baseUrl: "https://us-central1-aiplatform.googleapis.com/v1" },
      });
    } else {
      // Google AI Studio: standard endpoint
      aiOpts.httpOptions = { apiVersion: "v1beta" };
    }

    const ai = new GoogleGenAI(aiOpts as any);
    const langName = LANG_NAMES[targetLanguage || "en"] || targetLanguage || "English";

    if (action === "start") {
      try {
        const test = await ai.models.generateContent({
          model: MODEL,
          contents: [{ role: "user", parts: [{ text: `Translate to ${langName}: Hi` }] }],
        });
        return NextResponse.json({
          status: "connected",
          targetLanguage: targetLanguage || "en",
          provider: isVertexAI ? "vertexai" : "gemini",
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    if (action === "translate" && text) {
      const result = await ai.models.generateContent({
        model: MODEL,
        contents: [{
          role: "user",
          parts: [{
            text: `Translate precisely to ${langName}. Return translation only, no notes:\n\n${text}`
          }]
        }],
      });
      return NextResponse.json({
        original: text,
        translated: result.text?.trim() || "",
      });
    }

    if (action === "stop") {
      return NextResponse.json({ status: "disconnected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
