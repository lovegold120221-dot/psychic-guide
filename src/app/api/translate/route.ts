import { NextResponse } from "next/server";
import { GoogleGenAI, Modality, MediaResolution, type LiveServerMessage } from "@google/genai";

const MODEL = "models/gemini-3.5-live-translate-preview";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, targetLanguage, text } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Add GEMINI_API_KEY" }, { status: 501 });
    }

    if (action === "start") {
      return NextResponse.json({ status: "ok", model: MODEL });
    }

    if (action === "translate" && text) {
      const ai = new GoogleGenAI({ apiKey });
      const responseQueue: LiveServerMessage[] = [];
      let session: any;

      session = await ai.live.connect({
        model: MODEL,
        callbacks: {
          onopen() {},
          onmessage(message: LiveServerMessage) {
            responseQueue.push(message);
          },
          onerror(e: ErrorEvent) {
            console.error("Live err:", e.message);
          },
          onclose() {},
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
          translationConfig: {
            targetLanguageCode: targetLanguage || "en",
            echoTargetLanguage: true,
          },
        } as any,
      }) as any;

      await session.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      });

      let translated = "";
      let debug = "";
      const deadline = Date.now() + 20000;

      while (!translated && Date.now() < deadline) {
        const msg = responseQueue.shift();
        if (msg) {
          // Log all parts for debugging
          const parts = msg.serverContent?.modelTurn?.parts;
          const hasText = parts?.some((p: any) => p.text);
          const hasData = parts?.some((p: any) => p.inlineData || p.fileData);
          debug += `msg(turnComplete=${!!msg.serverContent?.turnComplete},text=${!!hasText},data=${!!hasData}) `;
          
          if (parts) {
            for (const part of parts) {
              if (part.text) translated += part.text;
            }
          }
          if (msg.serverContent?.turnComplete) break;
        } else {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      if (!translated) translated = `(no text - debug: ${debug})`;
    }

    if (action === "stop") {
      return NextResponse.json({ status: "disconnected" });
    }

    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
