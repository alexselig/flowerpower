# FlowerPower 🌸🌈 — COMPLETE

A cozy dahlia-growing game. Grow flowers by balancing **sun + water**; the
sun:water balance during growth decides the bloom **color/variety**. Collect all
**7 rainbow colors** to win. Cozy gouache art. Animated "FlowerPower" title screen.

## Run it
```
cd ~/flowerpower
npm run dev        # then open the printed http://localhost:<port>
```
Static build (deployable anywhere, incl. VibeHub): `npx next build` → `out/`.

## Stack
- Next.js 16.2 (app router, `output: "export"`), React 19, Tailwind v4, TypeScript.
- Fonts: Cormorant Garamond (display, italic) + Nunito (body) via next/font.
- Pure game logic: `src/lib/game.ts` (no React — unit/sim-testable).
- Sprite mapping: `src/lib/sprites.ts`. Art in `public/sprites/`.
- UI: `src/components/Game.tsx` + `src/components/TitleScreen.tsx`.
- Layout: `src/components/Stage.tsx` — fixed 16:9 design canvas (1280×720 title,
  1920×1080 game) scaled contain-to-fit + centered, so it never clips at any size.

## How it plays
- 6 beds. Plant a seed; it grows through **6 stages**, each shown with its own
  gouache sprite: seed (in soil) → sprout → seedling → bud → **opening** (colored
  partial bloom) → full bloom.
- A plant only grows on a day it gets **both** sun and water. Weather sets sun
  (Sunny 3 / Partly 2 / Cloudy 1 / Rainy 0 = rest). Watering can refills daily.
- Color = sun:water balance on growth days (locked when it starts opening):
  sun-heavy → warm (red/orange/yellow), even → green, water-heavy → cool
  (blue/indigo/violet). Each color is a distinct dahlia variety.
- A **predicted-color tag** floats over each growing plant's Water button (◎ =
  heading toward, ✓ = locked in), so you can steer the color as it grows.
- A sunny day with no water scorches a seedling (2 days → wilts).

## Art pipeline (scratch dir: ~/dahlia-game)
- Gemini `gemini-2.5-flash-image` gouache, style-anchored to `previews-gemini/dahlia_gouache.png`.
- `gen_varieties2.js` (7 blooms + 7 openings), `gen_fix_warm.js` / `gen_fix_green.js` (distinct forms),
  `process_varieties.js` (flood-fill background removal → transparent sprites), then copied to `public/sprites/`.

## Verified
- `npx next build` → exit 0 (static export).
- Logic sim `npx tsx sim.ts`: 300 games, **100% win**, **93.6% color control**, all 7 reachable, median 16 days.
- UI playtest (Puppeteer, ~/dahlia-game/playtest2.js): full click-through to win 7/7,
  **0 console/page errors**. Screenshots in ~/dahlia-game/shots2/.
- Responsive: contain-scales with no clipping at 1024×768 → 2560×1440 (respcheck.js).

## Design redesign (handoff: ~/Downloads/design_handoff_flowerpower)
- Storybook/botanical restyle: warm cream + sky gradient, Cormorant Garamond wordmark
  ("Flower" ink / "Power" terracotta), pressed-shadow buttons, shared soil-band bed.
- Title = direction 1a "arc bouquet" of all 7 dahlias.
- Flowers render **fully** (no clip/mask) per explicit override: hi-res 707×992 sprites
  in a non-clipped layer, anchored at the soil line.
