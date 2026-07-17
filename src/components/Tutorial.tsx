/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Stage from "./Stage";
import { RAINBOW } from "@/lib/game";
import { asset, bloomSrc } from "@/lib/asset";

// A quick, guided walkthrough shown once between the title and the game.
// Visual and skippable — teaches the loop (plant → sun+water → balance → bloom)
// using the real sprites, tracker, and spectrum the player will see in-game.

const INK = "#4a4331", MUTED = "#6b6250", MUTED2 = "#8a8170";
const CARD = "#f6f2e6", LINE = "rgba(70,63,46,.12)";
const GREEN = "#6f8a5e", GREEN_D = "#566d48";
const SPECTRUM = `linear-gradient(90deg, ${RAINBOW.map((c) => c.hex).join(", ")})`;

// six growth stages, sized to read as "growing taller"
const FILM = [
  { src: asset("/sprites/stage_seed.png"),     h: 34,  label: "Seed" },
  { src: asset("/sprites/stage_sprout.png"),   h: 58,  label: "Sprout" },
  { src: asset("/sprites/stage_seedling.png"), h: 84,  label: "Leaf" },
  { src: asset("/sprites/stage_bud.png"),      h: 112, label: "Bud" },
  { src: asset("/sprites/opening_red.png"),    h: 132, label: "Opening" },
  { src: bloomSrc("red"),                      h: 150, label: "Bloom" },
];

// approximate left-offset (%) of each color along the warm→cool spectrum
const SPEC_POS: [string, number][] = [
  ["red", 5], ["orange", 20], ["yellow", 34], ["green", 50],
  ["blue", 66], ["indigo", 81], ["violet", 95],
];

function pill(children: ReactNode, extra: React.CSSProperties = {}) {
  return (
    <div style={{ background: "#fbf7ee", border: `1px solid rgba(70,63,46,.14)`, borderRadius: 20,
      padding: "18px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      minWidth: 190, boxShadow: "0 3px 8px rgba(60,50,20,.06)", ...extra }}>
      {children}
    </div>
  );
}

const STEPS: { title: string; visual: ReactNode; body: ReactNode }[] = [
  {
    title: "Grow the whole rainbow",
    visual: (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
        {RAINBOW.map((c, i) => (
          <img key={c.name} src={bloomSrc(c.name)} alt={c.label}
            style={{ height: 104, transformOrigin: "bottom center",
              animation: `growUp .6s cubic-bezier(.2,.8,.3,1.3) both, swayFlower ${5.2 + (i % 3) * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.07}s, ${i * 0.07 + 0.8}s`,
              filter: "drop-shadow(0 6px 5px rgba(60,45,25,.18))" }} />
        ))}
      </div>
    ),
    body: (
      <>Your goal: grow <b style={{ color: INK }}>one dahlia of every color</b>. Each hue is its own variety —
      fill all <b style={{ color: GREEN }}>7&nbsp;colors</b> of the rainbow to win.</>
    ),
  },
  {
    title: "Plant a seed, watch it grow",
    visual: (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
        {FILM.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 92 }}>
              <img src={s.src} alt={s.label} style={{ height: s.h, transformOrigin: "bottom center",
                animation: "growUp .5s cubic-bezier(.2,.8,.3,1.3) both", animationDelay: `${0.15 + i * 0.1}s`,
                filter: "drop-shadow(0 5px 4px rgba(60,45,25,.16))" }} />
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".4px", textTransform: "uppercase",
                color: i === FILM.length - 1 ? "#a6693f" : MUTED2 }}>{s.label}</span>
            </div>
            {i < FILM.length - 1 && <span style={{ color: "rgba(70,63,46,.3)", fontSize: 22, paddingBottom: 24 }}>→</span>}
          </div>
        ))}
      </div>
    ),
    body: (
      <>Tap any <b style={{ color: INK }}>empty bed</b> to plant a seed 🌰. From there it climbs through{" "}
      <b style={{ color: INK }}>6&nbsp;growth&nbsp;stages</b> before it finally blooms.</>
    ),
  },
  {
    title: "Sun and water, every day",
    visual: (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        {pill(<>
          <span style={{ width: 52, height: 52, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 38%,#ffe9b0,#e8b354)",
            boxShadow: "0 0 22px rgba(232,179,84,.5)", animation: "glowPulse 4s ease-in-out infinite" }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: INK }}>Sun</span>
          <span style={{ fontSize: 15, color: MUTED2, fontWeight: 700 }}>from the weather</span>
        </>)}
        <span style={{ fontSize: 40, fontWeight: 800, color: MUTED2 }}>+</span>
        {pill(<>
          <span style={{ width: 40, height: 40, borderRadius: "50% 50% 50% 0", transform: "rotate(45deg)",
            background: "linear-gradient(180deg,#8fc1e8,#4c86bf)", boxShadow: "0 4px 10px rgba(76,134,191,.4)",
            animation: "floatSoft 3.5s ease-in-out infinite" }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: INK }}>Water</span>
          <span style={{ fontSize: 15, color: MUTED2, fontWeight: 700 }}>you add it — refills daily</span>
        </>)}
      </div>
    ),
    body: (
      <>A plant grows only on a day it gets <b style={{ color: INK }}>both</b>. The weather brings{" "}
      <b style={{ color: "#c9873f" }}>sun</b>; you add <b style={{ color: "#3f7bb0" }}>water</b> — your can refills each
      morning. Two dry, sunny days, though, and a seedling <b style={{ color: "#b4503f" }}>wilts</b>.</>
    ),
  },
  {
    title: "The balance picks the color",
    visual: (
      <div style={{ width: 740 }}>
        <div style={{ position: "relative", height: 92, marginBottom: 14 }}>
          {SPEC_POS.map(([c, x]) => (
            <img key={c} src={bloomSrc(c)} alt={c}
              style={{ position: "absolute", left: `${x}%`, bottom: 0, height: 76, transform: "translateX(-50%)",
                filter: "drop-shadow(0 4px 4px rgba(60,45,25,.16))" }} />
          ))}
        </div>
        <div style={{ height: 22, borderRadius: 999, background: SPECTRUM,
          boxShadow: "inset 0 1px 3px rgba(60,50,20,.28)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 17, fontWeight: 800 }}>
          <span style={{ color: "#b4503f" }}>☀ more sun → warm</span>
          <span style={{ color: "#7c9152" }}>even → green</span>
          <span style={{ color: "#5b84ab" }}>more water → cool 💧</span>
        </div>
      </div>
    ),
    body: (
      <>The running <b style={{ color: INK }}>balance</b> of sun vs. water sets the color:{" "}
      <span style={{ whiteSpace: "nowrap" }}>sun-heavy</span> runs <b style={{ color: "#b4503f" }}>warm</b>, even stays{" "}
      <b style={{ color: "#7c9152" }}>green</b>, <span style={{ whiteSpace: "nowrap" }}>water-heavy</span> turns{" "}
      <b style={{ color: "#5b84ab" }}>cool</b>. It locks in once the bud opens.</>
    ),
  },
  {
    title: "End the day, fill the rainbow",
    visual: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ background: GREEN, color: "#fbf7ee", fontWeight: 800, fontSize: 22, padding: "16px 34px",
          borderRadius: 999, boxShadow: `0 5px 0 ${GREEN_D}, 0 9px 16px rgba(60,50,20,.2)` }}>End day →</div>
        <span style={{ fontSize: 26, color: MUTED2 }}>↓</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fbf7ee",
          border: `1px solid rgba(70,63,46,.14)`, borderRadius: 999, padding: "12px 22px" }}>
          <span style={{ fontWeight: 800, fontSize: 22, color: GREEN }}>7/7</span>
          <span style={{ width: 1, height: 24, background: "rgba(70,63,46,.18)" }} />
          {RAINBOW.map((c) => <img key={c.name} src={bloomSrc(c.name)} alt={c.label} style={{ height: 38 }} />)}
          <span style={{ fontSize: 22 }}>🌈</span>
        </div>
      </div>
    ),
    body: (
      <>Done watering? Press <b style={{ color: GREEN }}>End&nbsp;day&nbsp;→</b> to move time forward. Keep planting
      and balancing until every color blooms — complete the rainbow to <b style={{ color: INK }}>win</b>. 🌈</>
    ),
  },
];

export default function Tutorial({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const next = () => (isLast ? onDone() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isLast]);

  const s = STEPS[step];

  return (
    <Stage w={1280} h={720} background="linear-gradient(180deg,#f6efe2 0%,#f1e9d9 55%,#e9dfc9 100%)">
      {/* soft ambient sun */}
      <div style={{ position: "absolute", right: 90, top: 60, width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle,#f7df9a 0%,#f3cf78 58%,rgba(243,207,120,0) 72%)",
        animation: "glowPulse 6s ease-in-out infinite" }} />

      {/* card */}
      <div style={{ position: "absolute", left: 140, top: 66, width: 1000, height: 588, background: CARD,
        border: `1px solid ${LINE}`, borderRadius: 26, boxShadow: "0 26px 60px rgba(30,22,10,.28)",
        boxSizing: "border-box", padding: "40px 56px 34px", display: "flex", flexDirection: "column" }}>

        {/* header: counter + dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: ".5px", textTransform: "uppercase", color: MUTED2 }}>
            Step {step + 1} of {STEPS.length}
          </span>
          <div style={{ display: "flex", gap: 9 }}>
            {STEPS.map((_, i) => (
              <span key={i} style={{ width: i === step ? 26 : 10, height: 10, borderRadius: 999,
                background: i === step ? GREEN : "rgba(70,63,46,.2)", transition: "width .25s ease, background .25s ease" }} />
            ))}
          </div>
        </div>

        {/* animated step content */}
        <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 26, animation: "titleRise .4s ease both" }}>
          <div className="serif" style={{ fontWeight: 600, fontSize: 46, color: INK, textAlign: "center", lineHeight: 1.05 }}>
            {s.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 210 }}>
            {s.visual}
          </div>
          <div style={{ height: 112, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: 760, textAlign: "center", fontSize: 23, lineHeight: 1.55, color: MUTED,
              fontWeight: 600, textWrap: "balance" }}>
              {s.body}
            </div>
          </div>
        </div>

        {/* footer: skip · back · next/start */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <button className="link" style={{ fontSize: 18 }} onClick={onDone}>Skip tutorial</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {step > 0 && (
              <button className="btn btn-cream" style={{ fontSize: 19, padding: "14px 26px", borderRadius: 999 }} onClick={back}>← Back</button>
            )}
            <button className="btn btn-green" onClick={next}
              style={{ fontSize: 21, padding: "15px 40px",
                boxShadow: `0 6px 0 ${GREEN_D}, 0 10px 18px rgba(60,50,20,.2)` }}>
              {isLast ? "Start growing 🌱" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </Stage>
  );
}
