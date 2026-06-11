"use client";

interface SecurityPanelProps {
  onClose: () => void;
  isHost: boolean;
}

export default function SecurityPanel({ onClose, isHost }: SecurityPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-orbit-panel/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <h2 className="text-lg font-bold text-white">Security</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orbit-darker rounded-xl">
            <svg className="w-5 h-5 text-orbit-green mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#3dbb61" />
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-white">End-to-end encrypted</p>
              <p className="text-xs text-zinc-400 mt-1">All video, audio, and messages are encrypted end-to-end. No third party can access your meeting data.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-orbit-darker rounded-xl">
            <span className="text-sm text-zinc-300">Meeting ID</span>
            <span className="text-xs text-zinc-500 font-mono">orbit-main-room</span>
          </div>

          {isHost && (
            <div className="flex items-center justify-between p-3 bg-orbit-darker rounded-xl">
              <span className="text-sm text-zinc-300">Role</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">HOST</span>
            </div>
          )}

          <div className="pt-2 text-[11px] text-zinc-500 leading-relaxed">
            Participants can join by sharing the meeting link. Only the host can remove participants or lock the meeting.
          </div>
        </div>
      </div>
    </div>
  );
}
