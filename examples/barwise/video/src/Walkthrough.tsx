import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Screen units are the design's iOS points (390 x 844).
const SCREEN_W = 390;
const SCREEN_H = 844;
const S = 1.1; // points -> video pixels
const BEZEL = 12;

const INK = "#0B0D12";
const BLUE = "#2F5BFF";
const MUTED = "#A3AAB8";

type Transition = "cut" | "push" | "dissolve" | "slideUp";

type Step = {
  img: string;
  start: number; // frame the screen becomes current
  enter: Transition;
  tap?: { x: number; y: number; at: number };
  kicker: string;
  title: string;
  body: string;
};

const T = 12; // transition length in frames

export const STEPS: Step[] = [
  {
    img: "today.png", start: 60, enter: "cut",
    tap: { x: 195, y: 537, at: 140 },
    kicker: "01 · TODAY", title: "Plan today's session",
    body: "Week streak, today's workout and new records on one screen.",
  },
  {
    img: "workout.png", start: 155, enter: "push",
    tap: { x: 195, y: 774, at: 245 },
    kicker: "02 · WORKOUT", title: "Log every set",
    body: "Last session's numbers sit next to today's inputs.",
  },
  {
    img: "rest.png", start: 260, enter: "dissolve",
    tap: { x: 195, y: 740, at: 335 },
    kicker: "03 · REST", title: "Rest timer",
    body: "Dark and calm, readable from across the gym.",
  },
  {
    img: "workout.png", start: 350, enter: "dissolve",
    tap: { x: 340, y: 80, at: 395 },
    kicker: "04 · FINISH", title: "One tap to finish",
    body: "Every action is the same electric blue.",
  },
  {
    img: "summary.png", start: 410, enter: "slideUp",
    tap: { x: 195, y: 774, at: 500 },
    kicker: "05 · SUMMARY", title: "See your new records",
    body: "Green only ever means good news.",
  },
  {
    img: "today.png", start: 515, enter: "dissolve",
    tap: { x: 241, y: 795, at: 560 },
    kicker: "06 · TABS", title: "Back to today",
    body: "Four tabs: Today, History, Progress, Settings.",
  },
  {
    img: "progress.png", start: 575, enter: "cut",
    tap: { x: 148, y: 795, at: 650 },
    kicker: "07 · PROGRESS", title: "Track strength over months",
    body: "Estimated 1-rep max and sets per muscle.",
  },
  {
    img: "history.png", start: 665, enter: "cut",
    tap: { x: 334, y: 795, at: 740 },
    kicker: "08 · HISTORY", title: "Every session at a glance",
    body: "Monthly totals, then each workout with its records.",
  },
  {
    img: "settings.png", start: 755, enter: "cut",
    kicker: "09 · SETTINGS", title: "Your gym, your units",
    body: "kg or lb, default rest, bar weight, appearance.",
  },
];

export const OUTRO = 840;
export const DURATION = 990;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const ScreenLayer: React.FC<{ step: Step; next?: Step }> = ({ step, next }) => {
  const frame = useCurrentFrame();
  if (frame < step.start - T || (next && frame > next.start + T)) return null;

  // Entering
  const p = interpolate(frame, [step.start - T, step.start], [0, 1], { ...clamp, easing: easeOut });
  let tx = 0, ty = 0, op = 1;
  if (step.enter === "push") tx = (1 - p) * SCREEN_W;
  if (step.enter === "slideUp") ty = (1 - p) * SCREEN_H;
  if (step.enter === "dissolve") op = p;
  if (step.enter === "cut") op = frame >= step.start - 1 ? 1 : 0;

  // Leaving (pushed by the next screen)
  if (next && next.enter === "push") {
    const q = interpolate(frame, [next.start - T, next.start], [0, 1], { ...clamp, easing: easeOut });
    tx -= q * SCREEN_W * 0.3;
  }
  if (next && frame >= next.start) op = next.enter === "cut" || next.enter === "dissolve" ? 0 : op;

  return (
    <Img
      src={staticFile(`screens/${step.img}`)}
      style={{
        position: "absolute", width: SCREEN_W * S, height: SCREEN_H * S,
        translate: `${tx * S}px ${ty * S}px`, opacity: op,
      }}
    />
  );
};

const TapDot: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  if (frame < at - 14 || frame > at + 14) return null;
  return (
    <div
      style={{
        position: "absolute", left: x * S - 28, top: y * S - 28, width: 56, height: 56,
        borderRadius: 28, background: "rgba(255,255,255,0.55)", border: `3px solid ${BLUE}`,
        boxShadow: "0 4px 16px rgba(11,13,18,0.35)",
        opacity: interpolate(frame, [at - 14, at - 6, at + 4, at + 14], [0, 1, 1, 0], clamp),
        scale: interpolate(frame, [at - 14, at - 6, at, at + 6], [1.3, 1, 0.75, 1.15], clamp),
      }}
    />
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const w = SCREEN_W * S + BEZEL * 2;
  const h = SCREEN_H * S + BEZEL * 2;
  return (
    <div
      style={{
        position: "absolute", left: 300, top: (1080 - h) / 2, width: w, height: h,
        borderRadius: 64, background: "#1B1E26", padding: BEZEL,
        boxShadow: "0 0 0 2px #2E323D, 0 40px 120px rgba(0,0,0,0.55)",
        translate: interpolate(frame, [50, 74], ["0px 1200px", "0px 0px"], { ...clamp, easing: easeOut }),
        opacity: interpolate(frame, [OUTRO, OUTRO + 12], [1, 0], clamp),
      }}
    >
      <div style={{ position: "relative", width: SCREEN_W * S, height: SCREEN_H * S, borderRadius: 52, overflow: "hidden", background: "#F5F6F8" }}>
        {STEPS.map((s, i) => <ScreenLayer key={i} step={s} next={STEPS[i + 1]} />)}
        {STEPS.map((s, i) => s.tap ? <TapDot key={i} {...s.tap} /> : null)}
        {/* Dynamic Island */}
        <div style={{ position: "absolute", left: (SCREEN_W * S - 120) / 2, top: 12, width: 120, height: 34, borderRadius: 17, background: "#000" }} />
      </div>
    </div>
  );
};

const Caption: React.FC<{ step: Step; end: number }> = ({ step, end }) => {
  const frame = useCurrentFrame();
  const from = step.start - 4;
  if (frame < from || frame > end) return null;
  return (
    <div
      style={{
        position: "absolute", left: 900, top: 380, width: 760,
        opacity: interpolate(frame, [from, from + 12, end - 8, end], [0, 1, 1, 0], clamp),
        translate: interpolate(frame, [from, from + 16], ["0px 28px", "0px 0px"], { ...clamp, easing: easeOut }),
      }}
    >
      <div style={{ color: BLUE, fontSize: 26, fontWeight: 700, letterSpacing: 3 }}>{step.kicker}</div>
      <div style={{ color: "#fff", fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 18 }}>{step.title}</div>
      <div style={{ color: MUTED, fontSize: 34, lineHeight: 1.35, marginTop: 24 }}>{step.body}</div>
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 70) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [40, 62], [1, 0], clamp) }}>
      <Img src={staticFile("icon.png")} style={{ width: 180, height: 180, borderRadius: 42, scale: interpolate(frame, [0, 20], [0.6, 1], { ...clamp, easing: Easing.spring({ damping: 12 }) }) }} />
      <div style={{ color: "#fff", fontSize: 84, fontWeight: 700, marginTop: 36, opacity: interpolate(frame, [8, 22], [0, 1], clamp) }}>Barwise</div>
      <div style={{ color: MUTED, fontSize: 32, marginTop: 10, opacity: interpolate(frame, [14, 28], [0, 1], clamp) }}>A lifting tracker · interactive prototype</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < OUTRO) return null;
  const card = (src: string, i: number) => (
    <div key={src} style={{
      width: 280, height: 280 * (844 / 390), borderRadius: 40, overflow: "hidden",
      boxShadow: "0 0 0 2px #2E323D, 0 30px 80px rgba(0,0,0,0.5)",
      opacity: interpolate(frame, [OUTRO + 14 + i * 6, OUTRO + 30 + i * 6], [0, 1], clamp),
      translate: interpolate(frame, [OUTRO + 14 + i * 6, OUTRO + 34 + i * 6], ["0px 60px", "0px 0px"], { ...clamp, easing: easeOut }),
    }}>
      <Img src={staticFile(`screens/${src}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 237, display: "flex", gap: 32 }}>
        {card("today.png", 0)}
        {card("android-today.png", 1)}
        {card("workout-dark.png", 2)}
      </div>
      <div style={{ position: "absolute", left: 1080, top: 400, width: 740, opacity: interpolate(frame, [OUTRO + 30, OUTRO + 46], [0, 1], clamp) }}>
        <div style={{ color: "#fff", fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>16 screens, iOS + Android, dark mode</div>
        <div style={{ color: MUTED, fontSize: 30, marginTop: 14 }}>Designed in FigCraft with the mobile-app-designer skill for Claude Code</div>
        <div style={{ color: BLUE, fontSize: 30, fontWeight: 600, marginTop: 14 }}>github.com/chrollo-03/mobile-app-designer</div>
      </div>
    </>
  );
};

export const Walkthrough: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: INK, fontFamily: "Inter, sans-serif" }}>
      <Intro />
      <Phone />
      {STEPS.map((s, i) => <Caption key={i} step={s} end={(STEPS[i + 1]?.start ?? OUTRO) - 6} />)}
      <Outro />
    </AbsoluteFill>
  );
};
