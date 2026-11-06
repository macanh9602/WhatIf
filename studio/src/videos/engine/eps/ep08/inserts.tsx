// What If ep08 explanation inserts: one file per card (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { Heavy, Thin } from "./ins_breath";
import { Radiator, Faster } from "./ins_heat";

const MAP: Record<string, React.FC<{ t: number }>> = { heavy: Heavy, thin: Thin, radiator: Radiator, faster: Faster };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
