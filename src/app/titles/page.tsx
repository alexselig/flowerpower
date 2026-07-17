"use client";

import { useSyncExternalStore } from "react";
import TitleTimeline from "@/components/titles/TitleTimeline";
import TitleArch from "@/components/titles/TitleArch";
import TitleWheel from "@/components/titles/TitleWheel";
import TitleTwilight from "@/components/titles/TitleTwilight";

const VARIANTS: Record<string, { label: string; C: (p: { onPlay: () => void }) => React.ReactNode }> = {
  a: { label: "A · Growth Timeline", C: TitleTimeline },
  b: { label: "B · Rainbow Arch", C: TitleArch },
  c: { label: "C · Color Wheel", C: TitleWheel },
  d: { label: "D · Twilight Garden", C: TitleTwilight },
};

// Read the ?v= query param without setState-in-effect and without hydration
// mismatch: server snapshot is always "menu", client reads the real value.
const noopSubscribe = () => () => {};
function useVariant(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const q = new URLSearchParams(window.location.search).get("v");
      return q && VARIANTS[q] ? q : "menu";
    },
    () => "menu",
  );
}

export default function TitlesPreview() {
  const v = useVariant();

  if (v !== "menu") {
    const { C } = VARIANTS[v];
    return <C onPlay={() => {}} />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 18, fontFamily: "system-ui", background: "#efe7d6", color: "#4a4331" }}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>FlowerPower — title screen options</div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 }}>
        {Object.entries(VARIANTS).map(([k, { label }]) => (
          <a key={k} href={`?v=${k}`} style={{ padding: "14px 22px", borderRadius: 12, background: "#6f8a5e",
            color: "#fbf7ee", fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 0 #566d48" }}>{label}</a>
        ))}
      </div>
    </div>
  );
}
