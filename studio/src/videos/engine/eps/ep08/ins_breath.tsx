// What If ep08 breathing inserts: water is heavy (x800, shot 5) and thin (30x less oxygen, a bathtub through your chest,
// shot 6). t = seconds since the start of the video. Frame creeps up to ~8 % about y 700, so content stops near y 1190.
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, DIM, LINE, NAVY, RED, Y } from "./kit";

const BLUE = "#3f9be0", PAPER = "#f4f1ea";
/** a reaction: starts 6 frames before the word and lands about 2 frames before it */
const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
const Pop: React.FC<{ x: number; y: number; k: number; children: React.ReactNode }> = ({ x, y, k, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k * (1 + 0.3 * (1 - k))})`} opacity={k > 0 ? 1 : 0}>{children}</g>
);

/** a balance: AIR on the left, a cube of WATER drops on the right and slams it down; x800 */
export const Heavy: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 13.5, wat = W("water", a0), eight = W("eight", a0), air = W("air", a0);
  const drop = at(t, wat - 0.15, 0.3), slam = land(t, eight), ang = 4 * drop + 16 * slam + 1.2 * slam * Math.sin((t - eight) * 14) * Math.exp(-(t - eight) * 3) * (t > eight ? 1 : 0);
  const r = (ang * Math.PI) / 180, end = (s: number): [number, number] => [540 + s * 360 * Math.cos(r), 520 + s * 360 * Math.sin(r)];
  const [lx, ly] = end(-1), [rx, ry] = end(1), airK = 1 + 0.12 * Math.sin(Math.PI * c01((t - air + 0.1) / 0.4));
  return (
    <Frame t={t - a0} title="WATER IS HEAVY">
      <path d="M540 520 L470 1120 H610 Z" fill={DIM} stroke={NAVY} strokeWidth={8} />
      <rect x={380} y={1110} width={320} height={40} rx={10} fill={LINE} stroke={NAVY} strokeWidth={8} />
      <g transform={`rotate(${ang} 540 520)`}>
        <rect x={170} y={505} width={740} height={30} rx={12} fill={LINE} stroke={NAVY} strokeWidth={8} />
      </g>
      <circle cx={540} cy={520} r={26} fill={Y} stroke={NAVY} strokeWidth={8} />
      {[[lx, ly], [rx, ry]].map(([x, y], i) => <g key={i}>
        <path d={`M${x} ${y} L${x - 120} ${y + 190} M${x} ${y} L${x + 120} ${y + 190}`} stroke={LINE} strokeWidth={6} />
        <path d={`M${x - 160} ${y + 190} H${x + 160} Q${x} ${y + 270} ${x - 160} ${y + 190} Z`} fill={LINE} stroke={NAVY} strokeWidth={8} />
      </g>)}
      <g transform={`translate(${lx} ${ly + 120}) scale(${airK})`}>
        <rect x={-85} y={-80} width={170} height={150} rx={10} fill="rgba(223,233,247,.12)" stroke={LINE} strokeWidth={6} strokeDasharray="18 12" />
        {[[-40, -30], [30, -45], [0, 20], [-45, 40], [45, 30]].map(([x, y], i) => <circle key={i} cx={x + 5 * Math.sin(t * 2 + i)} cy={y + 5 * Math.cos(t * 1.7 + i)} r={7} fill={LINE} />)}
        <Txt x={0} y={-110} s={56}>AIR</Txt>
      </g>
      <g transform={`translate(${rx} ${ry + 120 - 700 * (1 - drop)})`} opacity={drop > 0 ? 1 : 0}>
        <rect x={-85} y={-80} width={170} height={150} rx={10} fill={BLUE} stroke={NAVY} strokeWidth={8} />
        <path d="M-60 -40 q30 -14 60 0 t60 0" fill="none" stroke={CYAN} strokeWidth={8} />
        <Txt x={0} y={150} s={56} c={CYAN}>WATER</Txt>
      </g>
      <Pop x={790} y={300} k={slam}><Txt x={0} y={0} s={150} c={Y}>×800</Txt></Pop>
      <Txt x={790} y={380} s={44} a={land(t, W("denser", a0))}>DENSER</Txt>
    </Frame>
  );
};

const AIR_DOTS = Array.from({ length: 30 }, (_, i) => [180 + (i % 6) * 56 + 14 * Math.sin(i * 2.3), 255 + Math.floor(i / 6) * 52 + 10 * Math.cos(i * 1.7)]);
/** jars of AIR (30 O2) and WATER (1 O2); below, a bathtub of sea pours through your chest past the gills; every few minutes */
export const Thin: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 16.85, thirty = W("thirty", a0), oxy = W("oxygen", a0), pump = W("pump", a0), tub = W("bathtub", a0), chest = W("chest", a0), every = W("every", 22.5);
  const jars = at(t, a0 + 0.1, 0.3), x30 = land(t, thirty), less = land(t, oxy), body = at(t, pump - 0.3, 0.3), tubK = land(t, tub), flow = at(t, W("through", a0) - 0.1, 0.3), clock = land(t, every);
  const level = 1 - 0.85 * c01((t - W("through", a0)) / (W("minutes", a0) + 0.4 - W("through", a0)));
  const tubTilt = -12 * flow;
  return (
    <Frame t={t - a0} title="WATER IS THIN ON OXYGEN">
      <g opacity={jars}>
        {[[140, "AIR", LINE], [580, "WATER", CYAN]].map(([x, label, c]) => <g key={label as string}>
          <rect x={x as number} y={220} width={360} height={290} rx={20} fill={label === "WATER" ? "rgba(63,155,224,.45)" : "rgba(223,233,247,.1)"} stroke={c as string} strokeWidth={8} />
          <Txt x={(x as number) + 180} y={195} s={52} c={c as string}>{label as string}</Txt>
        </g>)}
        {AIR_DOTS.map(([x, y], i) => <circle key={i} cx={x + 4 * Math.sin(t * 3 + i)} cy={y + 4 * Math.cos(t * 2.5 + i)} r={14} fill={Y} stroke={NAVY} strokeWidth={4} opacity={at(t, a0 + 0.2 + i * 0.03, 0.15)} />)}
        <circle cx={760 + 30 * Math.sin(t * 1.3)} cy={370 + 20 * Math.cos(t)} r={14} fill={Y} stroke={NAVY} strokeWidth={4} />
        <Txt x={320} y={570} s={46} a={x30}>30 O₂</Txt><Txt x={760} y={570} s={46} a={x30}>1 O₂</Txt>
      </g>
      <Pop x={540} y={660} k={less}><Txt x={0} y={0} s={70} c={Y}>30× LESS OXYGEN</Txt></Pop>
      <g opacity={body} transform={`translate(0 ${60 * (1 - body)})`}>
        <rect x={430} y={950} width={220} height={240} rx={70} fill={RED} stroke={NAVY} strokeWidth={8} />
        <path d="M505 952 L540 1040 L575 952 Z" fill={PAPER} stroke={NAVY} strokeWidth={6} />
        <ellipse cx={540} cy={860} rx={92} ry={98} fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <path d="M540 762 c-10 -30 20 -50 34 -32" fill="none" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
        <circle cx={510} cy={845} r={9} fill={NAVY} /><circle cx={570} cy={845} r={9} fill={NAVY} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${600 - k * 2} ${890 + k * 16} q14 ${6 + 6 * Math.sin(t * 8)} 26 -4`} fill="none" stroke="#a3263f" strokeWidth={7} strokeLinecap="round" />)}
      </g>
      <g opacity={tubK} transform={`translate(230 820) rotate(${tubTilt}) scale(${0.6 + 0.4 * tubK})`}>
        <path d="M-140 -40 H140 V10 Q140 70 80 70 H-80 Q-140 70 -140 10 Z" fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <clipPath id="tubIn"><path d="M-128 -32 H128 V8 Q128 60 78 60 H-78 Q-128 60 -128 8 Z" /></clipPath>
        <rect x={-130} y={60 - 92 * level} width={260} height={100} fill={BLUE} clipPath="url(#tubIn)" />
        <path d="M-100 70 l-14 24 M100 70 l14 24" stroke={NAVY} strokeWidth={10} strokeLinecap="round" />
        <Txt x={0} y={-70} s={32} c={CYAN}>A BATHTUB OF SEA</Txt>
      </g>
      <g opacity={flow}>
        <path d="M330 880 C400 980 480 1050 560 1050 C640 1050 680 1100 700 1180" fill="none" stroke={BLUE} strokeWidth={30} strokeLinecap="round" />
        <path d="M330 880 C400 980 480 1050 560 1050 C640 1050 680 1100 700 1180" fill="none" stroke={CYAN} strokeWidth={10} strokeDasharray="30 40" strokeDashoffset={-260 * t} strokeLinecap="round" />
      </g>
      <g opacity={clock} transform={`translate(850 960) scale(${0.7 + 0.3 * clock})`}>
        <circle r={78} fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <path d={`M0 0 L${60 * Math.sin(t * 4)} ${-60 * Math.cos(t * 4)}`} stroke={RED} strokeWidth={8} strokeLinecap="round" />
        <circle r={8} fill={NAVY} />
      </g>
      <Txt x={850} y={1110} s={32} c={Y} a={land(t, W("few", 23))}>EVERY FEW MIN</Txt>
      <Txt x={230} y={1040} s={38} a={land(t, chest)}>THROUGH</Txt><Txt x={230} y={1090} s={38} a={land(t, chest)}>YOUR CHEST</Txt>
    </Frame>
  );
};
