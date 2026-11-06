// What If ep10 explanation inserts: one file per card (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { Flipbook } from "./ins_draw";
import { Squash, Volume, Real } from "./ins_squash";

const MAP: Record<string, React.FC<{ t: number }>> = { flipbook: Flipbook, squash: Squash, volume: Volume, real: Real };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
