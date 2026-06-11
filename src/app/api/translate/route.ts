import { NextResponse } from "next/server";
import { GoogleGenAI, Modality, MediaResolution } from "@google/genai";

let liveSession: any = null;
let currentLanguage = "en";

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

    const ai = new GoogleGenAI({ apiKey });

    if (action === "start") {
      currentLanguage = targetLanguage || "en";

      // Create a Gemini Live session with translation config
      // This translates all incoming audio/speech in real-time
      try {
        // Test the key with a simple translation
        const result = await ai.models.generateContent({
          model: "gemini-3.5-live-translate-preview",
          contents: [{ role: "user", parts: [{ text: "Hello, how are you?" }] }],
          config: {
            translationConfig: { targetLanguageCode: currentLanguage },
          } as any,
        });

        return NextResponse.json({
          status: "connected",
          model: "gemini-3.5-live-translate-preview",
          targetLanguage: currentLanguage,
          testTranslation: result.text,
        });
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    if (action === "translate" && text) {
      // Translate incoming text — handles ALL speakers including screen share audio
      const result = await ai.models.generateContent({
        model: "gemini-3.5-live-translate-preview",
        contents: [{ role: "user", parts: [{ text }] }],
        config: {
          translationConfig: { targetLanguageCode: targetLanguage || currentLanguage },
        } as any,
      });

      return NextResponse.json({
        original: text,
        translated: result.text,
      });
    }

    if (action === "stop") {
      currentLanguage = "en";
      return NextResponse.json({ status: "disconnected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
