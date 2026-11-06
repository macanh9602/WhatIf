// What If ep10 squash-and-stretch inserts: the bouncing ball (shot 10), a body flattened any way (shot 11), the real body
// that keeps its volume but does not bounce back (shot 12). Shape changes, area (volume) stays: rx * ry is constant.
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, DIM, GRN, LINE, NAVY, RED, Y } from "./kit";

const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
const R = 105; // the ball / bean "volume": rx * ry = R * R

/** the VOLUME gauge: always 100 %; `glow` 0..1 highlights it */
const Gauge: React.FC<{ x: number; y: number; glow?: number; t: number }> = ({ x, y, glow = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${1 + 0.08 * glow * Math.abs(Math.sin(t * 6))})`}>
    <rect x={-70} y={-250} width={140} height={420} rx={22} fill={NAVY} stroke={glow > 0.5 ? Y : LINE} strokeWidth={8} />
    <rect x={-48} y={-228} width={96} height={376} rx={12} fill={GRN} />
    <path d="M-48 -228 H48" stroke={Y} strokeWidth={8} />
    <Txt x={0} y={-275} s={40} c={glow > 0.5 ? Y : LINE}>VOLUME</Txt>
    <Txt x={0} y={225} s={50} c={Y}>100%</Txt>
  </g>
);
/** a ball with a highlight; feet on (x, floor), shape set by stretch s (s > 1 = tall) */
const Ball: React.FC<{ x: number; floor: number; lift: number; s: number; c?: string; face?: boolean }> = ({ x, floor, lift, s, c = RED, face }) => {
  const rx = R / Math.sqrt(s), ry = R * Math.sqrt(s), cy = floor - ry - lift;
  return (
    <g>
      <ellipse cx={x} cy={floor + 8} rx={rx * (1 - Math.min(0.6, lift / 900))} ry={14} fill="#000" opacity={0.25} />
      <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill={c} stroke={NAVY} strokeWidth={9} />
      <ellipse cx={x - rx * 0.35} cy={cy - ry * 0.4} rx={rx * 0.22} ry={ry * 0.16} fill="#fff" opacity={0.75} />
      {face && <><circle cx={x - rx * 0.28} cy={cy - ry * 0.1} r={9} fill={NAVY} /><circle cx={x + rx * 0.28} cy={cy - ry * 0.1} r={9} fill={NAVY} />
        <path d={`M${x - rx * 0.25} ${cy + ry * 0.25} Q${x} ${cy + ry * 0.45} ${x + rx * 0.25} ${cy + ry * 0.25}`} fill="none" stroke={NAVY} strokeWidth={7} strokeLinecap="round" /></>}
    </g>
  );
};
/** bounce: 0..1 cycle -> lift and stretch (squash wide at the floor, stretch tall on the way up) */
const bounce = (u: number, h = 520) => {
  const k = ((u % 1) + 1) % 1, lift = h * 4 * k * (1 - k), v = 1 - 2 * k; // v = upward speed
  const s = lift < 30 ? 0.55 + 0.45 * (lift / 30) : 1 + 0.45 * Math.abs(v) * (v > 0 ? 1 : 0.6);
  return { lift, s };
};

export const Squash: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 48.6, sq = W("squash", a0), st = W("stretch", a0), first = W("first", a0), one = W("one", a0);
  // the ball holds a squash on "squash", is fired up tall on "stretch", then bounces with both
  let b: { lift: number; s: number };
  if (t < sq - 0.35) b = bounce((t - a0) / 1.1, 380);
  else if (t < st - 0.05) { const k = c01((t - sq + 0.35) / 0.3); b = { lift: 380 * (1 - k) * (1 - k) * (k < 1 ? 1 : 0), s: k < 1 ? 1 + 0.3 * (1 - k) : 0.42 }; }
  else b = bounce((t - st + 0.05) / 1.25 + 0.0, 520);
  const rule = land(t, first), cond = land(t, one);
  return (
    <Frame t={t - a0} title="SQUASH AND STRETCH">
      <path d="M90 1060 H760" stroke={LINE} strokeWidth={8} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 220} 1090 L${150 + i * 220} 1060`} stroke={DIM} strokeWidth={5} />)}
      <Ball x={420} floor={1060} lift={b.lift} s={b.s} face />
      <Txt x={420} y={1150} s={46} c={b.s < 0.8 ? Y : DIM}>SQUASH</Txt>
      <Txt x={420} y={235} s={46} c={b.s > 1.2 ? Y : DIM}>STRETCH</Txt>
      <Gauge x={900} y={700} t={t} />
      <g transform={`translate(790 270) rotate(-8) scale(${rule * (1 + 0.3 * (1 - rule))})`}>
        <rect x={-150} y={-55} width={300} height={110} rx={20} fill={Y} stroke={NAVY} strokeWidth={8} />
        <text x={0} y={24} fontSize={66} fill={NAVY} textAnchor="middle" fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>RULE #1</text>
      </g>
      <g opacity={cond} transform={`translate(0 ${40 * (1 - cond)})`}>
        <rect x={570} y={1100} width={430} height={110} rx={22} fill={NAVY} stroke={Y} strokeWidth={8} />
        <Txt x={785} y={1175} s={52} c={Y}>1 CONDITION</Txt>
      </g>
    </Frame>
  );
};

/** a bean body; feet on the floor at (x, floor); sx * sy = 1 keeps its area */
const Bean: React.FC<{ x: number; floor: number; sx: number; sy: number; skew?: number; c?: string; eyes?: "dot" | "x" }> = ({ x, floor, sx, sy, skew = 0, c = RED, eyes = "dot" }) => (
  <g transform={`translate(${x} ${floor}) skewX(${skew}) scale(${sx} ${sy})`}>
    <rect x={-80} y={-300} width={160} height={300} rx={80} fill={c} stroke={NAVY} strokeWidth={9 / Math.sqrt(sx * sy)} vectorEffect="non-scaling-stroke" />
    <ellipse cx={0} cy={-215} rx={58} ry={46} fill="#fbf8f4" stroke={NAVY} strokeWidth={6} vectorEffect="non-scaling-stroke" />
    {eyes === "dot" ? <><circle cx={-20} cy={-220} r={8} fill={NAVY} /><circle cx={20} cy={-220} r={8} fill={NAVY} /></>
      : <path d="M-28 -228 L-12 -212 M-12 -228 L-28 -212 M12 -228 L28 -212 M28 -228 L12 -212" stroke={NAVY} strokeWidth={5} vectorEffect="non-scaling-stroke" />}
  </g>
);

export const Volume: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 56.3, flat = W("flatten", a0), way = W("way", a0), like = W("like", a0), vol = W("volume", a0), same = W("same", a0);
  // shape keys: normal -> flat (2.2 x .45) -> tall (.6 x 1.65) -> bent -> normal; sx * sy stays 1
  const keys: [number, number, number][] = [[a0, 1, 0], [flat - 0.15, 2.2, 0], [way - 0.1, 0.6, 0], [like - 0.1, 1, 28], [vol - 0.2, 1, 0]];
  let sx = 1, sk = 0;
  for (const [tk, x, k] of keys) { const e = at(t, tk, 0.25); sx += (x - sx) * e; sk += (k - sk) * e; }
  const press = at(t, flat - 0.4, 0.25) * (1 - at(t, flat + 0.35, 0.2)), glow = at(t, vol - 0.15, 0.15), stamp = land(t, same);
  return (
    <Frame t={t - a0} title="ANY SHAPE, SAME VOLUME">
      <path d="M90 1060 H740" stroke={LINE} strokeWidth={8} />
      <g transform={`translate(0 ${-420 + 420 * press + (1 - sx) * 0})`} opacity={press > 0.02 ? 1 : 0}>
        <rect x={250} y={500} width={340} height={70} rx={12} fill={DIM} stroke={NAVY} strokeWidth={8} />
        <rect x={395} y={330} width={50} height={170} fill={LINE} stroke={NAVY} strokeWidth={8} />
      </g>
      <Bean x={420} floor={1060} sx={sx} sy={1 / sx} skew={sk} />
      <Txt x={420} y={1150} s={46} c={CYAN}>{sx > 1.5 ? "FLAT" : sx < 0.75 ? "TALL" : Math.abs(sk) > 10 ? "BENT" : "BODY"}</Txt>
      <Gauge x={900} y={700} t={t} glow={glow} />
      <g opacity={stamp} transform={`translate(560 330) rotate(-10) scale(${1 + 0.6 * (1 - stamp)})`}>
        <rect x={-190} y={-70} width={380} height={140} rx={16} fill="none" stroke={Y} strokeWidth={12} />
        <Txt x={0} y={34} s={100} c={Y}>SAME</Txt>
      </g>
    </Frame>
  );
};

/** a plain grey "real" figure: head, body, five-finger hands; sitting (k = 1) after the drop */
const RealGuy: React.FC<{ x: number; floor: number; drop: number; sit: number }> = ({ x, floor, drop, sit }) => {
  const y = 0, legs = 230 * (1 - 0.55 * sit), G = "#9aa6bb";
  return (
    <g transform={`translate(${x} ${floor - drop}) scale(0.75) translate(0 ${y})`}>
      <path d={`M-30 ${-legs} L${-34 - 60 * sit} 0 M30 ${-legs} L${34 + 60 * sit} 0`} stroke={G} strokeWidth={42} strokeLinecap="round" />
      <path d={`M-30 ${-legs} L${-34 - 60 * sit} 0 M30 ${-legs} L${34 + 60 * sit} 0`} stroke={NAVY} strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      <rect x={-70} y={-legs - 250} width={140} height={260} rx={50} fill={G} stroke={NAVY} strokeWidth={8} />
      <path d={`M-70 ${-legs - 220} L-120 ${-legs - 60} M70 ${-legs - 220} L120 ${-legs - 60}`} stroke={G} strokeWidth={36} strokeLinecap="round" />
      {[-1, 1].map((s) => <g key={s}>{[-2, -1, 0, 1, 2].map((f) => <path key={f} d={`M${s * 120 + f * 7} ${-legs - 52} l${f * 5} 26`} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />)}</g>)}
      <ellipse cx={0} cy={-legs - 320} rx={62} ry={74} fill={G} stroke={NAVY} strokeWidth={8} />
      <path d={`M-24 ${-legs - 325} h16 M8 ${-legs - 325} h16`} stroke={NAVY} strokeWidth={7} strokeLinecap="round" />
      <path d={`M-18 ${-legs - 285} H18`} stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
      {sit > 0.9 && <rect x={-40} y={-legs - 395} width={80} height={24} rx={8} fill="#fbf8f4" stroke={NAVY} strokeWidth={5} transform={`rotate(-12 0 ${-legs - 383})`} />}
    </g>
  );
};

const LEDGE = 170;
export const Real: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 61.05, real = W("real", a0), too = W("too", a0), dn = W("doesn't", a0), bn = W("bounce", a0);
  const g1 = land(t, real), g2 = land(t, too), t0 = dn - 0.35, fallK = c01((t - t0) / 0.32), drop = LEDGE * (1 - fallK * fallK);
  const hitT = t0 + 0.32, after = Math.max(0, t - hitT);
  const ball = t < t0 ? { lift: LEDGE, s: 1 } : t < hitT ? { lift: drop, s: 1.15 } : bounce(after / 0.9 + 0.0, 300);
  const sit = c01(after / 0.15), stamp = land(t, bn + 0.1);
  return (
    <Frame t={t - a0} title="REAL BODIES DON'T BOUNCE">
      <path d="M80 1060 H1000" stroke={LINE} strokeWidth={8} />
      <Txt x={290} y={250} s={56} c={CYAN}>CARTOON</Txt>
      <Txt x={790} y={250} s={56} a={g1}>REAL</Txt>
      {t < t0 && [290, 790].map((x) => <rect key={x} x={x - 130} y={1060 - LEDGE} width={260} height={16} fill={DIM} stroke={NAVY} strokeWidth={5} />)}
      <Ball x={290} floor={1060} lift={ball.lift} s={ball.s} face />
      <g opacity={g1}><RealGuy x={790} floor={1060} drop={t < hitT ? drop : 0} sit={sit} /></g>
      <g transform="translate(290 345)"><rect x={-150} y={-40} width={300} height={80} rx={14} fill={NAVY} stroke={LINE} strokeWidth={6} /><Txt x={0} y={20} s={44} c={GRN}>VOL 100%</Txt></g>
      <g opacity={g2} transform="translate(790 345)"><rect x={-150} y={-40} width={300} height={80} rx={14} fill={NAVY} stroke={LINE} strokeWidth={6} /><Txt x={0} y={20} s={44} c={GRN}>VOL 100%</Txt></g>
      {after > 0 && after < 0.6 && <Txt x={790} y={1010} s={70} c={LINE} a={1 - after / 0.6}>THUD</Txt>}
      <g opacity={stamp} transform={`translate(735 555) rotate(-9) scale(${1 + 0.6 * (1 - stamp)})`}>
        <rect x={-230} y={-72} width={460} height={144} rx={16} fill={NAVY} fillOpacity={0.6} stroke={RED} strokeWidth={12} />
        <Txt x={0} y={30} s={84} c={RED}>NO BOUNCE</Txt>
      </g>
    </Frame>
  );
};
