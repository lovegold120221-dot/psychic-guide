import { NextResponse } from "next/server";

// Gemini Live Translation API proxy
// Configure GEMINI_API_KEY in .env.local to enable
// Uses the gemini-3.5-live-translate-preview model

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetLanguage } = body;

    if (action === "start") {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
          { status: 501 }
        );
      }

      // Translation session started — client will connect via WebSocket
      // In production, this route would establish a session with
      // @google/genai's Live API and relay messages via WebSocket
      return NextResponse.json({
        status: "connected",
        model: "models/gemini-3.5-live-translate-preview",
        targetLanguage,
        config: {
          translationConfig: {
            targetLanguageCode: targetLanguage,
            echoTargetLanguage: true,
          },
        },
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
