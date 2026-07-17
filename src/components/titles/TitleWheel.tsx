/* eslint-disable @next/next/no-img-element */
"use client";

import Stage from "../Stage";
import { bloomSrc } from "@/lib/asset";

// Option C — Color Wheel. The seven dahlias radiate from a central hub as a
// slowly-turning mandala; the wordmark sits in the calm center.
const COLORS = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const CX = 640, CY = 300, R = 172;

export default function TitleWheel({ onPlay }: { onPlay: () => void }) {
  return (
    <Stage w={1280} h={720} background="radial-gradient(circle at 50% 34%,#fbf4e4 0%,#f3ead7 46%,#e9dfc9 100%)">
      {/* warm halo */}
      <div style={{ position: "absolute", left: CX - 300, top: CY - 300, width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(247,223,154,.42) 0%,rgba(247,223,154,0) 62%)",
        animation: "glowPulse 6s ease-in-out infinite" }} />

      {/* rotating ring */}
      <div style={{ position: "absolute", left: CX, top: CY, width: 0, height: 0,
        animation: "spinSlow 90s linear infinite" }}>
        {COLORS.map((c, i) => {
          const a = i * (360 / COLORS.length);
          return (
            <div key={c} style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${a}deg)` }}>
              <img src={bloomSrc(c)} alt=""
                style={{ position: "absolute", left: 0, top: -R, height: 104,
                  transform: "translate(-50%,-100%)", transformOrigin: "bottom center",
                  animation: `growUp .7s cubic-bezier(.2,.8,.3,1.3) both`,
                  animationDelay: `${0.3 + i * 0.09}s`,
                  filter: "drop-shadow(0 6px 6px rgba(60,45,25,.20))" }} />
            </div>
          );
        })}
      </div>

      {/* hub + wordmark */}
      <div style={{ position: "absolute", left: CX - 112, top: CY - 112, width: 224, height: 224, borderRadius: "50%",
        background: "radial-gradient(circle,#fbf7ee 0%,#fbf7ee 70%,rgba(251,247,238,0) 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", animation: "titleRise .8s ease .5s both" }}>
        <div className="serif" style={{ textAlign: "center", fontWeight: 600, fontSize: 46, lineHeight: .98, color: "#4a4331" }}>
          Flower<br /><span style={{ color: "#a6693f" }}>Power</span>
        </div>
      </div>

      {/* subtitle + play */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 592, textAlign: "center",
        animation: "titleRise .8s ease .8s both" }}>
        <div style={{ fontWeight: 700, fontSize: 21, color: "#6b6250", letterSpacing: ".3px" }}>
          Balance sun and water to bloom all seven colors
        </div>
        <button className="btn btn-green" onClick={onPlay}
          style={{ marginTop: 22, fontSize: 22, padding: "16px 56px", letterSpacing: ".4px",
            boxShadow: "0 8px 0 #566d48, 0 12px 22px rgba(60,50,20,.24)" }}>
          Play
        </button>
      </div>
    </Stage>
  );
}
