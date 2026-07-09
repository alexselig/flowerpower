import type { Plot } from "./game";
import { asset } from "./asset";

// Map a plot's current state to its gouache sprite.
export function spriteFor(p: Plot): string | null {
  switch (p.stage) {
    case "seed": return asset("/sprites/stage_seed.png");
    case "sprout": return asset("/sprites/stage_sprout.png");
    case "seedling": return asset("/sprites/stage_seedling.png");
    case "bud": return asset("/sprites/stage_bud.png");
    case "opening": return asset(`/sprites/opening_${p.bloomColor ?? "red"}.png`);
    case "bloom": return asset(`/sprites/bloom_${p.bloomColor ?? "red"}.png`);
    case "dead": return asset("/sprites/stage_seedling.png"); // shown with a wilt filter
    default: return null;
  }
}

// Visual height (px) in the shared flowerbed — anchored to the soil line so the
// plant appears to grow taller each stage. bloom == BED_FLOWER_H in Game.tsx.
export function plantHeight(p: Plot): number {
  switch (p.stage) {
    case "seed": return 64;
    case "sprout": return 104;
    case "seedling": return 132;
    case "bud": return 206;
    case "opening": return 234;
    case "bloom": return 252;
    case "dead": return 128;
    default: return 0;
  }
}
