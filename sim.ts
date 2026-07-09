// Automated playtest for FlowerPower. Drives the REAL reducer to verify:
//  1) every rainbow color is reachable,
//  2) a smart player can win within a reasonable number of days,
//  3) color steering is controllable (targeting color C usually yields C).
//
// Run: npx tsx sim.ts
import {
  initGame, reducer, neededColors, isGrowing, RAINBOW, CONFIG,
  type GameState, type ColorName, type Plot,
} from "./src/lib/game";

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TARGET_CENTER: Record<ColorName, number> = {
  red: 0.72, orange: 0.59, yellow: 0.5375, green: 0.5,
  blue: 0.4625, indigo: 0.41, violet: 0.30,
};

interface Outcome { won: boolean; days: number; targetHits: number; targetTotal: number; produced: Set<ColorName>; }

function playGame(seed: number, maxDays: number): Outcome {
  const rng = mulberry32(seed);
  let state: GameState = initGame(rng);
  const targets = new Map<number, ColorName>();
  const produced = new Set<ColorName>();
  let targetHits = 0, targetTotal = 0;

  const WEATHER_SUN: Record<string, number> = { sunny: 3, partly: 2, cloudy: 1, rainy: 0 };
  const WEATHER_RAIN: Record<string, number> = { sunny: 0, partly: 0, cloudy: 0, rainy: 2 };

  while (!state.won && state.day <= maxDays) {
    // 1) clear finished/dead beds
    for (const p of state.plots) {
      if (p.stage === "bloom" || p.stage === "dead") {
        if (p.stage === "bloom" && p.bloomColor) {
          produced.add(p.bloomColor);
          const want = targets.get(p.id);
          if (want) { targetTotal++; if (want === p.bloomColor) targetHits++; }
        }
        targets.delete(p.id);
        state = reducer(state, { type: "clear", plotId: p.id });
      }
    }
    // 2) plant empty beds, assigning a needed, untargeted color
    for (const p of state.plots) {
      if (p.stage !== "empty") continue;
      const need = neededColors(state);
      const live = new Set(targets.values());
      const pick = need.find((c) => !live.has(c)) ?? need[0] ?? "green";
      state = reducer(state, { type: "plant", plotId: p.id });
      targets.set(p.id, pick as ColorName);
    }
    // 3) allocate water
    const sun = WEATHER_SUN[state.weather];
    const rain = WEATHER_RAIN[state.weather];
    const growing = state.plots.filter(isGrowing);
    const desired = new Map<number, number>();
    for (const p of growing) {
      const t = TARGET_CENTER[targets.get(p.id) ?? "green"];
      const S = p.sunTotal + sun, W = p.waterTotal;
      let dTotal = (S * (1 - t)) / t - W;     // total water today to hit ratio t
      let dPlayer = Math.round(dTotal - rain);
      dPlayer = Math.max(0, Math.min(CONFIG.MAX_WATER_PER_PLOT, dPlayer));
      const minW = sun >= 1 && rain === 0 ? 1 : 0; // avoid scorch
      dPlayer = Math.max(dPlayer, minW);
      desired.set(p.id, dPlayer);
    }
    // Phase 1: protect at-risk plants (need >=1 and none yet)
    for (const p of growing) {
      if (state.waterLeft <= 0) break;
      if (sun >= 1 && rain === 0) state = reducer(state, { type: "water", plotId: p.id });
    }
    // Phase 2: fill toward desired, prioritizing plants closest to bloom
    let guard = 200;
    while (state.waterLeft > 0 && guard-- > 0) {
      let best: Plot | null = null; let bestScore = -1;
      for (const p of state.plots) {
        if (!isGrowing(p)) continue;
        const want = desired.get(p.id) ?? 0;
        if (p.waterToday >= want) continue;
        const score = p.growthDays + p.waterToday * 0.01;
        if (score > bestScore) { bestScore = score; best = p; }
      }
      if (!best) break;
      const before = state.waterLeft;
      state = reducer(state, { type: "water", plotId: best.id });
      if (state.waterLeft === before) break;
    }
    // 4) advance the day
    state = reducer(state, { type: "nextDay", rng });
  }
  // count colors still on plots at win time
  for (const p of state.plots) if (p.stage === "bloom" && p.bloomColor) produced.add(p.bloomColor);
  return { won: state.won, days: state.day, targetHits, targetTotal, produced };
}

// ---- run the suite ----
const N = 300, MAX_DAYS = 90;
let wins = 0; const dayList: number[] = [];
const everProduced = new Set<ColorName>();
let hits = 0, total = 0;
for (let s = 1; s <= N; s++) {
  const o = playGame(s * 2654435761, MAX_DAYS);
  if (o.won) { wins++; dayList.push(o.days); }
  o.produced.forEach((c) => everProduced.add(c));
  hits += o.targetHits; total += o.targetTotal;
}
dayList.sort((a, b) => a - b);
const median = dayList.length ? dayList[Math.floor(dayList.length / 2)] : NaN;
const p90 = dayList.length ? dayList[Math.floor(dayList.length * 0.9)] : NaN;

console.log("=== FlowerPower automated playtest ===");
console.log(`games:            ${N}`);
console.log(`win rate:         ${((wins / N) * 100).toFixed(1)}%  (within ${MAX_DAYS} days)`);
console.log(`days to win:      median ${median}, p90 ${p90}, fastest ${dayList[0] ?? "-"}`);
console.log(`color steering:   ${total ? ((hits / total) * 100).toFixed(1) : "0"}% of targeted plants bloomed the intended color`);
const missing = RAINBOW.filter((c) => !everProduced.has(c.name)).map((c) => c.name);
console.log(`colors reachable: ${everProduced.size}/7 ${missing.length ? "MISSING " + missing.join(",") : "(all)"}`);

const ok = wins / N >= 0.85 && everProduced.size === 7;
console.log(ok ? "\nRESULT: PASS ✅" : "\nRESULT: NEEDS TUNING ❌");
process.exit(ok ? 0 : 1);
