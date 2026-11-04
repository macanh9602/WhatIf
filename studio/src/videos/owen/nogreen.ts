// "No green light exists" as one post effect (What If ep01). Works on linear, tone-mapped colour: the sRGB green
// primary is almost all 495-570 nm light, so removing that band ~= scaling G. White -> pink, leaves -> dark wine,
// yellow -> orange, and Rec.709 luma falls ~57 % (own CIE calc: green = 61 % of seen brightness), so the dimming is
// physical. `lift` re-exposes a little so the picture stays watchable.
// amt: 0 = normal world, 1 = no green. wipe: <0 = whole frame; 0..1 = the change sweeps down from the top edge
// (hook: forest turns black from the horizon).
import { Effect, BlendFunction } from "postprocessing";
import { Uniform } from "three";

const frag = /* glsl */ `
uniform float ngAmt;
uniform float ngWipe;
uniform float ngLift;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float a = ngAmt;
  if (ngWipe >= 0.0) { float t = 1.0 - ngWipe * 1.2; a *= smoothstep(t - 0.08, t + 0.08, uv.y); } // uv.y = 1 at the top
  vec3 c = inputColor.rgb;
  // a green-dominant surface reflected mostly green, so with no green it reflects almost nothing: leaves go black
  float greenness = clamp((c.g - max(c.r, c.b)) / max(c.g, 1e-3) * 4.0, 0.0, 1.0);
  vec3 n = vec3(c.r, c.g * 0.2, c.b) * ngLift * (1.0 - 0.9 * greenness);
  n = mix(n, vec3(dot(n, vec3(0.3333))), greenness); // no tint left on what was green
  outputColor = vec4(mix(c, n, a), inputColor.a);
}`;

export class NoGreenEffect extends Effect {
  constructor() {
    super("NoGreenEffect", frag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([["ngAmt", new Uniform(0)], ["ngWipe", new Uniform(-1)], ["ngLift", new Uniform(1.35)]]),
    });
  }
  set(amt: number, wipe = -1) {
    this.uniforms.get("ngAmt")!.value = amt;
    this.uniforms.get("ngWipe")!.value = wipe;
  }
}
