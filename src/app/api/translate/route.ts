import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Gemini Live Translation API
// Uses the gemini-3.5-live-translate-preview model

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetLanguage, text } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 501 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    if (action === "start") {
      // Verify API key works by listing models or making a test call
      try {
        // Test the connection with a simple generate call
        const test = await ai.models.generateContent({
          model: "gemini-3.5-live-translate-preview",
          contents: [{ role: "user", parts: [{ text: "test" }] }],
          config: {
            translationConfig: {
              targetLanguageCode: targetLanguage,
            },
          } as any,
        });
        console.log("Gemini translation test response:", test.text);
      } catch (err: any) {
        console.error("Gemini connection test failed:", err.message);
        return NextResponse.json(
          { error: `Gemini API error: ${err.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "connected",
        model: "models/gemini-3.5-live-translate-preview",
        targetLanguage,
      });
    }

    if (action === "translate" && text) {
      // Transcribe and translate all incoming speaker audio
      const result = await ai.models.generateContent({
        model: "gemini-3.5-live-translate-preview",
        contents: [{ role: "user", parts: [{ text }] }],
        config: {
          translationConfig: {
            targetLanguageCode: targetLanguage,
          },
        } as any,
      });

      return NextResponse.json({
        original: text,
        translated: result.text,
      });
    }

    if (action === "transcribe") {
      // Transcribe audio and return both original text and translation
      // This handles all incoming audio from any speaker
      const result = await ai.models.generateContent({
        model: "gemini-3.5-live-translate-preview",
        contents: [{ role: "user", parts: [{ text: body.audio || "Transcribe and translate this audio" }] }],
        config: {
          translationConfig: {
            targetLanguageCode: targetLanguage,
          },
        } as any,
      });

      return NextResponse.json({
        transcription: result.text,
        translation: result.text,
      });
    }

    if (action === "stop") {
      return NextResponse.json({ status: "disconnected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
