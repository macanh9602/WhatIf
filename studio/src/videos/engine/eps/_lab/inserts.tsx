import React from "react";
import { AbsoluteFill } from "remotion";
// _lab: one flat card to see the CSS transition fallback on 2D inserts
export const Insert: React.FC<{ id: number }> = () => (
  <AbsoluteFill style={{ background: "#f3e7ce", justifyContent: "center", alignItems: "center", fontSize: 160, fontWeight: 900, color: "#1d1a3a" }}>INSERT</AbsoluteFill>
);
