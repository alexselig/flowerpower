// Prefix public asset paths with the configured base path so they resolve
// correctly when the app is served from a sub-path (e.g. GitHub Pages project
// site at /flowerpower/). Empty in local dev, set at build via NEXT_PUBLIC_BASE_PATH.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string): string => `${BASE_PATH}${path}`;

export const bloomSrc = (color: string): string => asset(`/sprites/bloom_${color}.png`);
