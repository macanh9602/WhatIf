// What If ep07 explanation inserts: one file per topic (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { CubeIns, Dust } from "./ins_scale";
import { Heat, Shrew } from "./ins_heat";

const MAP: Record<string, React.FC<{ t: number }>> = { cube: CubeIns, dust: Dust, heat: Heat, shrew: Shrew };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
