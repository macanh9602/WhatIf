// What If ep10 drawing insert: the fifth finger erased, then a flipbook riffles while the drawing count climbs to 5,040
// (7 min x 60 s x 12 drawings a second, SCRIPT.md own calc). t = seconds since the start of the video.
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, DIM, LINE, NAVY, RED, Y } from "./kit";

const PAPER = "#f4f1ea", SKIN = "#fbf8f4";
const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
const Ink: React.FC<{ x: number; y: number; s: number; c?: string; anchor?: "start" | "middle"; children: React.ReactNode }> = ({ x, y, s, c = NAVY, anchor = "middle", children }) => (
  <text x={x} y={y} fontSize={s} fill={c} textAnchor={anchor} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>{children}</text>
);

/** a cartoon hand drawing, palm out; pinky opacity = `pinky` */
export const HandArt: React.FC<{ x: number; y: number; k?: number; pinky: number; fill?: string }> = ({ x, y, k = 1, pinky, fill = SKIN }) => {
  const F: [number, number, number, number][] = [[-118, 10, -50, 120], [-55, -60, -8, 175], [5, -75, 0, 190], [62, -60, 8, 170], [112, -25, 20, 130]];
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {F.map(([bx, by, a, l], i) => (
        <g key={i} opacity={i === 4 ? pinky : 1} transform={`translate(${bx} ${by}) rotate(${a})`}>
          <rect x={-27} y={-l} width={54} height={l + 30} rx={27} fill={fill} stroke={NAVY} strokeWidth={9} />
          <path d={`M-12 ${-l + 46} H12`} stroke="#d9c9c2" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={0} cy={70} rx={140} ry={118} fill={fill} stroke={NAVY} strokeWidth={9} />
      <path d="M-60 95 Q-10 135 40 120" fill="none" stroke="#d9c9c2" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** a tiny walking bean on a flipbook page; f = the drawing number */
const PageBean: React.FC<{ f: number }> = ({ f }) => {
  const s = Math.sin((f % 8) / 8 * Math.PI * 2), x = 470 + ((f * 9) % 140);
  return (
    <g>
      <path d={`M${x - 8} 1075 L${x - 8 - 22 * s} 1120 M${x + 8} 1075 L${x + 8 + 22 * s} 1120`} stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
      <rect x={x - 32} y={970} width={64} height={110} rx={32} fill={RED} stroke={NAVY} strokeWidth={6} />
      <circle cx={x + 8} cy={1003} r={6} fill={NAVY} /><circle cx={x - 12} cy={1003} r={6} fill={NAVY} />
    </g>
  );
};

export const Flipbook: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 13.0, cut = W("shortcut", a0), seven = W("sevenminute", a0), cart = W("cartoon", seven), five = W("five", a0), draw = W("drawings", a0);
  const eraseK = c01((t - (cut - 0.55)) / 0.7), pinky = 1 - eraseK, ex = 690 + 40 * Math.sin(t * 26) * (eraseK > 0 && eraseK < 1 ? 1 : 0), ey = 300 - 180 * c01((t - (cut - 0.9)) / 0.35) + 180 * c01((t - cut - 0.3) / 0.35);
  const minus = land(t, cut), book = at(t, seven - 0.3, 0.35);
  const count = Math.round(5040 * Math.pow(c01((t - seven) / (five + 0.75 - seven)), 1.6)), hit = land(t, draw);
  const f = Math.floor(Math.max(0, t - seven) * 12), flip = ((t - seven) * 12) % 1;
  const m1 = land(t, seven), m2 = land(t, cart), m3 = land(t, five);
  return (
    <Frame t={t - a0} title="4 FINGERS = FEWER LINES">
      <g opacity={1 - c01((t - (seven - 0.4)) / 0.3) * 0.75}>
        <HandArt x={430} y={420} pinky={pinky} />
        {[0, 1, 2, 3, 4].map((i) => { const k = c01((t - cut + 0.2 - i * 0.04) / 0.6); return k > 0 && k < 1 ? <circle key={i} cx={620 + 40 * i + 30 * k} cy={330 + 160 * k * k} r={9} fill="#e9a3b0" stroke={NAVY} strokeWidth={3} /> : null; })}
        <g transform={`translate(${ex} ${ey}) rotate(-24)`}>
          <rect x={-60} y={-38} width={120} height={76} rx={14} fill="#e9a3b0" stroke={NAVY} strokeWidth={8} />
          <rect x={10} y={-38} width={50} height={76} rx={8} fill={CYAN} stroke={NAVY} strokeWidth={8} />
        </g>
        <g transform={`translate(830 430) scale(${minus * (1 + 0.3 * (1 - minus))})`}><Txt x={0} y={0} s={86} c={Y}>-1</Txt><Txt x={0} y={70} s={40}>FINGER</Txt></g>
      </g>
      <g opacity={book} transform={`translate(0 ${80 * (1 - book)})`}>
        <path d="M300 940 L780 940 L800 1160 L280 1160 Z" fill={DIM} stroke={NAVY} strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${300 - i * 5} ${1160 + i * 9} L${800 + i * 5} ${1160 + i * 9}`} stroke={LINE} strokeWidth={6} />)}
        <path d="M300 900 L780 900 L780 1160 L300 1160 Z" fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <PageBean f={f} />
        <path d="M300 1140 H780" stroke="#b9c2cf" strokeWidth={5} />
        {book > 0.5 && t < draw && <path d={`M300 900 L${300 + 480 * Math.cos(flip * Math.PI)} ${900 - 46 * Math.sin(flip * Math.PI)} V${1160 - 46 * Math.sin(flip * Math.PI)} L300 1160 Z`} fill={PAPER} stroke={NAVY} strokeWidth={6} />}
        <Ink x={330} y={940} s={30} c="#8a93a8" anchor="start">{`#${Math.min(count, 5040)}`}</Ink>
      </g>
      <g opacity={book}>
        <Txt x={540} y={665} s={44} c={LINE}>DRAWINGS FOR ONE CARTOON</Txt>
        <g transform={`translate(540 790) scale(${1 + 0.25 * hit * (1 - c01((t - draw) / 0.4))})`}><Txt x={0} y={0} s={150} c={count >= 5040 ? Y : LINE}>{count.toLocaleString("en-US")}</Txt></g>
        <Txt x={300} y={860} s={46} a={m1} c={CYAN}>7 MIN</Txt>
        <Txt x={560} y={860} s={46} a={m2}>× 60 × 12</Txt>
        <Txt x={830} y={860} s={46} a={m3} c={Y}>≈ 5,000</Txt>
      </g>
    </Frame>
  );
};
