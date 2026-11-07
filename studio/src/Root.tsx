import React from "react";
import { Composition } from "remotion";
import { Short, SHORT_FRAMES } from "./videos/engine/Short";
import { CastSheet } from "./videos/engine/CastSheet";

// Short = the active episode (@ep, scripts/ep.mjs). CastSheet = the episode's cast for approval (cast.ts CAST).
export const Root: React.FC = () => (
  <>
    <Composition id="Short" component={Short} durationInFrames={SHORT_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CastSheet" component={CastSheet} durationInFrames={1} fps={30} width={2400} height={2400} />
  </>
);
