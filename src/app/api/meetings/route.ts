import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── GET /api/meetings — list meetings for the authenticated user ──
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ meetings: data || [] });
  } catch (err: any) {
    console.error("GET /api/meetings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST /api/meetings — create a meeting ──────────────────────
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { meeting_id, title, description, passcode, meeting_date, start_time, end_time } = body;

    if (!meeting_id || !title) {
      return NextResponse.json({ error: "meeting_id and title are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("meetings")
      .insert({
        meeting_id,
        title,
        description: description || "",
        host_id: user.id,
        passcode: passcode || "",
        meeting_date: meeting_date || null,
        start_time: start_time || null,
        end_time: end_time || null,
        call_id: meeting_id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/meetings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── PATCH /api/meetings — update a meeting ─────────────────────
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { meeting_id, ...updates } = body;

    if (!meeting_id) {
      return NextResponse.json({ error: "meeting_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("meetings")
      .update(updates)
      .eq("meeting_id", meeting_id)
      .eq("host_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ meeting: data });
  } catch (err: any) {
    console.error("PATCH /api/meetings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE /api/meetings — delete a meeting ────────────────────
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meeting_id");

    if (!meetingId) {
      return NextResponse.json({ error: "meeting_id query param is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("meeting_id", meetingId)
      .eq("host_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/meetings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
