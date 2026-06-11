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

export const DURATION_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
] as const;
