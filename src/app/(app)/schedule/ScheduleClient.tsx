"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TitleBar from "@/components/ui/TitleBar";
import Sidebar from "@/components/ui/Sidebar";
import GlassCard from "@/components/shared/GlassCard";
import FormField from "@/components/shared/FormField";
import DateTimePicker from "@/components/shared/DateTimePicker";
import VideoPreview from "@/components/shared/VideoPreview";
import { useFormState, useMeetingId, useCopyToClipboard } from "@/lib/hooks";
import { DURATION_PRESETS } from "@/lib/constants";

export default function ScheduleClient() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { meetingId, regenerate } = useMeetingId();
  const { copied, copy } = useCopyToClipboard();
  const { values, errors, setValue, validate } = useFormState({
    topic: "",
    description: "",
    password: "",
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const nowHour = new Date().getHours().toString().padStart(2, "0");
  const nowMin = Math.ceil(new Date().getMinutes() / 30) * 30;
  const defaultStart = `${nowHour}:${nowMin.toString().padStart(2, "0")}`;
  const defaultEnd = (() => {
    const totalMin = parseInt(nowHour) * 60 + nowMin + 60;
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
  })();

  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [dateErrors, setDateErrors] = useState<{ date?: string; startTime?: string; endTime?: string }>({});

  const applyDuration = useCallback((mins: number) => {
    const [h, m] = startTime.split(":").map(Number);
    const total = h * 60 + m + mins;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;
    setEndTime(`${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`);
  }, [startTime]);

  const handleSchedule = useCallback(async () => {
    const formValid = validate({
      topic: (v) => {
        if (!v.trim()) return "Meeting topic is required";
        if (v.trim().length < 3) return "Topic must be at least 3 characters";
        return undefined;
      },
    });

    const dtErrors: typeof dateErrors = {};
    if (!date) dtErrors.date = "Date is required";
    if (!startTime) dtErrors.startTime = "Start time is required";
    if (!endTime) dtErrors.endTime = "End time is required";
    if (startTime && endTime && startTime >= endTime) dtErrors.endTime = "End time must be after start time";
    setDateErrors(dtErrors);

    if (!formValid || Object.keys(dtErrors).length > 0) return;

    setIsScheduling(true);
    setScheduleError("");

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: meetingId,
          title: values.topic.trim(),
          description: values.description.trim(),
          passcode: values.password.trim(),
          meeting_date: date,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to schedule meeting");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setScheduleError(err.message);
      setIsScheduling(false);
    }
  }, [validate, date, startTime, endTime, meetingId, values.topic, values.description, values.password, router]);

  return (
    <>
      <TitleBar title="Schedule Meeting" />
      <div className="flex-1 w-full h-full flex overflow-hidden">
        <Sidebar user={user} onSignOut={signOut} />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Schedule Meeting</h1>
              <p className="text-sm text-zinc-400 mt-1">Set up a meeting for later</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left: form */}
              <div className="lg:col-span-3 space-y-6">
                <GlassCard variant="elevated" className="p-5 sm:p-8 space-y-6">
                  <FormField
                    label="Meeting Topic"
                    placeholder="e.g., Weekly Sprint Planning"
                    value={values.topic}
                    onChange={(e) => setValue("topic", e.target.value)}
                    maxLength={100}
                    error={errors.topic}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Description <span className="text-zinc-600 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={values.description}
                      onChange={(e) => setValue("description", e.target.value)}
                      placeholder="Add a description or agenda..."
                      rows={3}
                      maxLength={500}
                      className="w-full bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-all duration-200 outline-none focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600 resize-none"
                    />
                  </div>

                  <DateTimePicker
                    date={date}
                    startTime={startTime}
                    endTime={endTime}
                    onDateChange={setDate}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                    errors={dateErrors}
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Quick Duration:</span>
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => applyDuration(preset.value)}
                        className="px-3 py-1.5 text-[11px] font-medium text-zinc-300 bg-orbit-card hover:bg-orbit-card-hover border border-zinc-700/30 rounded-lg transition active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Meeting ID</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white font-mono tracking-wider select-all">
                        {meetingId}
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(meetingId)}
                        className={`px-3 py-3 rounded-xl text-xs font-semibold transition active:scale-90 ${
                          copied
                            ? "bg-orbit-green/20 text-orbit-green border border-orbit-green/30"
                            : "bg-orbit-card text-zinc-400 hover:text-white border border-zinc-700/30 hover:border-zinc-600"
                        }`}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={regenerate}
                        className="px-3 py-3 rounded-xl text-xs font-semibold bg-orbit-card text-zinc-400 hover:text-white border border-zinc-700/30 hover:border-zinc-600 transition active:scale-90"
                        title="Regenerate Meeting ID"
                        aria-label="Regenerate Meeting ID"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <FormField
                    label="Passcode (optional)"
                    placeholder="Set a meeting passcode"
                    value={values.password}
                    onChange={(e) => setValue("password", e.target.value)}
                    maxLength={20}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    hint="Attendees will need this to join"
                  />

                  {scheduleError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                      {scheduleError}
                    </div>
                  )}

                  <button
                    onClick={handleSchedule}
                    disabled={isScheduling}
                    className="w-full bg-orbit-blue hover:bg-blue-500 active:bg-blue-600 disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {isScheduling ? (
                      <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Scheduling...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Schedule Meeting</>
                    )}
                  </button>
                </GlassCard>
              </div>

              {/* Right: preview + info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="sticky top-0 space-y-6">
                  <VideoPreview
                    cameraOn={cameraOn}
                    micOn={micOn}
                    onToggleCamera={() => setCameraOn((p) => !p)}
                    onToggleMic={() => setMicOn((p) => !p)}
                    compact
                    userName={userName}
                  />

                  <GlassCard variant="subtle" className="p-5 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Meeting Info</h4>
                    <div className="space-y-2 text-xs text-zinc-500">
                      <div className="flex justify-between">
                        <span>Meeting ID</span>
                        <span className="text-zinc-300 font-mono">{meetingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Host</span>
                        <span className="text-zinc-300">{userName}</span>
                      </div>
                      {date && (
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span className="text-zinc-300">{date}</span>
                        </div>
                      )}
                      {startTime && endTime && (
                        <div className="flex justify-between">
                          <span>Time</span>
                          <span className="text-zinc-300">{startTime} – {endTime}</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
