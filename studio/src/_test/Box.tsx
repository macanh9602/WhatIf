import React from "react";
import { AbsoluteFill, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";

const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
const ms = (getInputProps() as { ms?: number }).ms ?? 0;

export const BoxTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#cfe3f2" }}>
    <ThreeCanvas width={540} height={960} camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={1} />
      <mesh rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <EffectComposer multisampling={ms}>
        <primitive object={tone} dispose={null} />
      </EffectComposer>
    </ThreeCanvas>
  </AbsoluteFill>
);
