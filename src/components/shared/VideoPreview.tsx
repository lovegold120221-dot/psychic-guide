"use client";

import { useRef, useEffect, useState } from "react";
import InitialAvatar from "./InitialAvatar";

interface VideoPreviewProps {
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  compact?: boolean;
  userName?: string;
}

export default function VideoPreview({
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMic,
  compact = false,
  userName = "You",
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionDenied, setPermissionDenied] = useState(false);

  // Start/stop camera when toggle changes
  useEffect(() => {
    if (cameraOn) {
      setPermissionDenied(false);
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
            setPermissionDenied(true);
          }
          onToggleCamera();
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOn]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-orbit-darker border border-zinc-700/30 group">
      <div className="relative aspect-video bg-gradient-to-br from-orbit-panel via-orbit-darker to-orbit-panel">
        {cameraOn && !permissionDenied ? (
          <>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">REC</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {permissionDenied ? (
              <div className="text-center px-4">
                <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-xs text-zinc-400">Camera blocked</p>
                <p className="text-[10px] text-zinc-600 mt-1">Allow camera in browser settings</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <InitialAvatar name={userName} size={compact ? 56 : 72} />
                <span className="text-xs text-zinc-500 font-medium">Camera is off</span>
              </div>
            )}
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
