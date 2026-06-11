"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface WhiteboardProps {
  isHost: boolean;
  onClose: () => void;
}

type Tool = "pen" | "eraser";

const COLORS = [
  { value: "#ffffff", class: "bg-[#ffffff]" },
  { value: "#ff3b30", class: "bg-[#ff3b30]" },
  { value: "#ff9500", class: "bg-[#ff9500]" },
  { value: "#ffcc00", class: "bg-[#ffcc00]" },
  { value: "#34c759", class: "bg-[#34c759]" },
  { value: "#5ac8fa", class: "bg-[#5ac8fa]" },
  { value: "#007aff", class: "bg-[#007aff]" },
  { value: "#5856d6", class: "bg-[#5856d6]" },
  { value: "#af52de", class: "bg-[#af52de]" },
  { value: "#ff2d55", class: "bg-[#ff2d55]" }
];
const SIZES = [
  { value: 2, class: "w-[6px] h-[6px]" },
  { value: 4, class: "w-[8px] h-[8px]" },
  { value: 6, class: "w-[12px] h-[12px]" },
  { value: 10, class: "w-[20px] h-[20px]" },
  { value: 16, class: "w-[32px] h-[32px]" }
];

export default function Whiteboard({ isHost, onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(4);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Get canvas coordinates from mouse/touch event
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas || !lastPos.current) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#1a1a1a" : color;
    ctx.lineWidth = tool === "eraser" ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }, [isDrawing, getPos, tool, color, size]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Fill on first render
  useEffect(() => { clearCanvas(); }, [clearCanvas]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-orbit-darker">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-orbit-panel/90 backdrop-blur border-b border-white/[0.04] overflow-x-auto scrollbar-none shrink-0">
        {/* Tools */}
        <ToolBtn active={tool === "pen"} onClick={() => setTool("pen")} label="Pen">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </ToolBtn>
        <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")} label="Erase">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 20H8l-4-4 9-9 7 7-4 4z" />
          </svg>
        </ToolBtn>

        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Colors */}
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => { setTool("pen"); setColor(c.value); }}
            className={`w-5 h-5 rounded-full border-2 transition-all active:scale-90 ${color === c.value ? "border-white scale-110" : "border-transparent"} ${c.class}`}
            aria-label={c.value}
          />
        ))}

        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Sizes */}
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => setSize(s.value)}
            className={`rounded-full bg-white transition-all active:scale-90 ${size === s.value ? "opacity-100 ring-2 ring-white ring-offset-1 ring-offset-orbit-panel" : "opacity-40 hover:opacity-70"} ${s.class}`}
            aria-label={`Size ${s.value}`}
          />
        ))}

        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Clear */}
        <button onClick={clearCanvas} className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition active:scale-90 font-medium">
          Clear
        </button>

        {/* Close */}
        <button onClick={onClose} className="text-[11px] text-orbit-blue hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition active:scale-90 font-medium ml-auto">
          {isHost ? "Back to Meeting" : "Close"}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!isHost && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <p className="text-sm text-zinc-400">Only the host can draw on the whiteboard</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ children, active, onClick, label }: { children: React.ReactNode; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all active:scale-90 ${active ? "bg-orbit-blue/20 text-orbit-blue" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
