// What If ep06 explanation inserts: one file per card (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { Invoice, Test, Market } from "./ins_money";
import { Trash, Dolphin } from "./ins_brain";

const MAP: Record<string, React.FC<{ t: number }>> = { invoice: Invoice, test: Test, market: Market, trash: Trash, dolphin: Dolphin };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
