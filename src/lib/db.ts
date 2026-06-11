/**
 * Supabase database helpers — server-side only.
 * Uses the service_role client for admin operations.
 */
import { createAdminClient } from "./supabase/admin";

export interface MeetingRecord {
  id: string;
  meeting_id: string;
  title: string;
  description: string;
  host_id: string;
  passcode: string;
  meeting_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  is_active: boolean;
  call_id: string | null;
}

export interface CreateMeetingInput {
  meeting_id: string;
  title: string;
  description?: string;
  host_id: string;
  passcode?: string;
  meeting_date?: string;
  start_time?: string;
  end_time?: string;
  call_id?: string;
}

// ─── Queries ───────────────────────────────────────────────────

export async function getMeetingsByHost(hostId: string): Promise<MeetingRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orbit_meetings")
    .select("*")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch meetings: ${error.message}`);
  return data || [];
}

export async function getMeetingByMeetingId(meetingId: string): Promise<MeetingRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orbit_meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(`Failed to fetch meeting: ${error.message}`);
  return data;
}

export async function createMeeting(input: CreateMeetingInput): Promise<MeetingRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orbit_meetings")
    .insert({
      meeting_id: input.meeting_id,
      title: input.title,
      description: input.description || "",
      host_id: input.host_id,
      passcode: input.passcode || "",
      meeting_date: input.meeting_date || null,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      call_id: input.call_id || input.meeting_id,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create meeting: ${error.message}`);
  return data;
}

export async function updateMeeting(
  meetingId: string,
  updates: Partial<MeetingRecord>
): Promise<MeetingRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orbit_meetings")
    .update(updates)
    .eq("meeting_id", meetingId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update meeting: ${error.message}`);
  return data;
}

export async function deleteMeeting(meetingId: string, hostId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orbit_meetings")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("host_id", hostId);

  if (error) throw new Error(`Failed to delete meeting: ${error.message}`);
}

export async function getUpcomingMeetings(hostId: string): Promise<MeetingRecord[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("orbit_meetings")
    .select("*")
    .eq("host_id", hostId)
    .gte("meeting_date", today)
    .order("meeting_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(`Failed to fetch upcoming meetings: ${error.message}`);
  return data || [];
}
