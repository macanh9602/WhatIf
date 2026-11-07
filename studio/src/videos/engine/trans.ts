// Shot transitions as one post pass (What If, 2026-11-07). One shot renders per frame, so a transition is an OUT half on
// the last dur/2 frames of the outgoing shot + an IN half on the first dur/2 frames of the incoming one, both driven by
// transAt(f) (story.ts, from the episode's optional TRANS export). p = 1 at the cut (fully closed / blurred / white).
//   iris     circle closes on (cx, cy) (uv, y up), black outside; opens again from the same point
//   zoom     scale + radial blur into (cx, cy) on the way out, settles out of it on the way in
//   whip     horizontal slide + directional motion blur: outgoing leaves to the left, incoming arrives from the right
//   dipWhite / dipBlack
// Display-referred (after the grade). CONVOLUTION: it samples its input at other UVs, so R3F gives it its own EffectPass.
// Short.tsx mounts it only on shots that take part in a transition (episodes without TRANS render exactly as before).
import { Effect, EffectAttribute, BlendFunction } from "postprocessing";
import { Uniform, Vector2 } from "three";

export type TransKind = "iris" | "zoom" | "whip" | "dipWhite" | "dipBlack";
export const TRANS_KINDS: TransKind[] = ["iris", "zoom", "whip", "dipWhite", "dipBlack"];

const frag = /* glsl */ `
uniform float trKind;   // 0 none, 1 + index in TRANS_KINDS
uniform float trP;      // 0 open .. 1 closed (eased)
uniform float trSide;   // -1 outgoing half, +1 incoming half
uniform vec2 trC;
vec3 trTap(vec2 uv) { uv = 1.0 - abs(1.0 - mod(uv, 2.0)); return texture2D(inputBuffer, uv).rgb; } // mirror edges
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = inputColor.rgb;
  float p = trP, k = trKind;
  if (k < 0.5 || p <= 0.0) { outputColor = inputColor; return; }
  float asp = resolution.x / resolution.y;
  if (k < 1.5) {          // iris
    vec2 d = (uv - trC) * vec2(asp, 1.0);
    vec2 far = max(trC, 1.0 - trC) * vec2(asp, 1.0);
    float R = length(far) * (1.0 - p), px = 1.5 / resolution.y;
    c *= 1.0 - smoothstep(R - px, R + px, length(d));
  } else if (k < 2.5) {   // zoom-through
    float s = 1.0 + 2.2 * p, b = 0.35 * p;
    vec2 q = (uv - trC) / s;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 24; i++) acc += trTap(trC + q * (1.0 - b * float(i) / 23.0));
    c = acc / 24.0;
  } else if (k < 3.5) {   // whip
    float o = 0.55 * p * (trSide < 0.0 ? 1.0 : -1.0), w = 0.45 * p;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 32; i++) acc += trTap(vec2(uv.x + o + w * (float(i) / 31.0 - 0.5), uv.y));
    c = acc / 32.0;
  } else {                // dips
    c = mix(c, vec3(k < 4.5 ? 1.0 : 0.0), p);
  }
  outputColor = vec4(c, inputColor.a);
}`;

export class TransitionEffect extends Effect {
  constructor() {
    super("TransitionEffect", frag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([["trKind", new Uniform(0)], ["trP", new Uniform(0)], ["trSide", new Uniform(-1)], ["trC", new Uniform(new Vector2(0.5, 0.5))]]),
    });
  }
  set(t: { kind: TransKind; p: number; side: number; cx: number; cy: number } | null) {
    const u = this.uniforms;
    u.get("trKind")!.value = t ? TRANS_KINDS.indexOf(t.kind) + 1 : 0;
    u.get("trP")!.value = t?.p ?? 0;
    u.get("trSide")!.value = t?.side ?? -1;
    (u.get("trC")!.value as Vector2).set(t?.cx ?? 0.5, t?.cy ?? 0.5);
  }
}
