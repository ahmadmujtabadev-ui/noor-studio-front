// src/components/book/BookPreview3D.tsx
// CSS-only 3D book mockup — no Three.js, no WebGL.
// Uses CSS perspective + transform-style:preserve-3d to render a rotating book.
// Immune to WebGL crashes, works in all environments.

import React, { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookPreviewProps } from "@/types/cover.types";

// ─── CSS 3D Book ──────────────────────────────────────────────────────────────

interface CssBookProps {
  frontUrl: string | null;
  spineUrl: string | null;
  backUrl: string | null;
  bookWidth: number;
  bookHeight: number;
  spineWidth: number;
}

function CssBook({ frontUrl, spineUrl, backUrl, bookWidth, bookHeight, spineWidth }: CssBookProps) {
  // Normalise to viewport: book height = 240px
  const BASE_H = 240;
  const scale  = BASE_H / bookHeight;
  const W  = Math.round(bookWidth  * scale);
  const H  = BASE_H;
  const SW = Math.round(spineWidth * scale);

  // Drag-to-rotate
  const [rotY, setRotY] = useState(-25);
  const [rotX, setRotX] = useState(8);
  const dragging = useRef(false);
  const last     = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setRotY((r) => Math.max(-60, Math.min(60, r + dx * 0.5)));
    setRotX((r) => Math.max(-20, Math.min(20, r - dy * 0.3)));
  };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragging.current = true;
    last.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const t = e.touches[0];
    const dx = t.clientX - last.current.x;
    const dy = t.clientY - last.current.y;
    last.current = { x: t.clientX, y: t.clientY };
    setRotY((r) => Math.max(-60, Math.min(60, r + dx * 0.5)));
    setRotX((r) => Math.max(-20, Math.min(20, r - dy * 0.3)));
  };
  const onTouchEnd = () => { dragging.current = false; };

  const faceBase: React.CSSProperties = {
    position: "absolute",
    overflow: "hidden",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <div
      className="select-none cursor-grab active:cursor-grabbing"
      style={{ width: W + SW, height: H, perspective: 900, perspectiveOrigin: "50% 40%" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Book group */}
      <div
        style={{
          position: "relative",
          width: W + SW,
          height: H,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: dragging.current ? "none" : "transform 0.1s ease-out",
          marginLeft: SW / 2,
        }}
      >
        {/* FRONT face (+Z) */}
        <div style={{
          ...faceBase,
          width: W, height: H,
          left: 0, top: 0,
          transform: `translateZ(${SW / 2}px)`,
          background: frontUrl ? "transparent" : "#2a5f8a",
          boxShadow: "4px 4px 20px rgba(0,0,0,0.4)",
        }}>
          {frontUrl
            ? <img src={frontUrl} alt="Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon style={{ width: 28, height: 28, color: "rgba(255,255,255,0.3)" }} />
              </div>
          }
        </div>

        {/* SPINE face (left side, -X rotated) */}
        <div style={{
          ...faceBase,
          width: SW, height: H,
          left: -SW, top: 0,
          transform: `rotateY(-90deg) translateZ(0px)`,
          transformOrigin: "right center",
          background: spineUrl ? "transparent" : "#c8a96a",
          boxShadow: "-3px 0 12px rgba(0,0,0,0.3)",
        }}>
          {spineUrl
            ? <img src={spineUrl} alt="Spine" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
            : <div style={{ width: "100%", height: "100%", background: "#c8a96a" }} />
          }
        </div>

        {/* BACK face (-Z) */}
        <div style={{
          ...faceBase,
          width: W, height: H,
          left: 0, top: 0,
          transform: `translateZ(-${SW / 2}px) rotateY(180deg)`,
          background: backUrl ? "transparent" : "#1e4a6e",
        }}>
          {backUrl
            ? <img src={backUrl} alt="Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
            : <div style={{ width: "100%", height: "100%", background: "#1e4a6e" }} />
          }
        </div>

        {/* TOP edge */}
        <div style={{
          ...faceBase,
          width: W, height: SW,
          left: 0, top: 0,
          transform: `rotateX(90deg) translateZ(-${SW / 2}px)`,
          background: "#f0e8d8",
        }} />

        {/* BOTTOM edge */}
        <div style={{
          ...faceBase,
          width: W, height: SW,
          left: 0, bottom: 0,
          transform: `rotateX(-90deg) translateZ(-${SW / 2}px)`,
          background: "#e8dfd0",
        }} />

        {/* PAGE EDGES — right side (stacked pages look) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            ...faceBase,
            width: SW * 0.85,
            height: H - 2,
            right: -SW * 0.85,
            top: 1,
            transform: `translateZ(${(SW / 2) - (i * SW * 0.14)}px)`,
            background: i === 0
              ? "linear-gradient(to right, #ddd8cc, #f0e8d8)"
              : `rgba(240, 232, 216, ${0.9 - i * 0.1})`,
            borderLeft: "1px solid rgba(0,0,0,0.06)",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── BookPreview3D (exported) ─────────────────────────────────────────────────

export function BookPreview3D({
  frontUrl,
  spineUrl,
  backUrl,
  bookWidth  = 6,
  bookHeight = 9,
  spineWidth = 0.5,
  className  = "",
}: BookPreviewProps) {
  const hasAny = Boolean(frontUrl || spineUrl || backUrl);

  return (
    <div className={cn(
      "relative w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center py-8 gap-4",
      "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      className,
    )} style={{ minHeight: 320 }}>

      {/* Ambient glow beneath book */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-2xl bg-white/10 pointer-events-none" />

      {hasAny ? (
        <CssBook
          frontUrl={frontUrl}
          spineUrl={spineUrl}
          backUrl={backUrl}
          bookWidth={bookWidth}
          bookHeight={bookHeight}
          spineWidth={spineWidth}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500 select-none">
          <ImageIcon className="w-8 h-8" />
          <p className="text-xs">No covers generated yet</p>
        </div>
      )}

      {/* Hint */}
      {hasAny && (
        <p className="text-[10px] text-white/30 select-none">Drag to rotate</p>
      )}
    </div>
  );
}
