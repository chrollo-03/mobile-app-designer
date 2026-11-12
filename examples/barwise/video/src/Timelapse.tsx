import React from "react";
import KEPT from "./keptTimes.json";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

const INK = "#0B0D12";
const BLUE = "#2F5BFF";
const MUTED = "#A3AAB8";

// rec-active.webm: the 24:07 screen recording with every unchanged frame removed (128.3 s left).
const CLIP_SECONDS = 128.3;
const RATE = 1.6;
export const TL_INTRO = 75;
const CLIP_FRAMES = Math.round((CLIP_SECONDS / RATE) * 30);
export const TL_DURATION = TL_INTRO + CLIP_FRAMES + 75;

// Chapters, in seconds of the active clip.
const CHAPTERS: { at: number; title: string; body: string }[] = [
  { at: 0, title: "iOS screens", body: "Today and Workout, built layer by layer over MCP." },
  { at: 10, title: "Rest, Summary, Progress", body: "Every frame checked with a screenshot before moving on." },
  { at: 28, title: "Prototype test", body: "Start workout, log set, rest, finish, wired up and clicked through." },
  { at: 38, title: "Settings, History, dark mode", body: "Dark mode recoloured in one pass with the selection colour tools." },
  { at: 60, title: "Android versions", body: "412 x 917 frames, 48 dp targets, pill buttons, gesture bar." },
  { at: 70, title: "Recolour to electric blue", body: "One accent for every action, green only for records." },
  { at: 88, title: "Prototype check", body: "Today, History and Settings in the prototype player." },
  { at: 100, title: "Fixes", body: "Clipped tab icons rebuilt, History rebalanced. 137 checks pass." },
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const toFrame = (s: number) => TL_INTRO + Math.round((s / RATE) * 30);

const Panel: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < TL_INTRO - 15 || frame > TL_INTRO + CLIP_FRAMES) return null;
  const clipSec = Math.max(0, ((frame - TL_INTRO) / 30) * RATE);
  const idx = CHAPTERS.reduce((a, c, i) => (clipSec >= c.at ? i : a), 0);
  const c = CHAPTERS[idx];
  const from = toFrame(c.at);
  // Real wall-clock time covered: the recording ran 24:07.
  // Original timestamp of the frame on screen (one entry per kept frame, 10 per second of clip).
  const real = (KEPT as number[])[Math.min(KEPT.length - 1, Math.floor(clipSec * 10))];
  const mm = String(Math.floor(real / 60)).padStart(2, "0");
  const ss = String(real % 60).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: 70, top: 150, width: 420 }}>
      <div style={{ color: MUTED, fontSize: 22, fontWeight: 600, letterSpacing: 3 }}>24 MINUTES IN ONE TAKE</div>
      <div style={{ color: "#fff", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginTop: 14 }}>The whole Barwise session, sped up</div>
      <div style={{ marginTop: 50, color: BLUE, fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
        {String(idx + 1).padStart(2, "0")} / {CHAPTERS.length}
      </div>
      <div
        style={{
          opacity: interpolate(frame, [from, from + 10], [0, 1], clamp),
          translate: interpolate(frame, [from, from + 14], ["0px 18px", "0px 0px"], { ...clamp, easing: easeOut }),
        }}
      >
        <div style={{ color: "#fff", fontSize: 38, fontWeight: 700, lineHeight: 1.15, marginTop: 10 }}>{c.title}</div>
        <div style={{ color: MUTED, fontSize: 26, lineHeight: 1.4, marginTop: 14, minHeight: 110 }}>{c.body}</div>
      </div>
      <div style={{ marginTop: 30, display: "flex", alignItems: "baseline", gap: 14 }}>
        <div style={{ color: "#fff", fontSize: 54, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</div>
        <div style={{ color: MUTED, fontSize: 22 }}>of 24:07 real time</div>
      </div>
      <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: "#262A35" }}>
        <div style={{ width: `${(real / 1447) * 100}%`, height: 6, borderRadius: 3, background: BLUE }} />
      </div>
    </div>
  );
};

const Window: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1300, H = Math.round(1300 * (934 / 1440));
  return (
    <div
      style={{
        position: "absolute", left: 560, top: (1080 - H) / 2 + 20, width: W, height: H,
        borderRadius: 14, overflow: "hidden", background: "#16181D",
        boxShadow: "0 0 0 1px #2E323D, 0 40px 120px rgba(0,0,0,0.6)",
        opacity: interpolate(frame, [TL_INTRO - 15, TL_INTRO, TL_INTRO + CLIP_FRAMES, TL_INTRO + CLIP_FRAMES + 15], [0, 1, 1, 0], clamp),
      }}
    >
      <Sequence from={TL_INTRO} durationInFrames={CLIP_FRAMES} layout="none">
        <Video src={staticFile("rec-active.webm")} playbackRate={RATE} muted style={{ width: W, height: H, display: "block" }} />
      </Sequence>
    </div>
  );
};

const Card: React.FC<{ from: number; kicker: string; title: string; sub: string }> = ({ from, kicker, title, sub }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  if (local < 0 || local > 75) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(local, [0, 10, 60, 75], [0, 1, 1, 0], clamp) }}>
      <div style={{ color: MUTED, fontSize: 28, fontWeight: 600, letterSpacing: 4 }}>{kicker}</div>
      <div style={{ color: "#fff", fontSize: 78, fontWeight: 700, marginTop: 16 }}>{title}</div>
      <div style={{ color: MUTED, fontSize: 32, marginTop: 14 }}>{sub}</div>
    </AbsoluteFill>
  );
};

const SpeedLabel: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < TL_INTRO - 15 || frame > TL_INTRO + CLIP_FRAMES) return null;
  return (
    <div style={{ position: "absolute", left: 560, top: 70, color: MUTED, fontSize: 22, letterSpacing: 1 }}>
      Real screen recording · idle moments cut · {Math.round(1447 / (CLIP_FRAMES / 30))}x faster than real time
    </div>
  );
};

export const Timelapse: React.FC = () => (
  <AbsoluteFill style={{ background: INK, fontFamily: "Inter, sans-serif" }}>
    <Card from={0} kicker="SCREEN RECORDING · 24:07" title="Claude Code designing Barwise" sub="FigCraft window only, idle moments removed, active work sped up" />
    <Window />
    <Panel />
    <SpeedLabel />
    <Card from={TL_INTRO + CLIP_FRAMES} kicker="RESULT" title="16 screens · 137 / 137 checks" sub="github.com/chrollo-03/mobile-app-designer" />
  </AbsoluteFill>
);
