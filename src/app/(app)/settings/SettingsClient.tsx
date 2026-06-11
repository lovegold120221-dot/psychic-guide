"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import TitleBar from "@/components/ui/TitleBar";
import Sidebar from "@/components/ui/Sidebar";
import {
  loadSettings, saveSettings,
  getVideoDevices, getAudioInputDevices, getAudioOutputDevices,
  getBgStyle,
  createProcessedStream,
  type BackgroundMode, type BackgroundImage, type VideoProcessorSettings,
} from "@/lib/video-processor";

type Tab = "video" | "audio" | "background" | "general";

const BG_IMAGES: { key: BackgroundImage; label: string }[] = [
  { key: "abstract-1", label: "Purple Haze" },
  { key: "abstract-2", label: "Sunset" },
  { key: "office", label: "Ocean" },
  { key: "nature", label: "Forest" },
  { key: "city", label: "Warm Glow" },
  { key: "beach", label: "Lavender" },
];

export default function SettingsClient() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("video");
  const [settings, setSettings] = useState<VideoProcessorSettings>(loadSettings);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  // Test tone state
  const [testTonePlaying, setTestTonePlaying] = useState(false);

  useEffect(() => {
    getVideoDevices().then((d) => {
      setCameras(d);
      if (d.length > 0 && !selectedCam) setSelectedCam(d[0].deviceId);
    });
    getAudioInputDevices().then((d) => {
      setMics(d);
      if (d.length > 0 && !selectedMic) setSelectedMic(d[0].deviceId);
    });
    getAudioOutputDevices().then((d) => {
      setSpeakers(d);
      if (d.length > 0 && !selectedSpeaker) setSelectedSpeaker(d[0].deviceId);
    });
  }, []);

  const update = useCallback((partial: Partial<VideoProcessorSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const testMic = useCallback(async () => {
    if (testTonePlaying) return;
    setTestTonePlaying(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
      });
      const audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);

      // Create analyser for visual feedback
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Play for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      src.disconnect();
      await audioCtx.close();
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error("Mic test failed:", err);
    }
    setTestTonePlaying(false);
  }, [selectedMic, testTonePlaying]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "video", label: "Video" },
    { key: "audio", label: "Audio" },
    { key: "background", label: "Background" },
    { key: "general", label: "General" },
  ];

  return (
    <>
      <TitleBar title="Settings" />
      <div className="flex-1 w-full h-full flex overflow-hidden">
        <Sidebar user={user} onSignOut={signOut} />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Settings</h1>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap ${
                    tab === t.key ? "text-orbit-blue border-orbit-blue" : "text-zinc-400 border-transparent hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ─── Video Tab ─────────────────────────────────── */}
            {tab === "video" && (
              <div className="space-y-6">
                <LivePreview settings={settings} selectedCam={selectedCam} />

                <Section title="Camera">
                  <SelectField
                    label="Camera"
                    value={selectedCam}
                    onChange={setSelectedCam}
                    options={cameras.map((c) => ({ value: c.deviceId, label: c.label || `Camera ${c.deviceId.slice(0, 8)}` }))}
                  />
                  <ToggleField
                    label="Mirror my video"
                    desc="Flips your video horizontally"
                    enabled={settings.mirror}
                    onChange={(v) => update({ mirror: v })}
                  />
                </Section>

                <Section title="Studio Touch">
                  <ToggleField
                    label="Studio Touch"
                    desc="Beautify your video with skin smoothing"
                    enabled={settings.studioTouch > 0}
                    onChange={(v) => update({ studioTouch: v ? 50 : 0 })}
                  />
                  {settings.studioTouch > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400">Intensity</label>
                      <input
                        type="range"
                        min={0} max={100}
                        value={settings.studioTouch}
                        onChange={(e) => update({ studioTouch: parseInt(e.target.value) })}
                        title="Studio Touch Intensity"
                        aria-label="Studio Touch Intensity"
                        className="w-full accent-orbit-blue"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Light</span>
                        <span>{settings.studioTouch}%</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  )}
                </Section>
              </div>
            )}

            {/* ─── Audio Tab ─────────────────────────────────── */}
            {tab === "audio" && (
              <div className="space-y-6">
                <Section title="Microphone">
                  <SelectField
                    label="Microphone"
                    value={selectedMic}
                    onChange={setSelectedMic}
                    options={mics.map((m) => ({ value: m.deviceId, label: m.label || `Mic ${m.deviceId.slice(0, 8)}` }))}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={testMic}
                      disabled={testTonePlaying}
                      className="px-4 py-2.5 bg-orbit-blue/20 hover:bg-orbit-blue/30 text-orbit-blue text-xs font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {testTonePlaying ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-orbit-green animate-pulse" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                          Test Speaker & Mic
                        </>
                      )}
                    </button>
                    {testTonePlaying && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-4 bg-orbit-green rounded-full animate-pulse" />
                        <span className="w-1.5 h-6 bg-orbit-green rounded-full animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-3 bg-orbit-green/50 rounded-full animate-pulse [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Speaker">
                  <SelectField
                    label="Speaker"
                    value={selectedSpeaker}
                    onChange={setSelectedSpeaker}
                    options={speakers.map((s) => ({ value: s.deviceId, label: s.label || `Speaker ${s.deviceId.slice(0, 8)}` }))}
                  />
                </Section>
              </div>
            )}

            {/* ─── Background Tab ────────────────────────────── */}
            {tab === "background" && (
              <div className="space-y-6">
                <LivePreview settings={settings} selectedCam={selectedCam} compact />

                <Section title="Virtual Background">
                  <div className="space-y-2">
                    {([{ mode: "none", label: "None" }, { mode: "blur", label: "Blur" }, { mode: "image", label: "Image" }] as { mode: BackgroundMode; label: string }[]).map((opt) => (
                      <button
                        key={opt.mode}
                        onClick={() => update({ backgroundMode: opt.mode })}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                          settings.backgroundMode === opt.mode
                            ? "bg-orbit-blue/20 text-orbit-blue border border-orbit-blue/30"
                            : "bg-orbit-darker text-zinc-300 border border-white/[0.04] hover:bg-orbit-card"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Section>

                {settings.backgroundMode === "blur" && (
                  <Section title="Blur Intensity">
                    <input
                      type="range" min={5} max={30}
                      value={settings.blurRadius}
                      onChange={(e) => update({ blurRadius: parseInt(e.target.value) })}
                      title="Blur Radius"
                      aria-label="Blur Radius"
                      className="w-full accent-orbit-blue"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>Subtle</span>
                      <span>{settings.blurRadius}px</span>
                      <span>Strong</span>
                    </div>
                  </Section>
                )}

                {settings.backgroundMode === "image" && (
                  <Section title="Background Image">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BG_IMAGES.map((bg) => (
                        <button
                          key={bg.key}
                          onClick={() => update({ backgroundImage: bg.key })}
                          className={`aspect-video rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${
                            settings.backgroundImage === bg.key ? "border-orbit-blue scale-[1.02]" : "border-transparent"
                          }`}
                        >
                          <div className="w-full h-full" style={{ background: getBgStyle(bg.key) }} />
                          <div className="p-1.5 text-[10px] text-zinc-400 font-medium text-center bg-orbit-darker">
                            {bg.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {/* ─── General Tab ───────────────────────────────── */}
            {tab === "general" && (
              <div className="space-y-6">
                <Section title="Display">
                  <ToggleField label="Keep controls visible" desc="Always show meeting controls" enabled={false} onChange={() => {}} />
                  <ToggleField label="HD video" desc="Prioritize video quality" enabled={true} onChange={() => {}} />
                </Section>
                <Section title="Accessibility">
                  <ToggleField label="Closed captions" desc="Display captions during meetings" enabled={false} onChange={() => {}} />
                </Section>
                <Section title="About">
                  <div className="text-xs text-zinc-500 space-y-1">
                    <p>Orbit Meeting v1.0</p>
                    <p>Powered by Stream Video + Supabase</p>
                    <p>Built by Eburon AI</p>
                  </div>
                </Section>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Live Video Preview ────────────────────────────────────────

function LivePreview({ settings, selectedCam, compact = false }: { settings: VideoProcessorSettings; selectedCam: string; compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const startCamera = useCallback(async () => {
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCam ? { deviceId: { exact: selectedCam }, width: 640, height: 360 } : { width: 640, height: 360 },
      });
      streamRef.current = stream;

      if (!settings.mirror && settings.backgroundMode === "none" && settings.studioTouch === 0) {
        if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
        return;
      }

      const result = createProcessedStream(stream, settings);
      cleanupRef.current = result.cleanup;
      if (videoRef.current) { videoRef.current.srcObject = result.outputStream; setStreaming(true); }
    } catch (err: any) {
      console.error("Camera error:", err);
      setPermissionDenied(true);
      setStreaming(false);
    }
  }, [settings, selectedCam]);

  // Auto-start on mount if settings page opened
  useEffect(() => {
    const timeout = setTimeout(() => startCamera(), 500);
    return () => {
      clearTimeout(timeout);
      if (cleanupRef.current) cleanupRef.current();
      else if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [startCamera]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] aspect-video">
      {streaming ? (
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`absolute inset-0 w-full h-full object-cover ${settings.mirror ? "-scale-x-100" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {permissionDenied ? (
              <>
                <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-xs text-zinc-400 mb-2">Camera permission denied</p>
                <p className="text-[10px] text-zinc-600 mb-3">Allow camera access in your browser settings</p>
                <button onClick={startCamera} className="text-xs font-medium text-orbit-blue hover:underline">Try again</button>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-zinc-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-zinc-600 mb-3">Camera preview</p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-orbit-blue hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition active:scale-95"
                >
                  Enable Camera
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Effect badges */}
      {streaming && (
        <div className="absolute top-2 left-2 flex gap-1.5">
          {settings.backgroundMode !== "none" && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orbit-blue/20 text-orbit-blue border border-orbit-blue/20">
              {settings.backgroundMode === "blur" ? "Blur" : "BG"}
            </span>
          )}
          {settings.studioTouch > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/20">
              Beautify {settings.studioTouch}%
            </span>
          )}
          {settings.mirror && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-500/20 text-zinc-300 border border-zinc-500/20">
              Mirror
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleField({ label, desc, enabled, onChange }: { label: string; desc: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 bg-orbit-darker rounded-xl border border-white/[0.03] cursor-pointer hover:bg-orbit-card/50 transition gap-4">
      <div className="min-w-0">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-[11px] text-zinc-500 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); onChange(!enabled); }}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${enabled ? "bg-orbit-blue" : "bg-zinc-700"}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-zinc-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={label}
        aria-label={label}
        className="w-full bg-orbit-darker border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orbit-blue transition appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
