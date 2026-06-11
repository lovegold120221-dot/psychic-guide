"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import TitleBar from "@/components/ui/TitleBar";
import Sidebar from "@/components/ui/Sidebar";
import ActionButton from "@/components/dashboard/ActionButton";
import Clock from "@/components/dashboard/Clock";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import CreateMeetingModal from "@/components/dashboard/CreateMeetingModal";

interface MeetingData {
  id: string;
  meeting_id: string;
  title: string;
  time: string;
  startTime: string;
  endTime: string;
  date: string;
  password?: string;
}

export default function DashboardClient() {
  const { user, signOut } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meetings")
      .then((res) => res.ok ? res.json() : { meetings: [] })
      .then((data) => {
        const mapped: MeetingData[] = (data.meetings || []).map((m: any) => ({
          id: m.id,
          meeting_id: m.meeting_id,
          title: m.title,
          time: m.start_time && m.end_time
            ? `${m.start_time.slice(0, 5)} – ${m.end_time.slice(0, 5)}`
            : "Anytime",
          startTime: m.start_time || "",
          endTime: m.end_time || "",
          date: m.meeting_date || "",
          password: m.passcode || undefined,
        }));
        setMeetings(mapped);
      })
      .catch(() => {})
      .finally(() => setMeetingsLoading(false));
  }, []);

  return (
    <>
      <TitleBar title="Orbit Workspace" />

      <div className="flex-1 w-full h-full flex overflow-hidden">
        <Sidebar user={user} onSignOut={signOut} />

        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                {user?.email}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left: Action Buttons */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-[440px] shrink-0 h-fit">
                <ActionButton
                  href="#"
                  label="New Meeting"
                  color="orange"
                  onClick={() => setCreateModalOpen(true)}
                  icon={
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <ActionButton
                  href="/join"
                  label="Join"
                  color="blue"
                  icon={
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />

                <ActionButton
                  href="/schedule"
                  label="Schedule"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <ActionButton
                  href="/meeting"
                  label="Share Screen"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                />
              </div>

              {/* Right */}
              <div className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0">
                <Clock />
                <UpcomingMeetings meetings={meetings} loading={meetingsLoading} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateMeetingModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </>
  );
}
