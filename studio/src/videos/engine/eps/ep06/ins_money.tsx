// What If ep06 money inserts: invoice, reaction test, the free market. t = seconds since the start of the video.
// The Frame creep scales about y 700 by up to 8.5 %, so drawn content stops near y 1190 to stay above 1250 on screen.
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, DIM, GRN, LINE, NAVY, RED, Y } from "./kit";

const PAPER = "#f4f1ea";
/** a reaction: starts 6 frames before the word and lands about 2 frames before it */
const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
/** navy text on paper or yellow: Txt's navy halo would clog the letters */
const Ink: React.FC<{ x: number; y: number; s: number; anchor?: "start" | "middle"; children: React.ReactNode }> = ({ x, y, s, anchor = "middle", children }) => (
  <text x={x} y={y} fontSize={s} fill={NAVY} textAnchor={anchor} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>{children}</text>
);

/** 80-year bar whose sleeping third lights up, above an invoice stamped PAID */
export const Invoice: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 20.5, sheet = at(t, a0 + 0.05, 0.4), typed = c01((t - W("lifetime", a0) + 0.1) / 0.7), bright = at(t, W("twentysix", a0) - 0.1, 0.5), gain = land(t, W("twentysix", a0));
  const from = W("for", a0), paidAt = W("dollars", a0), total = at(t, from - 0.1, 0.25), count = c01((t - from) / (paidAt - 0.1 - from)), stamp = land(t, paidAt), line = "233,600 HOURS × $20";
  const shine = 687 + ((t * 320) % 293);
  return (
    <Frame t={t - a0} title="A LIFETIME OF SLEEP, BOUGHT">
      <Txt x={100} y={222} s={46} anchor="start">80 YEARS OF LIFE</Txt>
      {[0, 1, 2].map((i) => { const k = (t * 0.7 + i / 3) % 1; return <Txt key={i} x={760 + i * 80 + 12 * Math.sin(t * 2 + i)} y={232 - 50 * k} s={36 + 12 * k} c={CYAN} a={(1 - k) * (1 - bright)}>Z</Txt>; })}
      <rect x={100} y={245} width={587} height={80} fill={CYAN} stroke={NAVY} strokeWidth={6} />
      <rect x={687} y={245} width={293} height={80} fill={NAVY} stroke={NAVY} strokeWidth={6} />
      <rect x={687} y={245} width={293 * bright} height={80} fill={Y} />
      {bright > 0.9 && <rect x={shine} y={245} width={Math.min(36, 980 - shine)} height={80} fill="#fff" opacity={0.6} />}
      <Ink x={393} y={300} s={44}>AWAKE</Ink>
      <Txt x={833} y={300} s={40} a={1 - bright}>ASLEEP</Txt>
      <polygon points={`${100 + 880 * c01((t - a0) / 6.2)},328 ${84 + 880 * c01((t - a0) / 6.2)},350 ${116 + 880 * c01((t - a0) / 6.2)},350`} fill={LINE} stroke={NAVY} strokeWidth={4} />
      <g transform={`translate(980 415) scale(${gain * (1 + 0.3 * (1 - gain))})`}><Txt x={0} y={0} s={60} c={Y} anchor="end">+26 YEARS AWAKE</Txt></g>
      <g opacity={sheet} transform={`translate(0 ${150 * (1 - sheet) + 5 * Math.sin(t * 2.2)}) rotate(${-1 + 0.5 * Math.sin(t * 1.3)} 540 800)`}>
        <rect x={130} y={450} width={820} height={720} rx={12} fill={PAPER} stroke={NAVY} strokeWidth={10} />
        <Ink x={540} y={545} s={64}>SLEEP PURCHASE</Ink>
        <rect x={180} y={578} width={720} height={8} fill={NAVY} />
        <Ink x={190} y={680} s={50} anchor="start">{line.slice(0, Math.round(typed * line.length))}</Ink>
        <path d="M180 730H900" stroke={NAVY} strokeWidth={6} strokeDasharray="24 16" />
        <g opacity={total}>
          <Ink x={190} y={815} s={44} anchor="start">TOTAL</Ink>
          <Ink x={540} y={965} s={130}>{`$${(4.67 * count).toFixed(2)} M`}</Ink>
        </g>
        <g opacity={stamp} transform={`translate(640 1068) rotate(${-12 + 1.2 * Math.sin(t * 5)}) scale(${1 + 0.6 * (1 - stamp)})`}>
          <rect x={-150} y={-62} width={300} height={124} rx={12} fill="none" stroke={RED} strokeWidth={12} />
          <Txt x={0} y={30} s={84} c={RED}>PAID</Txt>
        </g>
      </g>
    </Frame>
  );
};

/** YOU's bar falls to the no-sleep bar while the little head swears it is fine */
export const Test: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 31.9, fallFrom = W("weeks", a0), hitAt = W("whole", a0), fall = at(t, fallFrom, hitAt - 0.07 - fallFrom), hit = land(t, hitAt);
  const week2 = t >= W("as", a0) - 0.07, tick = 1 + 0.18 * (1 - at(t, W("as", a0) - 0.07, 0.2)), swear = W("swear", a0), cloud = land(t, swear);
  const youH = 430 - 260 * fall + 6 * Math.sin(t * 7) * (1 - fall), faceX = 540 - 330 * at(t, W("but", a0), 0.35), blink = (t * 0.45) % 1 < 0.05 ? 0.1 : 1;
  return (
    <Frame t={t - a0} title="IT'S REAL. YOU JUST CAN'T FEEL IT">
      <rect x={100} y={170} width={880} height={710} rx={18} fill={NAVY} fillOpacity={0.55} stroke={LINE} strokeWidth={8} />
      <Txt x={130} y={245} s={50} anchor="start">REACTION TEST</Txt>
      <g transform={`translate(820 225) scale(${tick})`}>
        <rect x={-130} y={-37} width={260} height={74} rx={14} fill={Y} stroke={NAVY} strokeWidth={6} />
        <Ink x={0} y={18} s={48}>{week2 ? "WEEK 2" : "WEEK 1"}</Ink>
      </g>
      <circle cx={540} cy={370} r={32} fill={(t * 2) % 1 < 0.5 ? GRN : RED} stroke={NAVY} strokeWidth={6} />
      <rect x={200} y={740 - youH} width={200} height={youH} fill={fall < 0.35 ? GRN : fall < 0.8 ? Y : RED} stroke={NAVY} strokeWidth={6} />
      <rect x={680} y={570} width={200} height={170} fill={RED} stroke={NAVY} strokeWidth={6} />
      <path d="M130 570H950" stroke={Y} strokeWidth={6} strokeDasharray="28 18" strokeDashoffset={-t * 90} />
      <g transform={`translate(540 520) scale(${hit * (1 + 0.4 * (1 - hit))})`}><Txt x={0} y={0} s={60} c={Y}>SAME</Txt></g>
      <path d="M130 740H950" stroke={LINE} strokeWidth={6} />
      <Txt x={300} y={795} s={40}>YOU:</Txt><Txt x={300} y={845} s={40}>6 H A NIGHT</Txt>
      <Txt x={780} y={795} s={40}>NO SLEEP</Txt><Txt x={780} y={845} s={40}>FOR A NIGHT</Txt>
      <g transform={`translate(${faceX} 1080) rotate(${3 * Math.sin(t * 2.5)})`}>
        <path d="M0 -98 C-34 -150 42 -172 44 -130 C44 -108 12 -112 16 -130" fill="none" stroke={NAVY} strokeWidth={10} strokeLinecap="round" />
        <ellipse rx={85} ry={100} fill="#fbf8f4" stroke={NAVY} strokeWidth={8} />
        <ellipse cx={-30} cy={-15} rx={11} ry={15 * blink} fill={NAVY} /><ellipse cx={30} cy={-15} rx={11} ry={15 * blink} fill={NAVY} />
        <path d="M-32 35 Q0 62 32 35" fill="none" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
      </g>
      <circle cx={325} cy={1005} r={15} fill={PAPER} stroke={NAVY} strokeWidth={6} opacity={at(t, swear - 0.42, 0.08)} />
      <circle cx={385} cy={972} r={23} fill={PAPER} stroke={NAVY} strokeWidth={6} opacity={at(t, swear - 0.32, 0.08)} />
      <g opacity={cloud} transform={`translate(680 ${1015 + 6 * Math.sin(t * 3)}) scale(${cloud * (1 + 0.2 * (1 - cloud))})`}>
        {[NAVY, PAPER].map((fill, n) => <g key={fill} fill={fill} stroke={fill} strokeWidth={n ? 0 : 14}>
          <ellipse rx={230} ry={92} /><ellipse cx={-150} cy={5} rx={90} ry={68} /><ellipse cx={150} cy={5} rx={90} ry={68} /><ellipse cx={-60} cy={-65} rx={90} ry={55} /><ellipse cx={70} cy={-65} rx={100} ry={55} />
        </g>)}
        <Ink x={0} y={28} s={80}>I'M FINE</Ink>
      </g>
    </Frame>
  );
};

/** 1 in 3 adults already short of sleep, and the receipt says nobody paid */
export const Market: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 74.7, big = land(t, W("one", a0)), who = W("in", a0), tired = land(t, W("adults", a0)), zzz = at(t, W("sleep", a0) - 0.1, 0.4), low = land(t, W("sleep", a0));
  const centAt = W("cent", a0), slide = at(t, W("paying", a0) - 0.1, centAt - 0.07 - W("paying", a0) + 0.1), stamp = land(t, centAt), yawn = 8 + 30 * Math.max(0, Math.sin(t * 2.4));
  return (
    <Frame t={t - a0} title="ALREADY SOLD, FOR FREE">
      <g transform={`translate(540 340) scale(${big * (1 + 0.35 * (1 - big)) + 0.02 * Math.sin(t * 3) * big})`}><Txt x={0} y={0} s={190} c={Y}>1 IN 3</Txt></g>
      {[230, 540, 850].map((x, i) => { const pop = at(t, who - 0.3 + i * 0.1, 0.2), me = i === 1, fill = me && tired > 0.5 ? RED : DIM;
        return <g key={x} transform={`translate(${x} ${500 + 5 * Math.sin(t * 1.8 + i * 2)}) scale(${pop})`}>
          <circle cy={40} r={85} fill={fill} stroke={NAVY} strokeWidth={6} />
          <rect x={-105} y={135} width={210} height={365} rx={60} fill={fill} stroke={NAVY} strokeWidth={6} />
          {me && tired > 0.5 && <>
            <path d="M-48 18 q18 -14 36 0 M12 18 q18 -14 36 0" fill="none" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
            <ellipse cy={72} rx={26} ry={yawn * 0.8} fill={NAVY} />
          </>}
        </g>; })}
      {[0, 1, 2].map((i) => { const k = (t * 0.55 + i / 3) % 1; return <Txt key={i} x={640 + 110 * k + 10 * Math.sin(t * 3 + i)} y={530 - 105 * k} s={36 + 18 * k} c={Y} a={zzz * (1 - k * k)}>Z</Txt>; })}
      <Txt x={540} y={1100} s={64} c={Y} a={low * (1 - slide)}>TOO LITTLE SLEEP</Txt>
      <g transform={`translate(${1000 * (1 - slide) + 3 * Math.sin(t * 6)} 0) rotate(-2 540 1030)`}>
        <path d="M180 880H900V1150L860 1180L820 1150L780 1180L740 1150L700 1180L660 1150L620 1180L580 1150L540 1180L500 1150L460 1180L420 1150L380 1180L340 1150L300 1180L260 1150L220 1180L180 1150Z" fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <Ink x={540} y={945} s={48}>RECEIPT</Ink>
        <g transform={`translate(540 1060) rotate(-4) scale(${1 + 0.1 * (1 - stamp)})`} opacity={0.35 + 0.65 * stamp}>
          <rect x={-320} y={-68} width={640} height={124} rx={12} fill="none" stroke={RED} strokeWidth={10} />
          <Txt x={0} y={22} s={76} c={RED}>PAID: $0.00</Txt>
        </g>
      </g>
    </Frame>
  );
};
