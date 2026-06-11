"use client";

interface VideoPreviewProps {
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  compact?: boolean;
  userName?: string;
  userAvatar?: string;
}

export default function VideoPreview({
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMic,
  compact = false,
  userName = "You",
  userAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
}: VideoPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-orbit-darker border border-zinc-700/30 group">
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-orbit-panel via-orbit-darker to-orbit-panel ${
          compact ? "h-36 sm:h-44" : "h-48 sm:h-64"
        }`}
      >
        {cameraOn ? (
          <>
            <img
              src={userAvatar}
              alt="Camera preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">REC</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-zinc-700/50 shadow-2xl">
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">Camera is off</span>
          </div>
        )}

        {!micOn && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full p-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="#ef4444" />
            </svg>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-center gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <button
          onClick={onToggleMic}
          className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
            micOn ? "bg-zinc-700/80 hover:bg-zinc-600 text-white" : "bg-red-500/80 hover:bg-red-500 text-white"
          }`}
          aria-label={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} stroke="currentColor" />
            </svg>
          )}
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
            cameraOn ? "bg-zinc-700/80 hover:bg-zinc-600 text-white" : "bg-red-500/80 hover:bg-red-500 text-white"
          }`}
          aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
