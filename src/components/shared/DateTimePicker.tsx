"use client";

interface DateTimePickerProps {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (d: string) => void;
  onStartTimeChange: (t: string) => void;
  onEndTimeChange: (t: string) => void;
  errors?: { date?: string; startTime?: string; endTime?: string };
  compact?: boolean;
}

export default function DateTimePicker({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  errors = {},
  compact = false,
}: DateTimePickerProps) {
  // Generate time options in 30-min increments
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const min = m.toString().padStart(2, "0");
      timeOptions.push(`${hour}:${min}`);
    }
  }

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-orbit-darker border rounded-xl px-4 py-3 text-sm text-white transition-all duration-200 outline-none appearance-none cursor-pointer ${
      hasError
        ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        : "border-zinc-700/50 focus:border-orbit-blue focus:ring-2 focus:ring-orbit-blue/20 hover:border-zinc-600"
    }`;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {/* Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={inputClass(!!errors.date)}
        />
        {errors.date && (
          <p className="text-[11px] text-red-400 font-medium animate-fade-in">
            {errors.date}
          </p>
        )}
      </div>

      {/* Time row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Start Time
          </label>
          <select
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={inputClass(!!errors.startTime)}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t} className="bg-orbit-panel text-white">
                {formatTime(t)}
              </option>
            ))}
          </select>
          {errors.startTime && (
            <p className="text-[11px] text-red-400 font-medium animate-fade-in">
              {errors.startTime}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            End Time
          </label>
          <select
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={inputClass(!!errors.endTime)}
          >
            {timeOptions
              .filter((t) => t > startTime)
              .map((t) => (
                <option key={t} value={t} className="bg-orbit-panel text-white">
                  {formatTime(t)}
                </option>
              ))}
          </select>
          {errors.endTime && (
            <p className="text-[11px] text-red-400 font-medium animate-fade-in">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Duration preview */}
      {startTime && endTime && endTime > startTime && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-orbit-card/50 rounded-xl border border-white/[0.04] animate-fade-in">
          <svg
            className="w-4 h-4 text-orbit-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs text-zinc-400">
            Duration:{" "}
            <span className="text-white font-semibold">
              {(() => {
                const [sh, sm] = startTime.split(":").map(Number);
                const [eh, em] = endTime.split(":").map(Number);
                const mins = eh * 60 + em - (sh * 60 + sm);
                if (mins >= 60) {
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  return m > 0 ? `${h}h ${m}m` : `${h}h`;
                }
                return `${mins}m`;
              })()}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
