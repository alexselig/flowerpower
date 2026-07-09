// FlowerPower — pure game logic (no React). Fully unit-testable / simulatable.
//
// A dahlia grows only on days it gets BOTH sun and water. The running balance
// of sun vs. water decides its bloom COLOR (and thus its variety): sun-heavy ->
// warm hues (red/orange/yellow), water-heavy -> cool hues (blue/indigo/violet),
// balanced -> green. Collect all 7 colors to win.

export type ColorName =
  | "red" | "orange" | "yellow" | "green" | "blue" | "indigo" | "violet";

export interface RainbowColor { name: ColorName; label: string; hex: string; variety: string; labelHex?: string; }

// Each color is a distinct real dahlia form. hex = accent dot; labelHex = name text.
export const RAINBOW: RainbowColor[] = [
  { name: "red",    label: "Red",    hex: "#b4503f", variety: "Cactus" },
  { name: "orange", label: "Orange", hex: "#c9793f", variety: "Peony" },
  { name: "yellow", label: "Yellow", hex: "#c9a24a", variety: "Ball", labelHex: "#b5902f" },
  { name: "green",  label: "Green",  hex: "#7c9152", variety: "Waterlily", labelHex: "#6b8148" },
  { name: "blue",   label: "Blue",   hex: "#5b84ab", variety: "Anemone" },
  { name: "indigo", label: "Indigo", hex: "#5e5aa6", variety: "Collarette" },
  { name: "violet", label: "Violet", hex: "#8f5a9c", variety: "Star" },
];

export type Weather = "sunny" | "partly" | "cloudy" | "rainy";

export interface WeatherInfo { sun: number; rain: number; label: string; emoji: string; }

export const WEATHER: Record<Weather, WeatherInfo> = {
  sunny:  { sun: 3, rain: 0, label: "Sunny",        emoji: "☀️" },
  partly: { sun: 2, rain: 0, label: "Partly Sunny", emoji: "⛅" },
  cloudy: { sun: 1, rain: 0, label: "Cloudy",       emoji: "☁️" },
  rainy:  { sun: 0, rain: 2, label: "Rainy",        emoji: "🌧️" },
};

const WEATHER_BAG: Weather[] = [
  "sunny", "sunny", "sunny",
  "partly", "partly", "partly",
  "cloudy", "cloudy",
  "rainy", "rainy",
];

export type Stage =
  | "empty" | "seed" | "sprout" | "seedling" | "bud" | "opening" | "bloom" | "dead";

// The 6-stage growth ladder (seed -> ... -> bloom).
export const GROW_ORDER: Stage[] = ["seed", "sprout", "seedling", "bud", "opening", "bloom"];
export const TOTAL_STAGES = 6;

// growthDays (good sun+water days) at which each stage begins.
export const STAGE_START: Record<string, number> = {
  seed: 0, sprout: 1, seedling: 2, bud: 3, opening: 4, bloom: 6,
};

export const STAGE_LABEL: Record<Stage, string> = {
  empty: "Empty", seed: "Seed", sprout: "Sprout", seedling: "Seedling",
  bud: "Bud", opening: "Opening", bloom: "Bloom", dead: "Wilted",
};

const STAGE_EVENT: Partial<Record<Stage, string>> = {
  sprout: "🌱 Plot {n} sprouted!",
  seedling: "🌿 Plot {n} unfurled its first leaves.",
  bud: "🌱 Plot {n} formed a flower bud.",
  opening: "🌼 Plot {n}'s bud is starting to open…",
};

export interface Plot {
  id: number;
  stage: Stage;
  waterToday: number;   // water the player added today (+ rain resolves at day end)
  sunTotal: number;     // accumulated sun over this plant's life
  waterTotal: number;   // accumulated water over this plant's life
  growthDays: number;   // number of "good" (sun+water) days so far
  dryStreak: number;    // consecutive scorched (sun, no water) days
  bloomColor?: ColorName;
  justChanged?: Stage;   // transient: the stage a plot advanced to this turn (UI pings)
}

export interface GameState {
  day: number;
  weather: Weather;         // TODAY's weather (resolves when you press Next Day)
  waterLeft: number;        // watering-can charges left today
  plots: Plot[];
  collected: ColorName[];   // unique rainbow colors bloomed so far
  won: boolean;
  log: string[];            // newest-first feed of events
}

export const CONFIG = {
  NUM_PLOTS: 7,
  CAN_CAPACITY: 20,          // water charges per day (shared across plots)
  MAX_WATER_PER_PLOT: 5,     // water range exceeds max daily sun (3) so cool colors are reachable
  DRY_DEATH: 2,              // consecutive scorched days before the plant dies
};

// ---- color from the sun:water balance -----------------------------------
// ratio = sun / (sun + water) in [0,1]; higher = more sun = warmer.
export function colorFromRatio(r: number): ColorName {
  if (r >= 0.620) return "red";
  if (r >= 0.560) return "orange";
  if (r >= 0.515) return "yellow";
  if (r >= 0.485) return "green";
  if (r >= 0.440) return "blue";
  if (r >= 0.380) return "indigo";
  return "violet";
}

export function plotRatio(p: Plot): number | null {
  const t = p.sunTotal + p.waterTotal;
  return t <= 0 ? null : p.sunTotal / t;
}

export function predictedColor(p: Plot): ColorName | null {
  const r = plotRatio(p);
  return r == null ? null : colorFromRatio(r);
}

const GROWING: Stage[] = ["seed", "sprout", "seedling", "bud", "opening"];
export const isGrowing = (p: Plot) => GROWING.includes(p.stage);

export function stageForGrowthDays(g: number): Stage {
  let s: Stage = "seed";
  for (const st of GROW_ORDER) if (g >= STAGE_START[st]) s = st;
  return s;
}

// 1..6 for a growing/bloomed plant, 0 otherwise (for "Stage X of 6").
export function growthStageIndex(p: Plot): number {
  const i = GROW_ORDER.indexOf(p.stage);
  return i < 0 ? 0 : i + 1;
}

// 0..1 progress toward the next stage.
export function stageProgress(p: Plot): number {
  if (p.stage === "bloom") return 1;
  if (!isGrowing(p)) return 0;
  const idx = GROW_ORDER.indexOf(p.stage);
  const lo = STAGE_START[p.stage];
  const hi = STAGE_START[GROW_ORDER[idx + 1]];
  return Math.max(0, Math.min(1, (p.growthDays - lo) / (hi - lo)));
}

export function emptyPlot(id: number): Plot {
  return { id, stage: "empty", waterToday: 0, sunTotal: 0, waterTotal: 0, growthDays: 0, dryStreak: 0 };
}

export function pickWeather(rng: () => number = Math.random): Weather {
  return WEATHER_BAG[Math.floor(rng() * WEATHER_BAG.length)];
}

export function initGame(rng: () => number = Math.random): GameState {
  return {
    day: 1,
    weather: pickWeather(rng),
    waterLeft: CONFIG.CAN_CAPACITY,
    plots: Array.from({ length: CONFIG.NUM_PLOTS }, (_, i) => emptyPlot(i)),
    collected: [],
    won: false,
    log: ["Welcome to your garden! Tap an empty bed to plant a seed. 🌱"],
  };
}

// ---- actions -------------------------------------------------------------
export type Action =
  | { type: "plant"; plotId: number }
  | { type: "water"; plotId: number }
  | { type: "clear"; plotId: number }
  | { type: "nextDay"; rng?: () => number }
  | { type: "reset"; rng?: () => number };

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "reset":
      return initGame(action.rng);

    case "plant": {
      const plots = state.plots.map((p) =>
        p.id === action.plotId && p.stage === "empty"
          ? { ...emptyPlot(p.id), stage: "seed" as Stage, justChanged: "seed" as Stage }
          : p
      );
      return { ...state, plots, log: prepend(state.log, "You planted a seed. 🌰") };
    }

    case "water": {
      if (state.waterLeft <= 0) return state;
      const target = state.plots.find((p) => p.id === action.plotId);
      if (!target || !isGrowing(target) || target.waterToday >= CONFIG.MAX_WATER_PER_PLOT) return state;
      const plots = state.plots.map((p) =>
        p.id === action.plotId ? { ...p, waterToday: p.waterToday + 1 } : p
      );
      return { ...state, plots, waterLeft: state.waterLeft - 1 };
    }

    case "clear": {
      const target = state.plots.find((p) => p.id === action.plotId);
      if (!target || (target.stage !== "bloom" && target.stage !== "dead")) return state;
      const plots = state.plots.map((p) => (p.id === action.plotId ? emptyPlot(p.id) : p));
      return { ...state, plots };
    }

    case "nextDay":
      return resolveDay(state, action.rng ?? Math.random);
  }
}

// Resolve TODAY's growth (using today's weather), then advance to a new day.
export function resolveDay(state: GameState, rng: () => number = Math.random): GameState {
  const info = WEATHER[state.weather];
  const events: string[] = [];
  const collected = [...state.collected];

  const plots = state.plots.map((p) => {
    const cleared: Plot = { ...p, justChanged: undefined };
    if (!isGrowing(cleared)) return { ...cleared, waterToday: 0 };

    const sun = info.sun;
    const water = cleared.waterToday + info.rain;
    const np: Plot = { ...cleared };

    const hasSun = sun >= 1;
    const hasWater = water >= 1;

    if (hasSun && hasWater) {
      // Color is decided only by the balance on real growth days, so the player
      // stays fully in control (rain / rest days never skew the final hue).
      np.sunTotal += sun;
      np.waterTotal += water;
      np.growthDays += 1;
      np.dryStreak = 0;
    } else if (hasSun && !hasWater) {
      np.dryStreak += 1;
    } else {
      np.dryStreak = 0; // rainy / no-sun day: the plant rests and won't dry out
    }

    if (np.dryStreak >= CONFIG.DRY_DEATH) {
      np.stage = "dead";
      np.justChanged = "dead";
      np.waterToday = 0;
      events.push(`🥀 The seedling in plot ${np.id + 1} dried out. Clear the bed and try again.`);
      return np;
    }

    const target = stageForGrowthDays(np.growthDays);
    if (target !== np.stage) {
      np.stage = target;
      np.justChanged = target;
      // Lock the color in as the flower starts to open, so the partially-open
      // sprite and the full bloom always show the same color.
      if (target === "opening" && !np.bloomColor) {
        np.bloomColor = colorFromRatio(np.sunTotal / (np.sunTotal + np.waterTotal));
      }
      if (target === "bloom") {
        if (!np.bloomColor) {
          np.bloomColor = colorFromRatio(np.sunTotal / (np.sunTotal + np.waterTotal));
        }
        const color = np.bloomColor;
        const rc = RAINBOW.find((c) => c.name === color)!;
        if (!collected.includes(color)) {
          collected.push(color);
          events.push(`🌸 A ${rc.label} ${rc.variety} dahlia bloomed — new color for your rainbow!`);
        } else {
          events.push(`🌸 A ${rc.label} ${rc.variety} dahlia bloomed (you already have ${rc.label}).`);
        }
      } else {
        const msg = STAGE_EVENT[target];
        if (msg) events.push(msg.replace("{n}", String(np.id + 1)));
      }
    }
    np.waterToday = 0;
    return np;
  });

  const won = RAINBOW.every((c) => collected.includes(c.name));
  if (won && !state.won) events.push("🌈 You grew the whole rainbow — you win!");

  const nextWeather = pickWeather(rng);
  const dayMsg = `— Day ${state.day + 1}: ${WEATHER[nextWeather].label} ${WEATHER[nextWeather].emoji} —`;

  return {
    day: state.day + 1,
    weather: nextWeather,
    waterLeft: CONFIG.CAN_CAPACITY,
    plots,
    collected,
    won,
    log: prepend(state.log, ...[...events, dayMsg]),
  };
}

function prepend(log: string[], ...items: string[]): string[] {
  return [...items.reverse(), ...log].slice(0, 40);
}

export function neededColors(state: GameState): ColorName[] {
  return RAINBOW.filter((c) => !state.collected.includes(c.name)).map((c) => c.name);
}
