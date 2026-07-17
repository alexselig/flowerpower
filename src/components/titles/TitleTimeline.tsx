/* eslint-disable @next/next/no-img-element */
"use client";

import Stage from "../Stage";
import { asset, bloomSrc } from "@/lib/asset";

// Option A — Growth Timeline. A filmstrip of the six growth stages reading
// left→right on a soil baseline, teaching the core loop at a glance.
const STEPS = [
  { src: asset("/sprites/stage_seed.png"),     h: 40,  label: "Seed" },
  { src: asset("/sprites/stage_sprout.png"),   h: 96,  label: "Sprout" },
  { src: asset("/sprites/stage_seedling.png"), h: 150, label: "Leaf" },
  { src: asset("/sprites/stage_bud.png"),      h: 206, label: "Bud" },
  { src: asset("/sprites/opening_red.png"),    h: 250, label: "Opening" },
  { src: bloomSrc("red"),                      h: 300, label: "Bloom" },
];

export default function TitleTimeline({ onPlay }: { onPlay: () => void }) {
  return (
    <Stage w={1280} h={720} background="linear-gradient(180deg,#f6efe2 0%,#f1e9d9 55%,#e9dfc9 100%)">
      {/* sun */}
      <div style={{ position: "absolute", right: 92, top: 74, width: 92, height: 92, borderRadius: "50%",
        background: "radial-gradient(circle,#f7df9a 0%,#f3cf78 60%,rgba(243,207,120,0) 72%)",
        animation: "glowPulse 5s ease-in-out infinite" }} />

      {/* title block */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 58, textAlign: "center",
        animation: "titleRise .8s ease .4s both" }}>
        <div className="serif" style={{ fontWeight: 600, fontSize: 84, lineHeight: 1, color: "#4a4331", letterSpacing: ".5px" }}>
          Flower<span style={{ color: "#a6693f" }}>Power</span>
        </div>
        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 21, color: "#6b6250", letterSpacing: ".3px" }}>
          Sun&nbsp;+&nbsp;water, day by day — grow a dahlia of every color
        </div>
        <button className="btn btn-green" onClick={onPlay}
          style={{ marginTop: 26, fontSize: 22, padding: "16px 54px", letterSpacing: ".4px",
            boxShadow: "0 8px 0 #566d48, 0 12px 22px rgba(60,50,20,.24)" }}>
          Play
        </button>
      </div>

      {/* soil baseline */}
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 60, height: 74, borderRadius: 20,
        background: "linear-gradient(180deg,#8a6a45 0%,#6e5334 100%)",
        boxShadow: "inset 0 3px 0 rgba(255,255,255,.10), 0 8px 18px rgba(60,45,25,.16)" }} />
      {/* dotted growth track */}
      <div style={{ position: "absolute", left: 120, right: 120, bottom: 96, height: 0,
        borderTop: "3px dashed rgba(120,100,64,.45)" }} />

      {/* growth strip */}
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 78,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 150 }}>
            <img src={s.src} alt={s.label}
              style={{ height: s.h, transformOrigin: "bottom center",
                animation: `growUp .7s cubic-bezier(.2,.8,.3,1.3) both, swayFlower ${5.2 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${0.5 + i * 0.14}s, ${1.3 + i * 0.14}s`,
                filter: "drop-shadow(0 7px 5px rgba(60,45,25,.18))" }} />
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: 13, letterSpacing: ".6px", textTransform: "uppercase",
              color: i === STEPS.length - 1 ? "#a6693f" : "#8a8170" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
}
