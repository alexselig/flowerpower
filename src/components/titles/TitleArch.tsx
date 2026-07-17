/* eslint-disable @next/next/no-img-element */
"use client";

import Stage from "../Stage";
import { bloomSrc } from "@/lib/asset";

// Option B — Rainbow Arch. The seven dahlias sit on a semicircle, stems
// converging to a common point, forming a rainbow gateway. Wordmark beneath.
const COLORS = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const CX = 640, CY = 602, R = 374;

const arc = COLORS.map((c, i) => {
  const deg = 150 - i * 20;            // 150° (left) → 30° (right)
  const rad = (deg * Math.PI) / 180;
  return {
    c,
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad),
    tilt: 90 - deg,                    // lean outward along the radius
    delay: Math.abs(i - 3) * 0.12,     // draw from the apex outward
  };
});

export default function TitleArch({ onPlay }: { onPlay: () => void }) {
  return (
    <Stage w={1280} h={720} background="linear-gradient(180deg,#dcebe9 0%,#e7eddf 52%,#f2ecdd 100%)">
      {/* warm sun glow behind the apex */}
      <div style={{ position: "absolute", left: CX - 260, top: 30, width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(247,223,154,.6) 0%,rgba(247,223,154,0) 66%)",
        animation: "glowPulse 6s ease-in-out infinite" }} />

      {/* the arch */}
      {arc.map((f) => (
        <img key={f.c} src={bloomSrc(f.c)} alt=""
          style={{ position: "absolute", left: f.x, top: f.y, height: 150,
            transform: `translate(-50%,-100%) rotate(${f.tilt}deg)`, transformOrigin: "bottom center",
            animation: `growUp .8s cubic-bezier(.2,.8,.3,1.3) both, swayFlower ${5.4 + (f.tilt % 3)}s ease-in-out infinite`,
            animationDelay: `${0.3 + f.delay}s, ${1.4 + f.delay}s`,
            filter: "drop-shadow(0 8px 7px rgba(60,45,25,.20))" }} />
      ))}

      {/* wordmark inside the gateway */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 452, textAlign: "center", zIndex: 5,
        animation: "titleRise .8s ease .7s both" }}>
        <div className="serif" style={{ fontWeight: 600, fontSize: 100, lineHeight: 1, color: "#4a4331", letterSpacing: ".5px",
          textShadow: "0 2px 18px rgba(246,239,226,.9)" }}>
          Flower<span style={{ color: "#a6693f" }}>Power</span>
        </div>
        <div style={{ marginTop: 16, fontWeight: 700, fontSize: 22, color: "#6b6250", letterSpacing: ".3px" }}>
          Grow a dahlia of every color to complete the rainbow
        </div>
        <button className="btn btn-green" onClick={onPlay}
          style={{ marginTop: 30, fontSize: 23, padding: "18px 60px", letterSpacing: ".4px",
            boxShadow: "0 9px 0 #566d48, 0 13px 24px rgba(60,50,20,.26)" }}>
          Play
        </button>
      </div>
    </Stage>
  );
}
