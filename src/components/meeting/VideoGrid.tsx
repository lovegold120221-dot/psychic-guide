"use client";

import type { LayoutMode, Participant } from "@/lib/constants";
import VideoCell from "./VideoCell";

interface VideoGridProps {
  layoutMode: LayoutMode;
  participants: Participant[];
  localMicMuted: boolean;
  localCamOn: boolean;
  localUserId?: string;
}

export default function VideoGrid({
  layoutMode,
  participants,
  localMicMuted,
  localCamOn,
  localUserId = "",
}: VideoGridProps) {

  if (layoutMode === "2-speaker") {
    const first = participants[0];
    const second = participants[1];
    return (
      <div className="w-full h-full p-2 flex flex-col sm:flex-row items-center justify-center gap-1">
        <VideoCell
          participant={first}
          isLocal={first.id === localUserId}
          localMicMuted={localMicMuted}
          localCamOn={localCamOn}
          className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]"
          isActiveSpeaker={first.active}
        />
        <VideoCell
          participant={second}
          isLocal={second.id === localUserId}
          localMicMuted={localMicMuted}
          localCamOn={localCamOn}
          className="w-full sm:w-1/2 h-1/2 sm:h-full max-h-[85vh]"
          isActiveSpeaker={second.active}
        />
      </div>
    );
  }

  if (layoutMode === "3-gallery") {
    return (
      <div className="w-full h-full p-2 flex flex-col gap-1 max-w-5xl mx-auto">
        <div className="flex w-full h-1/2 gap-1 justify-center">
          <VideoCell
            participant={participants[0]}
            isLocal={participants[0].id === localUserId}
            localMicMuted={localMicMuted}
            localCamOn={localCamOn}
            className="w-1/2 h-full"
          />
          <VideoCell
            participant={participants[2]}
            isLocal={participants[2].id === localUserId}
            localMicMuted={localMicMuted}
            localCamOn={localCamOn}
            className="w-1/2 h-full"
          />
        </div>
        <div className="flex w-full h-1/2 gap-1 justify-center">
        <VideoCell
          participant={participants[1]}
          isLocal={participants[1].id === localUserId}
          localMicMuted={localMicMuted}
          localCamOn={localCamOn}
          className="w-1/2 h-full"
        />
        </div>
      </div>
    );
  }

  if (layoutMode === "4-gallery") {
    return (
      <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-2 gap-1 max-w-5xl mx-auto max-h-[90vh]">
        {participants.slice(0, 4).map((p) => (
          <VideoCell
            key={p.id}
            participant={p}
            isLocal={p.id === localUserId}
            localMicMuted={localMicMuted}
            localCamOn={localCamOn}
            className="w-full h-full"
          />
        ))}
      </div>
    );
  }

  // 18-gallery (default)
  return (
    <div className="w-full h-full p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-fr gap-1 overflow-y-auto content-start">
      {participants.map((p) => (
        <VideoCell
          key={p.id}
          participant={p}
          isLocal={p.id === localUserId}
          localMicMuted={localMicMuted}
          localCamOn={localCamOn}
          className="w-full aspect-video"
        />
      ))}
    </div>
  );
}
