import React from "react";
import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { OwenShort, OWEN_FRAMES } from "./videos/owen/Owen";
import { BoxTest } from "./_test/Box";
import { CastSheet } from "./_test/CastSheet";
import { MotionTest, MOTION_FRAMES } from "./_test/MotionTest";
import { FaceSheet, FACE_ROWS } from "./_test/FaceSheet";

// BridgeShort = template gốc của skill cartoon-3d-short, giữ để đối chiếu look
export const Root: React.FC = () => (
  <>
    <Composition id="WhatIfShort" component={OwenShort} durationInFrames={OWEN_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="OwenShort" component={OwenShort} durationInFrames={OWEN_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="CastSheet" component={CastSheet} durationInFrames={60} fps={30} width={3000} height={3700} defaultProps={{readability: false}} calculateMetadata={({props}) => props.readability ? {width:1080,height:1920} : {width:3000,height:3700}} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MOTION_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FaceSheet" component={FaceSheet} durationInFrames={60} fps={30} width={3000} height={(FACE_ROWS + 1) * 330} />
    <Composition id="BoxTest" component={BoxTest} durationInFrames={30} fps={30} width={540} height={960} />
  </>
);

