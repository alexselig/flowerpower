"use client";

import { useEffect, useState, type ReactNode } from "react";

// Renders children on a fixed design-sized canvas (e.g. 1920x1080), scaled to
// fit the viewport (contain) and centered, with the page gradient behind.
export default function Stage({
  w, h, background, children,
}: {
  w: number; h: number; background?: string; children: ReactNode;
}) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / w, window.innerHeight / h));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [w, h]);

  return (
    <div className="stage-wrap">
      <div className="stage" style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${scale})`, background }}>
        {children}
      </div>
    </div>
  );
}
