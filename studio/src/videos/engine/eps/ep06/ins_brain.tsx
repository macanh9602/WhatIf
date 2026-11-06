// What If ep06 brain inserts: the night cleaning crew / tissue wash (shot 8) and the half-asleep dolphin (shot 12).
// Frame creeps up to 1.14x around (540, 700), so Trash content stays in y 190-1180.
import React from "react";
import { at, c01, CYAN, DIM, Frame, GRN, LINE, NAVY, BG, RED, Txt, W, Y } from "./kit";

const BRAIN = "M215 740 C150 660 170 560 235 530 C225 440 320 380 390 400 C410 320 530 300 590 350 C650 300 770 320 790 400 C870 400 930 490 890 570 C950 620 940 720 860 750 C850 800 790 830 730 810 C690 850 620 860 570 830 C520 890 400 890 350 830 C300 850 240 810 215 740 Z";
const FOLDS = ["M260 560 C320 500 380 560 440 500", "M480 410 C520 470 600 430 620 490", "M680 430 C730 480 700 540 790 540", "M480 600 C540 550 620 620 700 570 C760 540 800 590 850 620", "M300 800 C360 770 420 830 480 790", "M600 790 C650 770 700 800 760 770"];
const SWEEP = "M240 742 C400 722 600 738 860 738";

/** a small crew member; feet at (x, y) */
const Bean: React.FC<{ x: number; y: number; c: string; k: number; t: number; children?: React.ReactNode }> = ({ x, y, c, k, t, children }) => (
  <g transform={`translate(${x} ${y - 6 * Math.abs(Math.sin(t * 5))}) scale(${k})`}>
    <path d={`M-14 -14 L${-14 - 7 * Math.sin(t * 7)} 0 M14 -14 L${14 + 7 * Math.sin(t * 7)} 0`} stroke={NAVY} strokeWidth={10} strokeLinecap="round" />
    <rect x={-38} y={-124} width={76} height={112} rx={38} fill={c} stroke={NAVY} strokeWidth={6} />
    <path d="M-35 -98 A35 28 0 0 1 35 -98 Z" fill={Y} stroke={NAVY} strokeWidth={5} />
    <circle cx={-13} cy={-80} r={6} fill={NAVY} /><circle cx={13} cy={-80} r={6} fill={NAVY} />
    <path d="M-11 -62 Q0 -52 11 -62" fill="none" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
    {children}
  </g>
);
const Mop: React.FC<{ sway: number }> = ({ sway }) => (
  <>
    <ellipse cx={70} cy={2} rx={70} ry={9} fill={CYAN} opacity={0.75} />
    <path d={`M28 -66 L${70 + 44 * sway} -4`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
    <ellipse cx={70 + 44 * sway} cy={0} rx={34} ry={13} fill={LINE} stroke={NAVY} strokeWidth={5} />
  </>
);
const BAG = "M0 -44 C-14 -30 -44 -14 -44 18 C-44 44 44 44 44 18 C44 -14 14 -30 0 -44 Z";

/** the brain's night shift, then a zoom into the tissue: cells part, fluid flows, the waste leaves */
export const Trash: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 38.4, sleep = W("sleep", a0), brain = W("brain", a0), out = W("takes", a0), trash = W("trash", a0), inn = W("In", a0), mice = W("mice", a0),
    open = W("open", a0), fluid = W("fluid", a0), washes = W("washes", a0);
  const z = at(t, inn - 0.1, 0.5); // brain -> tissue zoom
  const walk = at(t, out - 0.1, trash - out), throwK = c01((t - trash + 0.1) / 0.8), bagX = 790 + 85 + 95 * throwK, bagY = 660 + 340 * throwK * throwK - 130 * Math.sin(Math.PI * throwK);
  const gapK = at(t, open - 0.1, 0.7), w = 200 - 40 * gapK, gap = 10 + 60 * gapK, left = 540 - (4 * w + 3 * gap) / 2;
  const flow = at(t, fluid - 0.1, 0.45), tag = at(t, mice - 0.1, 0.2), tagS = tag * (1 + 0.28 * Math.sin(Math.PI * tag));
  const openA = at(t, open - 0.1, 0.1), fluidA = at(t, fluid - 0.1, 0.1), washA = at(t, washes - 0.1, 0.1);
  const gapX = [0, 1, 2].map((i) => left + (i + 1) * w + i * gap + gap / 2);
  return (
    <Frame t={t - a0} title="SLEEP IS WHEN THE BRAIN CLEANS">
      <clipPath id="band"><rect x={0} y={0} width={1080} height={1190} /></clipPath>
      <g clipPath="url(#band)"><g opacity={1 - c01(z * 1.7)} transform={`translate(540 640) scale(${1 + 2.5 * z}) translate(-540 -640)`}>
        <path d="M640 840 C650 900 650 960 670 1020 L730 1010 C715 950 710 890 710 840 Z" fill={LINE} stroke={NAVY} strokeWidth={8} />
        <ellipse cx={750} cy={850} rx={115} ry={72} fill={LINE} stroke={NAVY} strokeWidth={8} />
        <ellipse cx={750} cy={850} rx={115} ry={72} fill={RED} opacity={0.5} />
        <path d={BRAIN} fill={LINE} />
        <path d={BRAIN} fill={RED} opacity={0.35} />
        <path d={BRAIN} fill="none" stroke={NAVY} strokeWidth={10} />
        {FOLDS.map((d) => <path key={d} d={d} fill="none" stroke={NAVY} strokeWidth={7} strokeLinecap="round" opacity={0.55} />)}
        <path d={SWEEP} fill="none" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
        {[300, 395, 480, 570, 660].map((x, i) => <circle key={x} cx={x} cy={722 - 4 * Math.sin(t * 5 + i)} r={13} fill={Y} stroke={NAVY} strokeWidth={4} opacity={1 - at(t, sleep + 0.4 + i * 0.3, 0.3)} />)}
        {[0, 1].map((i) => { const k = at(t, sleep - 0.1 + i * 0.15, 0.25), x = 300 + i * 200 + 24 * Math.sin(t * 0.9 + i * 2);
          return <Bean key={i} x={x} y={732} c={i ? GRN : CYAN} k={k} t={t + i}><Mop sway={Math.sin(t * 6 + i * 2)} /></Bean>; })}
        <Bean x={650 + 140 * walk} y={732} c={CYAN} k={at(t, sleep + 0.2, 0.25)} t={t + 2}>
          <path d="M30 -66 L72 -66" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
        </Bean>
        <g transform={`translate(${throwK > 0 ? bagX : 650 + 140 * walk + 85} ${throwK > 0 ? bagY : 660 + 6 * Math.sin(t * 7)}) rotate(${300 * throwK + 8 * Math.sin(t * 7)}) scale(${at(t, sleep + 0.2, 0.25)})`}>
          <path d={BAG} fill={NAVY} stroke={LINE} strokeWidth={5} />
          <path d="M-10 -26 L10 -26" stroke={Y} strokeWidth={8} strokeLinecap="round" />
        </g>
        <path d="M910 200 A70 70 0 1 0 985 305 A58 58 0 0 1 910 200 Z" fill={Y} stroke={NAVY} strokeWidth={6} opacity={at(t, sleep - 0.1, 0.3)} transform={`rotate(${4 * Math.sin(t * 1.5)} 930 260)`} />
        <Txt x={540} y={1130} s={70} c={Y} a={at(t, brain - 0.1, 0.25) * (1 - c01(z * 5))}>NIGHT SHIFT CREW</Txt>
      </g></g>

      <g opacity={z} transform={`translate(540 700) scale(${0.3 + 0.7 * z}) translate(-540 -700)`}>
        {[0, 1, 2, 3].map((i) => { const x = left + i * (w + gap), y = 410 + 6 * Math.sin(t * 2.2 + i * 1.7);
          return <g key={i}>
            <rect x={x} y={y} width={w} height={610} rx={72} fill={LINE} />
            <rect x={x} y={y} width={w} height={610} rx={72} fill={RED} opacity={0.35} />
            <rect x={x} y={y} width={w} height={610} rx={72} fill="none" stroke={NAVY} strokeWidth={8} />
            <circle cx={x + w / 2} cy={y + 290 + 18 * Math.sin(t * 1.6 + i)} r={46} fill={RED} opacity={0.75} stroke={NAVY} strokeWidth={6} />
          </g>; })}
        {gapX.map((x, i) => <g key={i} opacity={flow}>
          <path d={`M${x} 410 V${410 + 660 * flow}`} stroke={CYAN} strokeWidth={Math.max(gap - 14, 4)} strokeLinecap="round" opacity={0.9} />
          <path d={`M${x} 410 V${410 + 660 * flow}`} stroke={LINE} strokeWidth={9} strokeDasharray="34 44" strokeDashoffset={-620 * t} />
        </g>)}
        {gapX.flatMap((x, i) => [0, 1, 2, 3, 4, 5].map((j) => {
          const y0 = 450 + j * 100 + 18 * ((i + j) % 2), leave = c01((t - washes + 0.1 - 0.05 * (5 - j) - 0.04 * i) / 0.9);
          return <circle key={`${i}${j}`} cx={x + 0.22 * gap * Math.sin(i * 3 + j * 2) + 3 * Math.sin(t * 9 + j)} cy={y0 + 3 * Math.sin(t * 7 + i + j) + (1075 - y0) * leave * leave} r={17}
            fill={Y} stroke={NAVY} strokeWidth={4} opacity={1 - at(leave, 0.8, 0.2)} />;
        }))}
        <Txt x={540} y={375} s={60} a={1 - at(t, open - 0.2, 0.1)}>BRAIN CELLS</Txt>
        <Txt x={540} y={375} s={60} c={GRN} a={openA * (1 - at(t, fluid - 0.2, 0.1))}>GAPS OPEN</Txt>
        <Txt x={540} y={375} s={60} c={CYAN} a={fluidA}>FLUID</Txt>
        <Txt x={540} y={1165} s={60} c={Y} a={1 - at(t, washes - 0.2, 0.1)}>WASTE TRAPPED</Txt>
        <Txt x={540} y={1165} s={60} c={CYAN} a={washA}>WASHED AWAY</Txt>
      </g>

      <g transform={`translate(540 250) rotate(${1.5 * Math.sin(t * 3)}) scale(${tagS})`}>
        <rect x={-190} y={-52} width={380} height={104} rx={26} fill={Y} stroke={NAVY} strokeWidth={8} />
        <Txt x={0} y={26} s={70} c={NAVY}>IN MICE</Txt>
      </g>
    </Frame>
  );
};

const FISH = "M150 828 C165 808 215 802 262 798 C268 760 310 722 372 712 C430 700 500 696 548 700 C570 668 600 638 640 622 C628 650 630 682 650 716 C720 732 790 770 850 805 C870 790 910 745 965 735 C955 775 930 815 895 835 C925 860 950 895 945 925 C900 905 860 870 835 850 C760 880 660 910 550 912 C450 912 340 890 268 850 C225 848 175 848 150 838 Z";
const BELLY = "M170 843 C250 838 340 850 430 855 C560 865 700 855 820 842 C760 880 660 910 550 912 C450 912 340 890 268 850 C225 848 190 848 170 843 Z";
const wave = (t: number, y: number, amp: number) => {
  let d = `M-100 ${y}`;
  for (let x = -60; x <= 1180; x += 40) d += ` L${x} ${(y + amp * Math.sin(x / 70 + t * 2.4)).toFixed(1)}`;
  return d;
};
const LEFT = "M532 310 C440 300 345 370 345 460 C345 550 440 620 532 610 Z", RIGHT = "M548 310 C640 300 735 370 735 460 C735 550 640 620 548 610 Z";

/** a brain half: dark, or lit when `lit` is 1 */
const Half: React.FC<{ d: string; lit: number; cx: number; t: number }> = ({ d, lit, cx, t }) => (
  <>
    <path d={d} fill={NAVY} stroke={LINE} strokeWidth={7} />
    <path d={d} fill={Y} opacity={lit * (0.88 + 0.12 * Math.sin(t * 8))} />
    <path d={`M${cx - 50} 400 q50 34 100 0 M${cx - 50} 480 q50 34 100 0`} fill="none" stroke={BG} strokeWidth={7} strokeLinecap="round" opacity={lit} />
    <g transform={`translate(${cx} ${460 + 8 * Math.sin(t * 3)}) rotate(${6 * Math.sin(t * 2)})`}><Txt x={0} y={42} s={118} a={1 - lit}>Z</Txt></g>
  </>
);

/** a dolphin at the surface, one eye shut, half its brain asleep; the halves swap at the end */
export const Dolphin: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 68.5, even = at(t, W("Even", a0) - 0.1, 0.2), br = W("breathing", a0) - 0.05, half = at(t, W("half", a0) - 0.1, 0.25), swap = at(t, W("time", a0) - 0.1, 0.25);
  const evenS = even * (1 + 0.15 * Math.sin(Math.PI * even));
  return (
    <Frame t={t - a0} title="HALF A BRAIN AT A TIME">
      <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CYAN} stopOpacity={0.5} /><stop offset="100%" stopColor={CYAN} stopOpacity={0} /></linearGradient></defs>
      <g transform={`translate(0 ${10 * Math.sin(t * 1.5)}) rotate(${1.6 * Math.sin(t * 1.1)} 540 820)`}>
        <path d="M400 880 C385 930 405 985 450 1005 C462 965 472 920 485 890 Z" fill={LINE} stroke={NAVY} strokeWidth={8} />
        <path d="M400 880 C385 930 405 985 450 1005 C462 965 472 920 485 890 Z" fill={BG} opacity={0.6} />
        <path d={FISH} fill={LINE} />
        <path d={FISH} fill={BG} opacity={0.5} />
        <path d={BELLY} fill={LINE} />
        <path d={FISH} fill="none" stroke={NAVY} strokeWidth={10} strokeLinejoin="round" />
        <path d="M156 833 C200 838 250 842 288 816" fill="none" stroke={NAVY} strokeWidth={7} strokeLinecap="round" />
        <path d="M305 790 Q325 808 345 790" fill="none" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
        <circle cx={432} cy={716} r={8} fill={NAVY} />
        {Array.from({ length: 18 }, (_, i) => { const k = (t - br - i * 0.04) / 0.95, side = (i % 3) - 1;
          return k > 0 && k < 1 ? <circle key={i} cx={432 + side * (20 + 90 * k)} cy={712 - 330 * k + 130 * k * k} r={15 - 7 * k} fill={i % 2 ? CYAN : LINE} stroke={NAVY} strokeWidth={3} opacity={1 - k * k} /> : null; })}
      </g>
      <path d={`${wave(t, 888, 13)} V1215 H-100 Z`} fill="url(#sea)" />
      <path d={wave(t, 888, 13)} fill="none" stroke={CYAN} strokeWidth={10} />
      <path d={wave(t + 1.2, 1010, 9)} fill="none" stroke={CYAN} strokeWidth={6} opacity={0.45} />
      <path d={wave(t + 2.1, 1100, 7)} fill="none" stroke={CYAN} strokeWidth={5} opacity={0.25} />

      <g transform={`translate(540 240) scale(${evenS}) translate(-540 -240)`}><Txt x={540} y={250} s={84} c={Y}>EVEN DOLPHINS</Txt></g>

      <g opacity={half} transform={`translate(540 452) scale(${0.86 * (0.5 + 0.5 * half)}) translate(-540 -460)`}>
        <path d="M430 610 L345 745" stroke={LINE} strokeWidth={7} strokeDasharray="20 16" strokeDashoffset={-80 * t} />
        <Half d={LEFT} lit={swap} cx={440} t={t} />
        <Half d={RIGHT} lit={1 - swap} cx={640} t={t} />
        <Txt x={205} y={480} s={50} c={LINE} a={1 - swap}>ASLEEP</Txt>
        <Txt x={205} y={480} s={50} c={Y} a={swap}>AWAKE</Txt>
        <Txt x={875} y={480} s={50} c={Y} a={1 - swap}>AWAKE</Txt>
        <Txt x={875} y={480} s={50} c={LINE} a={swap}>ASLEEP</Txt>
      </g>
    </Frame>
  );
};
