// What If ep09 explanation inserts: one file per pair of cards (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { Flow, Guests } from "./ins_flow";
import { Crowd, Cloth } from "./ins_cells";

const MAP: Record<string, React.FC<{ t: number }>> = { flow: Flow, guests: Guests, crowd: Crowd, cloth: Cloth };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
