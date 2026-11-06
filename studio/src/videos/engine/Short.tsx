// The short, active episode (@ep) (post chain = the cartoon-3d-short template, unchanged).
// Template notes:
// One three.js world (world.ts) posed per frame from the story timeline (story.ts). Post chain (look-match pass):
//   InkPass (world ink lines, own pass) -> lens blur pre + main (thin-lens DOF per shot from dofAt) ->
//   [bloom (emissive only) + NEUTRAL tone mapping + colour grade] (one merged EffectPass), MSAA 4.
// Ink runs before the DOF so lines blur with what they belong to; bloom after the DOF so glows defocus with their
// source; the grade is display-referred, so it comes after tone mapping. Every pixel-sized parameter is specified at
// 1080x1920 and scaled with the output size, so stills at --scale 0.5 and the 1440x2560 final match.
// Place changes crossfade by stacking a second canvas for the fade frames; the hook ends on a 4-frame white flash.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, cancelRender, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World } from "./world";
import { loadProps } from "./sets";
import { base } from "./lights";
import { stagingQA } from "./qa";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { TOTAL, FLASH_AT, FPS, SHOTS, CAPTION_STOPS, layersAt, dofAt, shotAt, noGreenAt } from "./story";
import { NoGreenEffect } from "./nogreen";
import { Insert } from "@ep/inserts";
import { chunk, phraseAt } from "./captions";
import words from "@ep/words";

const STOPS = new Set(CAPTION_STOPS.map((s) => words.findIndex((w) => w.text === s))); // the episode's forced phrase breaks
const PHRASES = chunk(words.map((w, i) => (STOPS.has(i) ? { ...w, stop: true } : w)));

export const SHORT_FRAMES = TOTAL;

/** A/B switches for test stills only (Remotion inputProps `{ post: { ink: false, ... } }`); everything is on by default. */
type PostToggles = { inkMask?: boolean; cast: boolean; ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ cast: true, ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

/** Bloom for emissive sources only (depth.md 6.4). Its MIP chain always starts at 540x960 (half of 1080x1920),
 *  whatever the output size, so the glow keeps the same size relative to the frame (e-fold ~30 px at 1080p,
 *  ~1.5 % of the frame height) at 540, 1080 and 1440 widths. ADD blend: HDR-safe (SCREEN darkens values > 1). */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();
/** scripts/staging_qa.mjs: inputProps `{ qa: true }` logs the shot list and the staging measurements of every rendered layer */
const QA = !!(getInputProps() as { qa?: boolean }).qa;

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    nogreen: new NoGreenEffect(),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }), // film grain, OFF by default (inputProps post.grain): the reference measures no grain and it quadruples the file size
  }), [camera, scene]);
  // postprocessing 6.36 Pass may lack dispose(): guard so crossfade unmounts do not crash the render
  useEffect(() => () => (fx.ink as { dispose?: () => void }).dispose?.(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      {on.ink ? <primitive object={fx.ink} dispose={null} /> : null}
      {on.lens && on.pre ? <primitive object={fx.lens.pre} dispose={null} /> : null}
      {on.lens ? <primitive object={fx.lens.main} dispose={null} /> : null}
      {on.bloom ? <primitive object={fx.bloom} dispose={null} /> : null}
      <primitive object={fx.tone} dispose={null} />
      {on.grade ? <primitive object={fx.grade} dispose={null} /> : null}
      <primitive object={fx.nogreen} dispose={null} />
      {on.grain ? <primitive object={fx.grain} dispose={null} /> : null}
    </EffectComposer>
  ), [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  if (!on.cast) world.hideCast(); // scripts/temporal_qa.mjs measures the static world alone
  noInkFallback(world.root);
  if (QA) {
    console.warn("QASHOTS " + JSON.stringify(SHOTS.map((s) => [s.id, s.a, s.b])));
    console.warn("QA " + JSON.stringify(stagingQA(world, id, f, cam, scene.fog as THREE.Fog | null)));
  }
  // thin-lens focus: distance along the view axis to the shot's focus point (default: the camera's look target)
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, base(SHOTS[id - 1].light));
  { const g = noGreenAt(f); fx.nogreen.set(g.amt, g.wipe); }
  fx.grain.seed = f; // deterministic per frame
  fx.ink.debug = on.inkMask ? 1 : 0; // scripts/look_qa.py: ink mask only, for the speckle count
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size (R3F clamps dpr to >= 1 by default) */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => SHOTS[id - 1].insert ? (
  <AbsoluteFill style={{ opacity: alpha }}><Insert id={id} /></AbsoluteFill>
) : (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 1500 }}>
      <Inner id={id} />
    </ThreeCanvas>
  </AbsoluteFill>
);

/** caption block at ~2/3 height: above the Shorts title/buttons, below the faces; the spoken word turns yellow */
const Captions: React.FC<{ t: number; top: boolean }> = ({ t, top }) => {
  const ph = phraseAt(PHRASES, t);
  if (!ph) return null;
  return (
    <AbsoluteFill style={{ top: top ? 110 : 1290, height: 300, padding: "0 90px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontFamily: '"Segoe UI Black", "Segoe UI", Arial, sans-serif', fontWeight: 900, fontSize: 100, lineHeight: 1.12, color: "#ffffff",
        WebkitTextStroke: "18px #1d1a3a", paintOrder: "stroke fill", textShadow: "0 9px 0 rgba(29,26,58,0.6)", letterSpacing: 1 }}>
        {ph.map((w, i) => {
          const on = t >= w.start - 0.03;
          const pop = on ? 1 + 0.08 * Math.max(0, 1 - (t - w.start) / 0.12) : 1;
          return <span key={i} style={{ color: on && t < w.end + 0.15 ? "#5ce1ff" : "#ffffff", display: "inline-block", transform: `scale(${pop})`, margin: "0 20px" }}>{/* 20px: the 16px stroke swallowed 12px gaps ("asubscription", r13) */}{w.text}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** World builds its sets synchronously, so the prop GLBs must be loaded before the first canvas mounts */
const useProps = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("set props"));
  useEffect(() => { loadProps().then(() => { setReady(true); continueRender(handle); }, (e) => cancelRender(e)); }, [handle]);
  return ready;
};

export const Short: React.FC = () => {
  const f = useCurrentFrame();
  if (!useProps()) return null;
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} alpha={l.alpha} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      {(getInputProps() as { captions?: boolean }).captions !== false && <Captions t={f / FPS} top={shotAt(f).cap === "top"} />}
    </AbsoluteFill>
  );
};
