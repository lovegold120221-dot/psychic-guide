"use client";

import Link from "next/link";
import { UPCOMING_MEETINGS } from "@/lib/constants";

export default function UpcomingMeetings() {
  return (
    <div className="orbit-card rounded-2xl flex-1 border border-zinc-700/50 p-5 sm:p-6 shadow-lg min-h-[250px]">
      <h2 className="text-white font-semibold mb-5 flex justify-between items-center">
        <span className="text-sm sm:text-base">Upcoming Meetings</span>
        <Link
          href="/schedule"
          className="text-orbit-blue text-xs font-medium hover:underline transition"
        >
          Schedule
        </Link>
      </h2>

      <div className="space-y-3">
        {UPCOMING_MEETINGS.map((meeting) => (
          <div
            key={meeting.id}
            className="orbit-card-hover p-4 rounded-xl border border-zinc-700/50 cursor-pointer transition animate-fade-in group"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm mb-1 text-white truncate">
                  {meeting.title}
                </div>
                <div className="text-xs text-orbit-text-dim">
                  {meeting.time}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <code className="text-[11px] text-zinc-500 font-mono bg-orbit-darker/50 px-2 py-0.5 rounded">
                    ID: {meeting.meetingId}
                  </code>
                  {meeting.password && (
                    <span className="text-[11px] text-amber-500/80 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Passcode
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/join?mid=${meeting.meetingId.replace(/-/g, "")}`}
                  className="text-xs font-medium text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  Join
                </Link>
                <Link
                  href="/meeting"
                  className="bg-orbit-blue hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-md shadow-blue-500/20 whitespace-nowrap group-hover:shadow-blue-500/30"
                >
                  Start
                </Link>
              </div>
            </div>
          </div>
        ))}

        {UPCOMING_MEETINGS.length === 0 && (
          <div className="text-center py-10">
            <svg
              className="w-10 h-10 text-zinc-700 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-zinc-500 text-sm">
              No upcoming meetings today
            </p>
            <Link
              href="/schedule"
              className="inline-block mt-3 text-xs font-medium text-orbit-blue hover:underline"
            >
              Schedule one now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
