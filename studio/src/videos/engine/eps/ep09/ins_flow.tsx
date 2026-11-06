// What If ep09 sponge inserts 1: the flow cutaway + a backyard pool a day (shot 6), guests moving into the tunnels (shot 8).
// t = seconds since the start of the video. Frame creeps up to ~1.11x around (540, 700): drawn content stays in y 170-1150.
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, DIM, LINE, NAVY, RED, Y } from "./kit";

export const SP = "#d23f3f", SP_D = "#94283a", HOLE = "#3a0a16", CREAM = "#f4f1ea";
type P = [number, number];
/** point + heading along a polyline at u in 0..1 */
export const along = (pts: P[], u: number): [number, number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  let d = c01(u) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, d / seg[i]) : 0, a = pts[i], b = pts[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])]; }
    d -= seg[i];
  }
  return [pts[0][0], pts[0][1], 0];
};
/** the lead's curly hair: root at (x, y), ~110 px tall */
export const Curl: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} fill="none" stroke={NAVY} strokeWidth={9} strokeLinecap="round">
    <path d="M-4 6 Q-16 -48 4 -84 Q22 -104 40 -100" />
    <path d="M10 -30 A16 16 0 1 1 14 -10" />
  </g>
);
export const Shrimp: React.FC<{ x: number; y: number; a?: number; s?: number }> = ({ x, y, a = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <path d="M-22 -4 Q-46 -30 -60 -22 M-22 2 Q-50 -6 -64 6" fill="none" stroke={NAVY} strokeWidth={3} />
    {[[30, 6, 9], [16, 10, 12], [0, 8, 14]].map(([cx, cy, r]) => <ellipse key={cx} cx={cx} cy={cy} rx={r} ry={r * 0.9} fill="#ff9a7a" stroke={NAVY} strokeWidth={4} />)}
    <path d="M36 8 L52 -4 L52 20 Z" fill="#ff9a7a" stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={-14} cy={0} rx={18} ry={14} fill="#ffb08f" stroke={NAVY} strokeWidth={4} />
    <circle cx={-22} cy={-6} r={4.5} fill={NAVY} />
  </g>
);
export const Crab: React.FC<{ x: number; y: number; s?: number; k?: number }> = ({ x, y, s = 1, k = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((d) => <g key={d}>
      <path d={`M${d * 22} -6 L${d * 42} ${-26 - 6 * k}`} stroke={NAVY} strokeWidth={6} />
      <ellipse cx={d * 46} cy={-36 - 6 * k} rx={15} ry={12} fill={Y} stroke={NAVY} strokeWidth={4} /><path d={`M${d * 46} ${-38 - 6 * k} L${d * 64} ${-56 - 6 * k} L${d * 40} ${-54 - 6 * k} Z`} fill={Y} stroke={NAVY} strokeWidth={3} />
      {[0, 1, 2].map((j) => <path key={j} d={`M${d * 20} ${4 + j * 6} L${d * (40 + 4 * Math.sin(k * 3 + j))} ${16 + j * 8}`} stroke={NAVY} strokeWidth={4} strokeLinecap="round" />)}
    </g>)}
    <ellipse cx={0} cy={0} rx={30} ry={18} fill={Y} stroke={NAVY} strokeWidth={5} />
    <circle cx={-9} cy={-26} r={4.5} fill={NAVY} /><circle cx={9} cy={-26} r={4.5} fill={NAVY} />
    <path d="M-8 -16 L-9 -24 M8 -16 L9 -24" stroke={NAVY} strokeWidth={4} />
  </g>
);
export const Worm: React.FC<{ x: number; y: number; a?: number; t: number }> = ({ x, y, a = 0, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-i * 15} cy={6 * Math.sin(t * 9 - i)} r={12 - i} fill="#f7a6b8" stroke={NAVY} strokeWidth={4} />)}
    <circle cx={4} cy={6 * Math.sin(t * 9) - 3} r={3.5} fill={NAVY} />
  </g>
);

// ---------------- shot 6: water in through the pores, out of the top; a backyard pool through you in a day ----------------
const ROWS = [600, 720, 840, 960];
/** cutaway barrel: walls x 300-440 / 640-780, a central cavity, open top at y 400 */
const Cutaway: React.FC<{ dots: number }> = ({ dots }) => (
  <g>
    <path filter="url(#lump)" d="M300 400 C280 600 300 900 330 1080 L750 1080 C780 900 800 600 780 400 L640 400 C650 600 640 860 620 1000 L460 1000 C440 860 430 600 440 400 Z" fill={SP} stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
    <path d="M440 400 C430 600 440 860 460 1000 L620 1000 C640 860 650 600 640 400 Z" fill="#5a1422" opacity={0.85} />
    {ROWS.map((y) => <g key={y}>
      <path d={`M${296 - (y - 600) * 0.02} ${y} L${442 - (y - 600) * 0.015} ${y}`} stroke="#5a1422" strokeWidth={22} strokeLinecap="round" />
      <path d={`M${638 + (y - 600) * 0.015} ${y} L${784 + (y - 600) * 0.02} ${y}`} stroke="#5a1422" strokeWidth={22} strokeLinecap="round" />
    </g>)}
    {Array.from({ length: 34 }, (_, i) => { const side = i % 2 ? 1 : -1, y = 430 + ((i * 37) % 620), x = 540 + side * (232 + 12 * Math.sin(i));
      return <circle key={i} cx={x} cy={y} r={7} fill="#5a1422" opacity={c01(dots * 34 - i)} />; })}
    <Curl x={330} y={402} />
  </g>
);
export const Flow: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 21.1, water = W("water", a0), pores = W("pores", a0), thou = W("thousands", a0), big = W("big", a0), yard = W("backyard", a0), day = W("day", a0);
  const flowA = at(t, water - 0.25, 0.3), dots = c01((t - thou + 0.1) / 0.6), poreTag = at(t, pores - 0.15, 0.2), move = at(t, big - 0.1, 0.6);
  const pool = at(t, yard - 0.2, 0.35), drain = c01((t - yard - 0.3) / (day + 0.15 - yard - 0.3)), clock = at(t, yard, 0.3);
  const s = 1 - 0.38 * move, tx = 540 + 150 * move, ty = 740 + 150 * move;
  const parts = Array.from({ length: 24 }, (_, i) => {
    const row = ROWS[i % 4], side = (i >> 2) % 2 ? 1 : -1, u = ((t - water) * 0.42 + i / 24) % 1;
    const pts: P[] = [[540 + side * 470, row], [540 + side * 250, row], [540 + side * 70, row], [540 + side * 30, 520], [540, 330], [540 + side * 40, 170]];
    const [x, y] = along(pts, u);
    return <circle key={i} cx={x} cy={y} r={11} fill={CYAN} stroke={NAVY} strokeWidth={4} opacity={flowA} />;
  });
  const lvl = 1 - drain;
  return (
    <Frame t={t - a0} title={pool > 0.5 ? "A BACKYARD POOL A DAY" : "WATER IN, WATER OUT"}>
      <g transform={`translate(${tx} ${ty}) scale(${s}) translate(-540 -740)`}>
        <Cutaway dots={dots} />
        {t > water - 0.3 && parts}
        {[ROWS[0], ROWS[2]].map((y, i) => <g key={y} opacity={flowA * (1 - move)}>
          <path d={`M${i ? 1000 : 80} ${y} L${i ? 900 : 180} ${y}`} stroke={CYAN} strokeWidth={18} strokeLinecap="round" />
          <path d={i ? `M880 ${y} L915 ${y - 26} L915 ${y + 26} Z` : `M200 ${y} L165 ${y - 26} L165 ${y + 26} Z`} fill={CYAN} stroke={NAVY} strokeWidth={5} />
        </g>)}
        <g opacity={flowA}>
          <path d="M540 340 L540 220" stroke={CYAN} strokeWidth={20} strokeLinecap="round" />
          <path d="M540 180 L505 228 L575 228 Z" fill={CYAN} stroke={NAVY} strokeWidth={5} />
        </g>
      </g>
      <g opacity={poreTag * (1 - move)}>
        <path d="M250 640 L170 520" stroke={LINE} strokeWidth={5} />
        <Txt x={180} y={500} s={50}>PORES</Txt>
        <Txt x={585} y={250} s={46} c={CYAN} anchor="start">OUT</Txt>
      </g>
      {pool > 0 && <g opacity={pool} transform={`translate(0 ${-40 * (1 - pool)})`}>
        <path d="M110 300 L520 300 L560 560 L70 560 Z" fill="#e9e2cf" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
        <path d="M140 330 L490 330 L520 530 L110 530 Z" fill="#9fe3f0" stroke={NAVY} strokeWidth={6} />
        <clipPath id="poolC"><path d="M140 330 L490 330 L520 530 L110 530 Z" /></clipPath>
        <g clipPath="url(#poolC)"><rect x={100} y={530 - 200 * lvl} width={440} height={200} fill="#3fb6e0" />
          {lvl > 0.05 && <path d={`M100 ${532 - 200 * lvl} Q200 ${520 - 200 * lvl} 300 ${532 - 200 * lvl} T540 ${532 - 200 * lvl}`} fill="none" stroke="#e8fbff" strokeWidth={6} />}</g>
        <path d="M470 290 L470 370 M500 290 L500 370 M470 315 L500 315 M470 345 L500 345" stroke="#c9ccd4" strokeWidth={7} strokeLinecap="round" />
        {lvl > 0.02 && <path d={`M500 540 C${560 + 15 * Math.sin(t * 6)} 640 460 740 528 800`} fill="none" stroke={CYAN} strokeWidth={14 * Math.min(1, lvl * 3)} strokeLinecap="round" opacity={0.95} />}
        <Txt x={315} y={620} s={46}>POOL</Txt>
      </g>}
      {clock > 0 && <g opacity={clock} transform="translate(880 400)">
        <circle r={95} fill={LINE} stroke={NAVY} strokeWidth={8} />
        <path d={`M0 0 L0 -88 A88 88 0 ${drain > 0.5 ? 1 : 0} 1 ${88 * Math.sin(drain * 2 * Math.PI)} ${-88 * Math.cos(drain * 2 * Math.PI)} Z`} fill={Y} opacity={0.85} />
        <path d={`M0 0 L${70 * Math.sin(drain * 2 * Math.PI)} ${-70 * Math.cos(drain * 2 * Math.PI)}`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
        <circle r={10} fill={NAVY} />
        <Txt x={0} y={160} s={52} c={Y}>1 DAY</Txt>
      </g>}
    </Frame>
  );
};

// ---------------- shot 8: shrimp, crabs and worms move into your tunnels; a big sponge houses hundreds ----------------
const TUNNELS: P[][] = [
  [[180, 640], [330, 640], [420, 560], [470, 520]],                  // shrimp door (left)
  [[900, 760], [760, 760], [660, 690], [610, 650]],                  // crab door (right)
  [[540, 1150], [540, 1060], [470, 960], [440, 900]],                // worm door (bottom)
];
const ROOMS: P[] = [[470, 520], [610, 650], [440, 900], [650, 900], [560, 780], [400, 740]];
const MESH = ["M330 640 L420 560", "M420 560 L560 780", "M760 760 L660 690", "M660 690 L560 780", "M560 780 L650 900", "M560 780 L440 900", "M400 740 L440 900", "M400 740 L420 560", "M470 960 L440 900", "M650 900 L700 1000"];
export const Guests: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 36.0, mv = W("move", a0), sh = W("shrimp", a0), cr = W("crabs", a0), wo = W("worms", a0), tun = W("tunnels", a0), hun = W("hundreds", a0);
  const door = at(t, mv - 0.15, 0.3), body = at(t, a0, 0.35), tag = at(t, tun - 0.2, 0.25);
  const go = (t0: number) => c01((t - t0 + 0.1) / 1.0);
  const [sx, sy, sa] = along(TUNNELS[0], go(sh)), [cx, cy] = along(TUNNELS[1], go(cr)), [wx, wy, wa] = along(TUNNELS[2], go(wo));
  const ramp = c01((t - (hun - 1.4)) / 1.5), count = t < hun - 1.4 ? (t > sh + 0.9 ? 1 : 0) + (t > cr + 0.9 ? 1 : 0) + (t > wo + 0.9 ? 1 : 0) : 3 + Math.round(297 * ramp * ramp);
  const crowd = Math.round(60 * ramp);
  return (
    <Frame t={t - a0} title="GUESTS MOVE IN">
      <g opacity={body} transform={`translate(540 760) scale(${0.92 + 0.08 * body}) translate(-540 -760)`}>
        <g filter="url(#lump)">
          <path d="M260 420 C230 650 250 950 300 1110 L780 1110 C830 950 850 650 820 420 Z" fill={SP} stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
          <ellipse cx={540} cy={420} rx={280} ry={46} fill="#ea6a5e" stroke={NAVY} strokeWidth={7} />
          <ellipse cx={540} cy={420} rx={220} ry={30} fill={HOLE} stroke={NAVY} strokeWidth={5} />
          {Array.from({ length: 70 }, (_, i) => { const a = Math.sin(i * 127.1) * 43758.5, b = Math.sin(i * 269.5) * 43758.5, r = 6 + 9 * ((i * 7) % 5) / 4;
            return <ellipse key={i} cx={285 + (a - Math.floor(a)) * 510} cy={490 + (b - Math.floor(b)) * 590} rx={r} ry={r * 0.85} fill="#6d1626" />; })}
        </g>
        <Curl x={540} y={376} />
        {[...TUNNELS.map((p) => "M" + p.map((q) => q.join(" ")).join(" L")), ...MESH].map((d, i) => <path key={i} d={d} stroke="#5a1422" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
        {ROOMS.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={52} ry={40} fill="#5a1422" />)}
      </g>
      {[[180, 640], [900, 760], [540, 1110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={30 * door} fill="none" stroke={Y} strokeWidth={7} />)}
      {Array.from({ length: crowd }, (_, i) => { const r = ROOMS[i % 6], m = i % 3, j = Math.floor(i / 6);
        const x = r[0] + (j % 4 - 1.5) * 22 + 4 * Math.sin(t * 5 + i), y = r[1] + (Math.floor(j / 4) - 1) * 18;
        return m === 0 ? <Shrimp key={i} x={x} y={y} s={0.42} a={(i * 47) % 360} /> : m === 1 ? <Crab key={i} x={x} y={y} s={0.32} k={Math.sin(t * 6 + i)} /> : <Worm key={i} x={x} y={y} a={(i * 61) % 360} t={t + i} />; })}
      {t > sh - 0.1 && <Shrimp x={sx} y={sy} a={(sa * 180) / Math.PI + 180} s={2} />}
      {t > cr - 0.1 && <Crab x={cx} y={cy} s={1.6} k={Math.sin(t * 8)} />}
      {t > wo - 0.1 && <g transform={`translate(${wx} ${wy}) scale(1.6) translate(${-wx} ${-wy})`}><Worm x={wx} y={wy} a={(wa * 180) / Math.PI} t={t} /></g>}
      <g opacity={tag}><path d="M330 640 L260 560" stroke={LINE} strokeWidth={5} /><Txt x={240} y={540} s={44}>TUNNELS</Txt></g>
      <g transform="translate(540 230)">
        <rect x={-260} y={-70} width={520} height={130} rx={26} fill={NAVY} stroke={LINE} strokeWidth={6} />
        <Txt x={-110} y={22} s={50} c={DIM}>GUESTS</Txt>
        <Txt x={140} y={26} s={78} c={count >= 100 ? RED : Y}>{count}</Txt>
      </g>
    </Frame>
  );
};
