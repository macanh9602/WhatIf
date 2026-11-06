// What If ep11 explanation inserts: one file per topic (ins_*.tsx), helpers in kit.tsx.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { FPS } from "./kit";
import { Leaf } from "./ins_leaf";
import { Brain } from "./ins_brain";
import { Slug, Growth } from "./ins_slug";

const MAP: Record<string, React.FC<{ t: number }>> = { leaf: Leaf, brain: Brain, slug: Slug, growth: Growth };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
