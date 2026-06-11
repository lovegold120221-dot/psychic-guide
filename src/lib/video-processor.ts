/**
 * Orbit Video Processor — virtual backgrounds, studio touch, mirror
 *
 * Captures camera frames → applies effects → outputs processed MediaStream.
 */

export type BackgroundMode = "none" | "blur" | "image";
export type BackgroundImage = "abstract-1" | "abstract-2" | "office" | "nature" | "city" | "beach";

const BG_IMAGES: Record<BackgroundImage, string> = {
  "abstract-1": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "abstract-2": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "office": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "nature": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "city": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "beach": "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
};

export function getBgStyle(bg: BackgroundImage): string {
  return BG_IMAGES[bg] || BG_IMAGES["abstract-1"];
}

export interface VideoProcessorSettings {
  mirror: boolean;
  backgroundMode: BackgroundMode;
  backgroundImage: BackgroundImage;
  studioTouch: number; // 0-100 intensity
  blurRadius: number;
}

const DEFAULT_SETTINGS: VideoProcessorSettings = {
  mirror: false,
  backgroundMode: "none",
  backgroundImage: "abstract-1",
  studioTouch: 0,
  blurRadius: 15,
};

// ─── Store settings in sessionStorage ──────────────────────────
const STORAGE_KEY = "orbit-video-settings";

export function loadSettings(): VideoProcessorSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: VideoProcessorSettings) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// ─── Video Processing Pipeline ─────────────────────────────────
// Uses offscreen canvas to process camera frames.
// Returns a processed MediaStream that can be fed to Stream Video.

export function createProcessedStream(
  inputStream: MediaStream,
  settings: VideoProcessorSettings
): { outputStream: MediaStream; cleanup: () => void } {
  const video = document.createElement("video");
  video.srcObject = inputStream;
  video.playsInline = true;
  video.muted = true;
  video.play();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const width = 640;
  const height = 480;
  canvas.width = width;
  canvas.height = height;

  // Offscreen canvas for beautify
  const beautyCanvas = document.createElement("canvas");
  beautyCanvas.width = width;
  beautyCanvas.height = height;
  const beautyCtx = beautyCanvas.getContext("2d")!;

  let running = true;
  let animId: number;

  function processFrame() {
    if (!running) return;
    animId = requestAnimationFrame(processFrame);

    if (video.readyState < 2) return;

    // Mirror
    if (settings.mirror) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    // Background
    if (settings.backgroundMode === "blur") {
      ctx.filter = `blur(${settings.blurRadius}px)`;
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.filter = "none";
      // Redraw person on top (simple center cutout approximation)
      ctx.drawImage(video, settings.mirror ? width : 0, 0, settings.mirror ? -width : width, height);
    } else if (settings.backgroundMode === "image") {
      // Fill with gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, BG_IMAGES[settings.backgroundImage].match(/#([a-f0-9]{6})/i)?.[1] ? `#${BG_IMAGES[settings.backgroundImage].match(/#([a-f0-9]{6})/i)![1]}` : "#667eea");
      grad.addColorStop(1, "#764ba2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      // Overlay person
      ctx.drawImage(video, settings.mirror ? width : 0, 0, settings.mirror ? -width : width, height);
    }

    // Studio Touch (beautify) — light smoothing
    if (settings.studioTouch > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      applyStudioTouch(imageData, settings.studioTouch);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  processFrame();

  const outputStream = canvas.captureStream(30);
  // Add audio tracks from original
  inputStream.getAudioTracks().forEach((t) => outputStream.addTrack(t));

  return {
    outputStream,
    cleanup: () => {
      running = false;
      cancelAnimationFrame(animId);
      video.pause();
      video.srcObject = null;
      inputStream.getTracks().forEach((t) => t.stop());
    },
  };
}

// ─── Studio Touch / Beautify algorithm ─────────────────────────
// Lightweight skin-smoothing via selective gaussian-like blur
// on higher-luminance areas (face tones).

function applyStudioTouch(imageData: ImageData, intensity: number) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const amount = intensity / 100; // 0-1

  if (amount <= 0) return;

  // Simple smoothing: average each pixel with its neighbors
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      // Check if this is a skin-tone pixel (warm, not too dark/bright)
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];
      const isSkin = r > 60 && g > 30 && b > 20 && r > g && r > b && (r - g) > 10;

      if (isSkin) {
        // 3x3 box blur weighted by intensity
        let rr = 0, gg = 0, bb = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ni = ((y + dy) * w + (x + dx)) * 4;
            rr += copy[ni];
            gg += copy[ni + 1];
            bb += copy[ni + 2];
            count++;
          }
        }
        const blend = amount * 0.5;
        data[idx] = r + (rr / count - r) * blend;
        data[idx + 1] = g + (gg / count - g) * blend;
        data[idx + 2] = b + (bb / count - b) * blend;
      }
    }
  }
}

// ─── Device listing ────────────────────────────────────────────

export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  } catch {
    return [];
  }
}

export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audioinput");
  } catch {
    return [];
  }
}

export async function getAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audiooutput");
  } catch {
    return [];
  }
}
