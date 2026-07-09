/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
"use client";

import { useEffect, useReducer, useState, type ReactNode } from "react";
import {
  reducer, initGame, RAINBOW, WEATHER, CONFIG,
  isGrowing, predictedColor,
  type Plot, type ColorName, type Weather,
} from "@/lib/game";
import { spriteFor, plantHeight } from "@/lib/sprites";
import { bloomSrc } from "@/lib/asset";
import Stage from "./Stage";
import TitleScreen from "./TitleScreen";

const PAGE_BG = "linear-gradient(180deg,#dcebe9 0%,#eef1e1 38%,#f4efe1 68%,#ece2c8 100%)";
const BED_FLOWER_H = 252;

const rc = (c?: ColorName | null) => RAINBOW.find((r) => r.name === c);
const nameOf = (c?: ColorName | null) => { const r = rc(c); return r ? `${r.label} ${r.variety}` : ""; };

function weatherDot(w: Weather): string {
  if (w === "rainy") return "radial-gradient(circle at 35% 35%,#a9c8e6,#5b84ab)";
  if (w === "cloudy") return "radial-gradient(circle at 35% 35%,#e6e8ea,#b7bbbe)";
  return "radial-gradient(circle at 35% 35%,#ffe9b0,#e8b354)"; // sunny / partly
}

/* ---------- flowerbed cell visuals (drawn in a non-clipped layer) ---------- */
function BedCell({ plot, weatherSun, onAct }: { plot: Plot; weatherSun: number; onAct: () => void }) {
  if (plot.stage === "bloom") {
    return (
      <div style={{ justifySelf: "center", cursor: "default" }}>
        <img
          key={plot.bloomColor}
          src={bloomSrc(plot.bloomColor ?? "red")}
          alt={nameOf(plot.bloomColor)}
          style={{ height: BED_FLOWER_H, display: "block", transformOrigin: "bottom center",
            filter: "drop-shadow(0 10px 8px rgba(60,45,25,.22))",
            animation: "popIn .5s cubic-bezier(.2,.8,.3,1.3), swayFlower 6s ease-in-out .5s infinite" }}
        />
      </div>
    );
  }

  if (plot.stage === "empty") {
    return <div style={{ justifySelf: "center" }} />; // planting handled by the labeled button below
  }

  // growing (seed/sprout/seedling/bud/opening) or dead — the real growth sprite,
  // bottom-anchored at the soil line so the plant visibly grows taller each stage.
  const dead = plot.stage === "dead";
  const src = spriteFor(plot)!;
  const h = plantHeight(plot);
  const filled = Math.min(CONFIG.MAX_WATER_PER_PLOT, plot.waterToday);
  const showNeeds = !dead && weatherSun >= 1 && plot.waterToday === 0;
  const swaying = plot.stage === "bud" || plot.stage === "opening";
  return (
    <div onClick={onAct} style={{ justifySelf: "center", alignSelf: "end", display: "flex",
      flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
      {!dead && filled > 0 && (
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: CONFIG.MAX_WATER_PER_PLOT }, (_, i) => (
            <span key={i} style={{ width: 12, height: 16, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: i < filled ? "#7fb3e0" : "rgba(127,179,224,.28)" }} />
          ))}
        </div>
      )}
      {showNeeds && (
        <span style={{ fontWeight: 800, fontSize: 17, color: "#b5762f", background: "#fbead0",
          padding: "7px 18px", borderRadius: 999, whiteSpace: "nowrap" }}>needs water</span>
      )}
      {dead && (
        <span style={{ fontWeight: 800, fontSize: 17, color: "#8a8170", background: "#efe7d6",
          padding: "7px 18px", borderRadius: 999, whiteSpace: "nowrap" }}>wilted</span>
      )}
      <img
        key={plot.stage}
        src={src}
        alt=""
        style={{ height: h, display: "block", transformOrigin: "bottom center",
          filter: dead
            ? "grayscale(.6) brightness(1.03) drop-shadow(0 6px 6px rgba(60,45,25,.16))"
            : "drop-shadow(0 8px 7px rgba(60,45,25,.2))",
          transform: dead ? "rotate(-7deg)" : "none",
          animation: dead ? "none"
            : `growUp .5s cubic-bezier(.2,.8,.3,1.3)${swaying ? ", swayFlower 6.5s ease-in-out .5s infinite" : ""}` }}
      />
    </div>
  );
}

/* ---------- per-plant label + action button ----------
   The header slot doubles as the COLOR INDICATOR: for a growing plant it shows the
   dahlia color/variety it is heading toward (live), locking once the bud opens. */
function PlotLabel({ plot, canWater, onWater, onReplant, onPlant, onClear }: {
  plot: Plot; canWater: boolean;
  onWater: () => void; onReplant: () => void; onPlant: () => void; onClear: () => void;
}) {
  const growing = isGrowing(plot);
  const kind = plot.stage === "bloom" ? "bloom" : growing ? "growing" : plot.stage === "dead" ? "dead" : "empty";
  let dot = "rgba(70,63,46,.3)", labelCol = "#8a8170", name = "";
  let btn = <button className="btn btn-cream" style={{ width: "100%", fontSize: 23, padding: "16px 0" }} onClick={onPlant}>🌰 Plant</button>;
  let predictAttr = "";

  if (plot.stage === "bloom") {
    const r = rc(plot.bloomColor)!;
    dot = r.hex; labelCol = r.labelHex ?? r.hex; name = `${r.label} ${r.variety}`;
    predictAttr = r.name;
    btn = <button className="btn btn-cream" style={{ width: "100%", fontSize: 23, padding: "16px 0" }} onClick={onReplant}>✂ Replant</button>;
  } else if (growing) {
    const pc = plot.bloomColor ?? predictedColor(plot);
    if (pc) {
      const r = rc(pc)!;
      dot = r.hex; labelCol = r.labelHex ?? r.hex; name = `${r.label} ${r.variety}`; predictAttr = r.name;
    } else {
      dot = "#c9c3b2"; labelCol = "#8a8170"; name = "color forming…";
    }
    btn = <button className="btn btn-blue" style={{ width: "100%", fontSize: 23, padding: "16px 0" }} disabled={!canWater} onClick={onWater}>💧 Water</button>;
  } else if (plot.stage === "dead") {
    name = "Wilted";
    btn = <button className="btn btn-cream" style={{ width: "100%", fontSize: 23, padding: "16px 0" }} onClick={onClear}>🧹 Clear</button>;
  } else {
    name = "Empty bed";
  }

  const rainbowDot = "conic-gradient(from 0deg,#b4503f,#c9793f,#c9a24a,#7c9152,#5b84ab,#5e5aa6,#8f5a9c,#b4503f)";
  const forming = growing && !predictAttr;

  return (
    <div className="plotlabel" data-plot={plot.id} data-kind={kind} data-color={plot.bloomColor ?? ""} data-predict={predictAttr}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, width: "100%", minHeight: 72 }}>
        <span style={{ width: 13, height: 13, borderRadius: "50%", flex: "none",
          background: forming ? rainbowDot : dot }} />
        <span className="serif" style={{ fontWeight: 700, fontSize: 30, lineHeight: 1.04, color: labelCol,
          textAlign: "center", whiteSpace: "normal" }}>{name}</span>
        <span style={{ width: 13, height: 13, borderRadius: "50%", flex: "none",
          background: forming ? rainbowDot : dot }} />
      </div>
      {btn}
    </div>
  );
}

const WHEEL = "conic-gradient(from 0deg,#c65b45,#d8963f,#8a9d4e,#4c8fae,#5a5b93,#a05a9c,#c65b45)";
const HELP_ROWS: { ring?: string; accent?: string; icon?: string; wheel?: boolean; body: ReactNode }[] = [
  { ring: "#d8b27a", accent: "#b5762f", icon: "🌰",
    body: <><b style={{ color: "#4a4331" }}>Plant a seed.</b> Tap an empty bed. Each dahlia grows through <b>6 stages</b> before it blooms.</> },
  { ring: "#8fbbe0", accent: "#3f7bb0", icon: "💧",
    body: <><b style={{ color: "#3f7bb0" }}>Sun and water, every day.</b> A plant only grows on days it gets both. Check the weather for sun, then tap Water — your supply refills each morning.</> },
  { wheel: true,
    body: <><b style={{ color: "#4a4331" }}>The balance decides the color.</b> More <span style={{ color: "#c9793f", fontWeight: 800 }}>sun</span> → warm reds &amp; oranges. More <span style={{ color: "#5b84ab", fontWeight: 800 }}>water</span> → cool blues &amp; violets. Even → green. Each color is its own dahlia variety.</> },
  { ring: "#dd9a80", accent: "#b4503f", icon: "☀",
    body: <><b style={{ color: "#b4503f" }}>Watch for wilting.</b> A sunny day with no water scorches a seedling — two days like that and it wilts. Rainy days have no sun, so plants simply rest.</> },
  { ring: "#a3c088", accent: "#5c7a49", icon: "🌈",
    body: <><b style={{ color: "#5c7a49" }}>Fill the rainbow to win.</b> Grow one dahlia of every color to complete the tracker. Press <b>End day →</b> once you're done watering.</> },
];

export default function Game() {
  const [screen, setScreen] = useState<"title" | "playing">("title");
  const [state, dispatch] = useReducer(reducer, undefined, () => initGame());
  const [modal, setModal] = useState<null | "help" | "log" | "win">(null);
  const [seenHelp, setSeenHelp] = useState(false);

  useEffect(() => {
    if (screen === "playing" && !seenHelp) { setModal("help"); setSeenHelp(true); }
  }, [screen, seenHelp]);
  useEffect(() => {
    if (state.won && modal !== "win") setModal("win");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.won]);

  if (screen === "title") return <TitleScreen onPlay={() => setScreen("playing")} />;

  const weatherSun = WEATHER[state.weather].sun;
  const canWater = state.waterLeft > 0;
  const waterPct = Math.max(0, Math.min(100, (state.waterLeft / CONFIG.CAN_CAPACITY) * 100));

  const act = (p: Plot) => {
    if (isGrowing(p)) { if (canWater) dispatch({ type: "water", plotId: p.id }); }
    else if (p.stage === "empty") dispatch({ type: "plant", plotId: p.id });
    else if (p.stage === "dead") dispatch({ type: "clear", plotId: p.id });
  };

  return (
    <Stage w={1920} h={1080} background={PAGE_BG}>
      {/* ambient sun + clouds */}
      <div style={{ position: "absolute", right: 60, top: -70, width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle at 40% 40%, #ffe9b0 0%, #f7cf7c 55%, rgba(247,207,124,0) 75%)",
        filter: "blur(1px)", animation: "glowPulse 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", right: 170, top: 60, width: 110, height: 40, background: "#fff",
        borderRadius: 999, opacity: .5, filter: "blur(2px)", animation: "driftCloud 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", right: 270, top: 98, width: 74, height: 28, background: "#fff",
        borderRadius: 999, opacity: .4, filter: "blur(2px)", animation: "driftCloud 11s ease-in-out infinite reverse" }} />

      {/* title row: wordmark (left) · flower tracker (center) · End day (right) */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 40, zIndex: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="serif" style={{ fontWeight: 600, fontSize: 44, color: "#4a4331", letterSpacing: ".2px" }}>
          Flower<span style={{ color: "#a6693f" }}>Power</span>
        </div>
        <button className="btn btn-green" style={{ fontSize: 23, padding: "16px 32px", whiteSpace: "nowrap" }}
          onClick={() => dispatch({ type: "nextDay" })}>End day →</button>
      </div>

      {/* flower tracker — centered in the title row */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 42, zIndex: 5, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <span className="collected-count" style={{ fontWeight: 800, fontSize: 24, color: "#6f8a5e" }}>{state.collected.length}/7</span>
        <span style={{ width: 1, height: 26, background: "rgba(70,63,46,.18)" }} />
        <div style={{ display: "flex", gap: 8 }}>
          {RAINBOW.map((c) => {
            const has = state.collected.includes(c.name);
            return (
              <img key={c.name} className="swatch" data-color={c.name} data-collected={has ? "1" : "0"}
                src={bloomSrc(c.name)} alt={c.label} title={`${c.label} ${c.variety}${has ? " ✓" : " — still needed"}`}
                style={{ height: 42, filter: "drop-shadow(0 2px 3px rgba(60,50,20,.16))",
                  opacity: has ? 1 : 0.26, ...(has ? {} : { filter: "grayscale(.7) drop-shadow(0 2px 3px rgba(60,50,20,.10))" }) }} />
            );
          })}
        </div>
      </div>

      {/* weather indicator — centered on the white top of the garden bed */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 162, zIndex: 5, pointerEvents: "none", display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#fbf7ee", border: "1px solid rgba(70,63,46,.14)", borderRadius: 999, padding: "13px 28px",
          display: "flex", alignItems: "center", gap: 15, boxShadow: "0 3px 8px rgba(60,50,20,.06)" }}>
          <span style={{ fontWeight: 800, fontSize: 23, color: "#4a4331" }}>Day {state.day}</span>
          <span style={{ width: 1, height: 24, background: "rgba(70,63,46,.18)" }} />
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: weatherDot(state.weather), display: "inline-block" }} />
          <span className="wx-label" style={{ fontWeight: 700, fontSize: 23, color: "#6b6250" }}>{WEATHER[state.weather].label}</span>
        </div>
      </div>

      {/* shared flowerbed (cream + soil) — clipped for rounded corners only */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 130, height: 604, background: "#f6f2e6",
        border: "1px solid rgba(70,63,46,.1)", borderRadius: 22, boxShadow: "0 10px 26px rgba(60,50,20,.08)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, background: "linear-gradient(180deg,#8a6a45 0%,#6e5334 55%,#5c452a 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 196, height: 14, background: "radial-gradient(ellipse at center, rgba(90,68,42,.32) 0%, rgba(90,68,42,0) 75%)" }} />
      </div>

      {/* flowers layer (NOT clipped — flowers render fully) */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 130, height: 604 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 140, display: "grid", gridTemplateColumns: "repeat(7,1fr)", alignItems: "end", padding: "0 28px" }}>
          {state.plots.map((p) => (
            <BedCell key={p.id} plot={p} weatherSun={weatherSun} onAct={() => act(p)} />
          ))}
        </div>
      </div>

      {/* hint — below the water bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontSize: 20, color: "#8a8170", fontWeight: 600, letterSpacing: ".1px" }}>
        <span style={{ color: "#c9873f" }}>more sun → warm colors</span>
        <span style={{ margin: "0 12px", color: "rgba(70,63,46,.28)" }}>·</span>
        <span style={{ color: "#5b84ab" }}>more water → cool colors</span>
        <span style={{ margin: "0 12px", color: "rgba(70,63,46,.28)" }}>·</span>
        a flower needs <b style={{ color: "#4a4331", fontWeight: 800 }}>both</b> sun &amp; water to grow
      </div>

      {/* water level bar */}
      <div style={{ position: "absolute", left: 56, right: 56, top: 744, height: 68, borderRadius: 22, background: "#e4dcc6",
        boxShadow: "inset 0 2px 5px rgba(60,50,20,.14)", overflow: "hidden" }}>
        <div style={{ width: `${waterPct}%`, height: "100%", position: "relative", background: "linear-gradient(180deg,#8fc1e8 0%,#5b9bd6 55%,#4c86bf 100%)", transition: "width .35s ease" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(120deg, rgba(255,255,255,.16) 0 10px, rgba(255,255,255,0) 10px 22px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "45%", background: "linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0))" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 744, height: 68, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, pointerEvents: "none" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50% 50% 50% 0", background: "#fff", transform: "rotate(45deg)", opacity: .95 }} />
        <span className="water-count" style={{ fontWeight: 800, fontSize: 18, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.22)", letterSpacing: ".2px" }}>{state.waterLeft}/{CONFIG.CAN_CAPACITY} water</span>
      </div>

      {/* per-plant color indicator + action button */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 858, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "0 16px" }}>
        {state.plots.map((p) => (
          <PlotLabel key={p.id} plot={p} canWater={canWater}
            onWater={() => dispatch({ type: "water", plotId: p.id })}
            onReplant={() => dispatch({ type: "clear", plotId: p.id })}
            onPlant={() => dispatch({ type: "plant", plotId: p.id })}
            onClear={() => dispatch({ type: "clear", plotId: p.id })} />
        ))}
      </div>

      {/* footer */}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 26, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <button className="link" style={{ fontSize: 21 }} onClick={() => setModal("help")}>How to play</button>
          <button className="link" style={{ fontSize: 21 }} onClick={() => { dispatch({ type: "reset" }); setModal(null); }}>↺ New game</button>
        </div>
      </div>

      {/* modals */}
      {modal === "help" && (
        <div className="overlay" onClick={() => setModal(null)} style={{ background: "rgba(40,34,22,.38)" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: 1180, maxHeight: 960, background: "#f6f2e6", borderRadius: 26,
              boxShadow: "0 30px 70px rgba(30,22,10,.35)", padding: "56px 64px 48px", boxSizing: "border-box",
              animation: "modalIn .3s cubic-bezier(.2,.85,.3,1.1)" }}>
            {/* header: title + flower legend */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 26, borderBottom: "1px solid rgba(70,63,46,.12)" }}>
              <div className="serif" style={{ fontWeight: 600, fontSize: 58, color: "#4a4331", letterSpacing: ".2px" }}>How to play</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, transform: "translateY(-13px)" }}>
                {RAINBOW.map((c) => <img key={c.name} src={bloomSrc(c.name)} alt={c.label} style={{ height: 76 }} />)}
              </div>
            </div>
            {/* rules */}
            <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 28 }}>
              {HELP_ROWS.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 22, alignItems: "center" }}>
                  {r.wheel ? (
                    <span style={{ flex: "none", width: 56, height: 56, borderRadius: "50%", background: WHEEL,
                      border: "3px solid #fdfaf2", boxShadow: "0 0 0 1px rgba(70,63,46,.1)" }} />
                  ) : (
                    <span style={{ flex: "none", width: 56, height: 56, borderRadius: "50%", background: "#fdfaf2",
                      border: `2px solid ${r.ring}`, color: r.accent, display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 800, fontSize: 25 }}>{r.icon}</span>
                  )}
                  <div style={{ fontSize: 27, lineHeight: 1.6, color: "#4a4331", fontWeight: 600 }}>{r.body}</div>
                </div>
              ))}
            </div>
            {/* footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40 }}>
              <button onClick={() => setModal(null)}
                style={{ fontFamily: "var(--font-body), Nunito, sans-serif", fontWeight: 800, fontSize: 24, color: "#fbf7ee",
                  background: "#6f8a5e", border: "none", padding: "18px 46px", borderRadius: 999,
                  boxShadow: "0 5px 0 #566d48, 0 9px 16px rgba(60,50,20,.2)", cursor: "pointer" }}>Let&apos;s grow</button>
            </div>
          </div>
        </div>
      )}

      {modal === "log" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Garden diary</h2>
            <ul className="log-list">{state.log.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <div className="modal-actions"><button className="btn btn-cream" style={{ padding: "14px 28px", fontSize: 18 }} onClick={() => setModal(null)}>Close</button></div>
          </div>
        </div>
      )}

      {modal === "win" && (
        <div className="overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <h2>You grew the whole rainbow! 🌈</h2>
            <p>Every color bloomed in <b>{state.day} days</b>. A beautiful garden.</p>
            <div className="win-flowers">{RAINBOW.map((c, i) => <img key={c.name} src={bloomSrc(c.name)} alt={c.label} style={{ animationDelay: `${i * 0.08}s` }} />)}</div>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-green" style={{ padding: "15px 34px", fontSize: 20 }} onClick={() => { dispatch({ type: "reset" }); setModal(null); }}>Play again</button>
              <button className="btn btn-cream" style={{ padding: "15px 30px", fontSize: 18 }} onClick={() => setModal(null)}>Keep admiring</button>
            </div>
          </div>
        </div>
      )}
    </Stage>
  );
}
