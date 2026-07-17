/* eslint-disable @next/next/no-img-element */
"use client";

import Stage from "../Stage";
import { bloomSrc } from "@/lib/asset";

// Option D — Twilight Garden. A cozy dusk palette with twinkling stars,
// drifting fireflies, and softly glowing dahlias along the ground.
const ROW = [
  { c: "red",    h: 150, rot: -9, d: 0.10 },
  { c: "orange", h: 168, rot: -6, d: 0.42 },
  { c: "yellow", h: 182, rot: -2, d: 0.20 },
  { c: "green",  h: 190, rot: 0,  d: 0.00 },
  { c: "blue",   h: 182, rot: 2,  d: 0.34 },
  { c: "indigo", h: 168, rot: 6,  d: 0.16 },
  { c: "violet", h: 150, rot: 9,  d: 0.48 },
];

// Deterministic scatter (no Math.random → no hydration surprises).
const STARS = [
  [6, 60, 3], [13, 120, 2], [20, 48, 2], [27, 150, 3], [34, 90, 2], [41, 40, 2],
  [48, 130, 3], [55, 66, 2], [62, 150, 2], [69, 52, 3], [76, 118, 2], [83, 78, 2],
  [90, 140, 3], [94, 56, 2], [9, 210, 2], [17, 260, 2], [30, 230, 2], [44, 285, 2],
  [58, 235, 2], [72, 275, 2], [86, 225, 2], [3, 150, 2], [96, 190, 2], [50, 30, 3],
];
const FLIES = [
  [22, 430, 8, 0], [37, 500, 7.5, 1.2], [52, 460, 9, 0.5], [64, 520, 8, 2.1],
  [78, 470, 7, 1.5], [30, 540, 8.5, 0.9], [70, 410, 9, 2.6], [46, 545, 8, 3.0],
];

export default function TitleTwilight({ onPlay }: { onPlay: () => void }) {
  return (
    <Stage w={1280} h={720} background="linear-gradient(180deg,#1f2540 0%,#2b2a49 42%,#3a3552 74%,#4a4058 100%)">
      {/* moon */}
      <div style={{ position: "absolute", right: 120, top: 70, width: 96, height: 96, borderRadius: "50%",
        background: "radial-gradient(circle at 38% 38%,#fdf6e3 0%,#efe4c4 62%,rgba(239,228,196,0) 74%)",
        boxShadow: "0 0 60px rgba(253,246,227,.35)", animation: "glowPulse 7s ease-in-out infinite" }} />

      {/* stars */}
      {STARS.map(([x, y, s], i) => (
        <div key={`s${i}`} style={{ position: "absolute", left: `${x}%`, top: y, width: s, height: s,
          borderRadius: "50%", background: "#f4efe2",
          animation: `twinkle ${2.6 + (i % 5) * 0.5}s ease-in-out ${(i % 7) * 0.4}s infinite` }} />
      ))}

      {/* fireflies */}
      {FLIES.map(([x, y, dur, delay], i) => (
        <div key={`f${i}`} style={{ position: "absolute", left: `${x}%`, top: y,
          animation: `firefly ${dur}s ease-in-out ${delay}s infinite` }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%",
            background: "radial-gradient(circle,#fff3b0 0%,#f4cf6a 55%,rgba(244,207,106,0) 72%)",
            boxShadow: "0 0 12px rgba(247,214,120,.9)",
            animation: `glowPulse ${2 + (i % 3) * 0.6}s ease-in-out infinite` }} />
        </div>
      ))}

      {/* ground haze */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200,
        background: "linear-gradient(180deg,rgba(60,52,80,0) 0%,rgba(38,34,58,.55) 100%)" }} />

      {/* glowing dahlias */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, height: 210,
        display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 4 }}>
        {ROW.map((f) => (
          <img key={f.c} src={bloomSrc(f.c)} alt=""
            style={{ height: f.h, transform: `rotate(${f.rot}deg)`, transformOrigin: "bottom center",
              animation: `growUp .8s cubic-bezier(.2,.8,.3,1.3) both, swayFlower ${5.3 + f.d}s ease-in-out infinite`,
              animationDelay: `${f.d}s, ${f.d + 1}s`,
              filter: "drop-shadow(0 0 20px rgba(255,214,140,.28)) drop-shadow(0 10px 10px rgba(0,0,0,.35))" }} />
        ))}
      </div>

      {/* wordmark */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 214, textAlign: "center",
        animation: "titleRise .9s ease .4s both" }}>
        <div className="serif" style={{ fontWeight: 600, fontSize: 98, lineHeight: 1, color: "#f6efe2", letterSpacing: ".5px",
          textShadow: "0 2px 30px rgba(247,214,140,.45), 0 1px 2px rgba(0,0,0,.3)" }}>
          Flower<span style={{ color: "#f0b56a" }}>Power</span>
        </div>
        <div style={{ marginTop: 16, fontWeight: 700, fontSize: 22, color: "#cfc7d8", letterSpacing: ".3px" }}>
          A cozy evening of growing every color of dahlia
        </div>
        <button className="btn btn-green" onClick={onPlay}
          style={{ marginTop: 30, fontSize: 23, padding: "18px 60px", letterSpacing: ".4px",
            boxShadow: "0 9px 0 #3f5236, 0 14px 26px rgba(0,0,0,.4)" }}>
          Play
        </button>
      </div>
    </Stage>
  );
}
