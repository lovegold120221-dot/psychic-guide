import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
  try {
    const { userId, userName } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.STREAM_API_KEY;
    const secretKey = process.env.STREAM_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: "Stream API keys not configured" },
        { status: 500 }
      );
    }

    const serverClient = StreamChat.getInstance(apiKey, secretKey);

    // Upsert user (create or update)
    await serverClient.upsertUser({
      id: userId,
      name: userName || userId,
      role: "user",
    });

    // Generate a user token valid for 24 hours
    const token = serverClient.createToken(userId);

    return NextResponse.json({ token, userId });
  } catch (error: any) {
    console.error("Stream token error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
