// What If ep09 sponge inserts 2: a sponge is a crowd of cells (shot 9), the 1907 cloth experiment (shot 10).
// t = seconds since the start of the video. Content stays in y 170-1150 (the Frame creep is ~1.1x at the end).
import React from "react";
import { at, c01, ease, W, Frame, Txt, DIM, LINE, NAVY, RED, Y } from "./kit";
import { Curl, SP, HOLE } from "./ins_flow";

const SP_PATH = "M330 430 C300 640 320 900 360 1080 L720 1080 C760 900 780 640 750 430 Z";
const hash = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** a cell: a blob with a nucleus and dot eyes */
const Cell: React.FC<{ x: number; y: number; r: number; c: string; t: number; i: number; eyes?: boolean }> = ({ x, y, r, c, t, i, eyes = true }) => {
  const w = 1 + 0.08 * Math.sin(t * 6 + i), h = 1 - 0.08 * Math.sin(t * 6 + i);
  return (
    <g transform={`translate(${x} ${y}) rotate(${(i * 53) % 40 - 20}) scale(${w} ${h})`}>
      <ellipse rx={r} ry={r * 0.82} fill={c} stroke={NAVY} strokeWidth={5} />
      {eyes ? <><circle cx={-r * 0.3} cy={-r * 0.1} r={r * 0.13} fill={NAVY} /><circle cx={r * 0.3} cy={-r * 0.1} r={r * 0.13} fill={NAVY} /></>
        : <circle cx={r * 0.2} cy={-r * 0.1} r={r * 0.28} fill="rgba(29,26,58,.45)" />}
    </g>
  );
};

// ---------------- shot 9: not one creature, a crowd of cells that agreed to stay together ----------------
const GRID: [number, number][] = [];
for (let y = 480; y <= 1040; y += 70) for (let x = 360 + ((y / 70) % 2) * 35; x <= 720; x += 70) GRID.push([x, y]);
export const Crowd: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 43.6, isnt = W("isn't", a0), cre = W("creature", a0), crowd = W("crowd", a0), agreed = W("agreed", a0), tog = W("together", a0);
  const q1 = at(t, isnt - 0.1, 0.25), x1 = at(t, cre + 0.1, 0.2), split = at(t, crowd - 0.15, 0.5), hands = at(t, agreed - 0.1, 0.4);
  const hug = Math.sin(c01((t - tog + 0.1) / 0.5) * Math.PI), sq = 1 - 0.06 * hug;
  return (
    <Frame t={t - a0} title="ONE SPONGE = A CROWD OF CELLS">
      <g transform={`translate(540 760) scale(${sq} ${2 - sq}) translate(-540 -760)`}>
        <path filter="url(#lump)" d={SP_PATH} fill={SP} opacity={1 - 0.85 * split} />
        <ellipse cx={540} cy={430} rx={210} ry={40} fill="#ea6a5e" opacity={1 - 0.85 * split} />
        <ellipse cx={540} cy={430} rx={160} ry={26} fill={HOLE} opacity={1 - split} />
        <g opacity={1 - split}>{GRID.map(([x, y], i) => i % 3 === 1 && Math.abs(x - 540) > 60 ? <ellipse key={i} cx={x} cy={y + 20} rx={13} ry={9} fill="#6d1626" /> : null)}
          <circle cx={505} cy={620} r={13} fill={NAVY} /><circle cx={575} cy={620} r={13} fill={NAVY} /><path d="M525 680 L555 680" stroke={NAVY} strokeWidth={7} strokeLinecap="round" /></g>
        {split > 0 && GRID.map(([x, y], i) => { const nb = GRID.findIndex(([x2, y2], j) => j > i && Math.abs(y2 - y) < 1 && x2 - x < 80);
          return nb >= 0 && hands > 0 ? <path key={`h${i}`} d={`M${x + 20} ${y + 6} Q${x + 35} ${y + 22 - 10 * hug} ${x + 50} ${y + 6}`} stroke={NAVY} strokeWidth={5} fill="none" opacity={hands} /> : null; })}
        {split > 0 && GRID.map(([x, y], i) => <Cell key={i} x={x + 6 * Math.sin(t * 3 + i) * (1 - hands)} y={y} r={30 * c01(split * 3 - (i % 5) * 0.4)} c={i % 7 ? SP : "#ea6a5e"} t={t} i={i} />)}
        <path filter="url(#lump)" d={SP_PATH} fill="none" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" />
        <ellipse cx={540} cy={430} rx={210} ry={40} fill="none" stroke={NAVY} strokeWidth={7} />
        <Curl x={540} y={392} />
      </g>
      <g opacity={q1 * (1 - at(t, crowd - 0.35, 0.2))}>
        <Txt x={540} y={260} s={66} c={Y}>1 CREATURE?</Txt>
        <g opacity={x1}><path d="M330 200 L750 300 M750 200 L330 300" stroke={RED} strokeWidth={16} strokeLinecap="round" /></g>
      </g>
      <g opacity={split}><Txt x={540} y={260} s={66} c={Y}>{hands > 0.5 ? "HOLDING ON" : "CELLS"}</Txt></g>
    </Frame>
  );
};

// ---------------- shot 10: 1907, squeezed through a cloth into single cells, they crawl back into a new sponge ----------------
const TAN = "#e8c170", TAN_D = "#b88a3e";
const DROPS = Array.from({ length: 36 }, (_, i) => ({ x0: 340 + hash(i) * 400, x1: 230 + hash(i + 40) * 620, y1: 990 + hash(i + 80) * 90, k: i % 3 }));
const CLUSTER: [number, number][] = [[540, 1030]]; // "into a new sponge": one
export const Cloth: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 50.05, yr = W("1907", a0), sq = W("squeezed", a0), cl = W("cloth", a0), into = W("into", a0 + 3), cells = W("cells", a0 + 3), crawl = W("crawled", a0), news = W("new", a0), sp = W("sponge", a0 + 6);
  const stamp = at(t, yr - 0.15, 0.15), hand = at(t, sq - 0.5, 0.45) * (1 - at(t, cells + 0.1, 0.5)), press = ease((t - sq) / (cl - sq + 0.3)) * (1 - at(t, cells + 0.1, 0.4));
  const fall = c01((t - into + 0.1) / (cells + 0.3 - into)), creep = ease((t - crawl + 0.1) / (news - crawl + 0.1)), grow = at(t, news - 0.1, 0.5), gone = at(t, cells, 0.3);
  const spH = 240 * (1 - 0.65 * press), spTop = 680 - spH;
  return (
    <Frame t={t - a0} title={grow > 0.5 ? "...AND BUILT A NEW SPONGE" : "SQUEEZED THROUGH A CLOTH"}>
      <g transform={`translate(205 235) scale(${0.5 + 0.3 * stamp}) rotate(${-6 * stamp})`} opacity={stamp}>
        <rect x={-190} y={-75} width={380} height={140} rx={20} fill={Y} stroke={NAVY} strokeWidth={8} />
        <text x={0} y={36} fontSize={104} textAnchor="middle" fill={NAVY} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>1907</text>
      </g>
      {/* the dish */}
      <path d="M170 960 Q540 1150 910 960" fill="#cfe7f2" stroke={NAVY} strokeWidth={8} />
      <path d="M170 960 L910 960" stroke={NAVY} strokeWidth={8} />
      {/* the cloth on its frame */}
      <path d="M230 690 L230 940 M850 690 L850 940" stroke="#8a6a4a" strokeWidth={14} strokeLinecap="round" />
      <path d={`M220 690 Q540 ${700 + 50 * press} 860 690`} fill="none" stroke={LINE} strokeWidth={16} />
      {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${260 + i * 45} ${693 + 40 * press * Math.sin((Math.PI * (i + 1)) / 14)} l0 14`} stroke={DIM} strokeWidth={4} />)}
      {/* the sponge, pressed flat, gone once its cells are through */}
      {gone < 1 && <g opacity={1 - gone} filter="url(#lump)">
        <path d={`M400 ${spTop} C380 ${spTop + spH * 0.5} 390 ${spTop + spH * 0.8} 410 690 L670 690 C690 ${spTop + spH * 0.8} 700 ${spTop + spH * 0.5} 680 ${spTop} Z`} fill={TAN} stroke={NAVY} strokeWidth={7} />
        <ellipse cx={540} cy={spTop} rx={140} ry={26} fill={TAN_D} stroke={NAVY} strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={420 + (i % 5) * 60} cy={spTop + 40 + Math.floor(i / 5) * spH * 0.28} r={8} fill={TAN_D} />)}
      </g>}
      {/* a hand (black, as on every insert) presses it down */}
      {hand > 0 && <g transform={`translate(540 ${spTop - 30 - 260 * (1 - hand)})`}>
        <rect x={-30} y={-420} width={60} height={300} fill={NAVY} />
        <rect x={-120} y={-140} width={240} height={140} rx={50} fill={NAVY} />
        <ellipse cx={130} cy={-90} rx={34} ry={22} fill={NAVY} transform="rotate(30 130 -90)" />
      </g>}
      {/* single cells fall through, scatter, then crawl back together */}
      {fall > 0 && DROPS.map((d, i) => { const u = c01(fall * 1.6 - (i % 9) * 0.07), c = CLUSTER[0];
        const x = d.x0 + (d.x1 - d.x0) * u, y = 700 + (d.y1 - 700) * u * u, cx = x + (c[0] + (hash(i + 9) - 0.5) * 70 - x) * creep, cy = y + (c[1] + (hash(i + 19) - 0.5) * 40 - y) * creep;
        return <Cell key={i} x={cx} y={cy} r={14} c={TAN} t={t} i={i} eyes={false} />; })}
      {creep > 0.2 && creep < 0.95 && CLUSTER.map(([x, y], i) => <path key={i} d={`M${x - 160 + i * 320} ${y - 10} Q${x - 80} ${y - 40} ${x - 30} ${y}`} stroke={DIM} strokeWidth={5} strokeDasharray="10 12" fill="none" />)}
      {grow > 0 && CLUSTER.map(([x, y], i) => <g key={i} transform={`translate(${x} ${y + 20}) scale(${1.6 * grow})`}>
        <path filter="url(#lump)" d="M-60 -120 C-70 -60 -62 -20 -50 0 L50 0 C62 -20 70 -60 60 -120 Z" fill={TAN} stroke={NAVY} strokeWidth={6} />
        <ellipse cx={0} cy={-120} rx={60} ry={14} fill={TAN_D} stroke={NAVY} strokeWidth={5} />
        {[[-26, -80], [20, -66], [-8, -36], [28, -30]].map(([a, b]) => <circle key={a} cx={a} cy={b} r={6} fill={TAN_D} />)}
      </g>)}
      <g opacity={at(t, cells - 0.2, 0.2) * (1 - creep)}><Txt x={540} y={1180} s={46} c={Y}>SINGLE CELLS</Txt></g>
      <g opacity={at(t, sp - 0.2, 0.2)}><Txt x={540} y={1180} s={46} c={Y}>A NEW SPONGE</Txt></g>
    </Frame>
  );
};
