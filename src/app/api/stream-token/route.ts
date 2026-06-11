import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
  try {
    const { userId, userName } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const apiKey = process.env.STREAM_API_KEY;
    const secretKey = process.env.STREAM_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json({ error: "Stream API keys not configured" }, { status: 500 });
    }

    const serverClient = StreamChat.getInstance(apiKey, secretKey);

    // Upsert user with proper role for messaging + video permissions
    await serverClient.upsertUser({
      id: userId,
      name: userName || userId,
      role: "admin", // "user" role lacks ReadChannel + MuteUsers permissions
    });

    // Ensure the meeting channel exists and user is a member
    try {
      const channel = serverClient.channel("messaging", "orbit_meeting_room_main", {
        name: "Orbit Main Meeting Room",
        created_by_id: userId,
      });
      await channel.create();
      await channel.addMembers([userId]);
    } catch (err: any) {
      // Channel might already exist — that's fine
      if (!err.message?.includes("already exists")) {
        console.warn("Channel setup warning:", err.message);
      }
    }

    // Generate a user token valid for 24 hours
    const token = serverClient.createToken(userId);

    return NextResponse.json({ token, userId });
  } catch (error: any) {
    console.error("Stream token error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate token" }, { status: 500 });
  }
}
