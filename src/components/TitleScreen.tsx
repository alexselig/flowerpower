/* eslint-disable @next/next/no-img-element */
"use client";

import Stage from "./Stage";
import { bloomSrc } from "@/lib/asset";

// Direction 1a — Arc bouquet. Per-flower baseline translateY+rotate (the fan),
// with a gentle grow-in on mount that settles into the idle sway.
const ARC = [
  { c: "red",    ty: 30, rot: -10, h: 190, sway: 5.6, d: 0.10 },
  { c: "orange", ty: 10, rot: -6,  h: 220, sway: 5.2, d: 0.50 },
  { c: "yellow", ty: 0,  rot: -2,  h: 245, sway: 6.0, d: 0.20 },
  { c: "green",  ty: 0,  rot: 0,   h: 255, sway: 5.4, d: 0.00 },
  { c: "blue",   ty: 0,  rot: 2,   h: 245, sway: 5.8, d: 0.35 },
  { c: "indigo", ty: 10, rot: 6,   h: 220, sway: 5.3, d: 0.15 },
  { c: "violet", ty: 30, rot: 10,  h: 190, sway: 5.7, d: 0.45 },
];

export default function TitleScreen({ onPlay }: { onPlay: () => void }) {
  return (
    <Stage w={1280} h={720} background="linear-gradient(180deg,#f6efe2 0%,#f1e9d9 55%,#e9dfc9 100%)">
      {/* soft ground — full-width floor, kept unscaled */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110,
        background: "linear-gradient(180deg,rgba(139,120,78,0) 0%,rgba(139,120,78,.16) 100%)" }} />

      {/* flowers + title composition scaled to 50%, centered on the stage */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0,
        transform: "scale(0.5)", transformOrigin: "center center" }}>
      {/* arc of flowers */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 56, height: 300,
        display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 6 }}>
        {ARC.map((f) => (
          <div key={f.c} style={{ transform: `translateY(${f.ty}px) rotate(${f.rot}deg)`, transformOrigin: "bottom center" }}>
            <img
              src={bloomSrc(f.c)}
              alt=""
              style={{
                height: f.h,
                transformOrigin: "bottom center",
                animation: `growUp .7s cubic-bezier(.2,.8,.3,1.3) both, swayFlower ${f.sway}s ease-in-out infinite`,
                animationDelay: `${f.d}s, ${f.d + 1}s`,
                filter: "drop-shadow(0 8px 6px rgba(60,45,25,.18))",
              }}
            />
          </div>
        ))}
      </div>

      {/* title + subtitle + play */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 388, textAlign: "center",
        animation: "titleRise .8s ease .5s both" }}>
        <div className="serif" style={{ fontWeight: 600, fontSize: 240, lineHeight: 1, color: "#4a4331", letterSpacing: ".5px" }}>
          Flower<span style={{ color: "#a6693f" }}>Power</span>
        </div>
        <div style={{ marginTop: 18, fontWeight: 700, fontSize: 44, color: "#6b6250", letterSpacing: ".3px" }}>
          Grow a dahlia of every color to fill the rainbow
        </div>
        <button
          className="btn btn-green"
          onClick={onPlay}
          style={{ marginTop: 34, fontSize: 44, padding: "18px 56px", letterSpacing: ".4px",
            boxShadow: "0 10px 0 #566d48, 0 14px 24px rgba(60,50,20,.25)" }}
        >
          Play
        </button>
      </div>
      </div>
    </Stage>
  );
}
