export interface Participant {
  id: string;
  name: string;
  img: string;
  muted: boolean;
  active: boolean;
  hasVideo: boolean;
}

export type LayoutMode = "2-speaker" | "3-gallery" | "4-gallery" | "18-gallery";

export const LAYOUT_OPTIONS: { value: LayoutMode; label: string }[] = [
  { value: "2-speaker", label: "2 Participants" },
  { value: "3-gallery", label: "3 Participants" },
  { value: "4-gallery", label: "4 Participants" },
  { value: "18-gallery", label: "18 Participants" },
];

export const REACTIONS = ["👏", "👍", "❤️", "😂", "🎉"] as const;

export interface Meeting {
  id: string;
  title: string;
  time: string;
  startTime: string;
  endTime: string;
  meetingId: string;
  date: string;
  password?: string;
}

export const UPCOMING_MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Daily Standup — Engineering",
    time: "11:00 AM – 11:30 AM",
    startTime: "11:00",
    endTime: "11:30",
    meetingId: "834-291-556",
    date: "2026-06-11",
  },
  {
    id: "2",
    title: "Weekly Orbit Sync",
    time: "2:00 PM – 3:00 PM",
    startTime: "14:00",
    endTime: "15:00",
    meetingId: "412-778-903",
    date: "2026-06-11",
    password: "orbit2026",
  },
  {
    id: "3",
    title: "Design Review — Mobile App",
    time: "4:00 PM – 5:00 PM",
    startTime: "16:00",
    endTime: "17:00",
    meetingId: "567-123-890",
    date: "2026-06-11",
  },
];

export const DURATION_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
] as const;
