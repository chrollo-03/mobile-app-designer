import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const INK = "#0B0D12";
const BLUE = "#2F5BFF";
const MUTED = "#A3AAB8";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

// One captured FigCraft window per step, in the order they were taken.
const STEPS: { title: string; cmd: string; note?: "bug" | "fix" | "done" }[] = [
  { title: "The finished file: 16 screens", cmd: "inspect_document" },
  { title: "New page, empty 390 x 844 frame", cmd: "page.add · node.create frame" },
  { title: "Status bar and title", cmd: "node.create text × 3" },
  { title: "Timer track", cmd: "node.create ellipse, stroke 14" },
  { title: "Progress arc, first try: a pie slice", cmd: "node.set arcStart 270° arcSweep 60%", note: "bug" },
  { title: "Fixed: filled ring, inner ratio 0.883", cmd: "node.set fill #2F5BFF arcInner 0.883", note: "fix" },
  { title: "Countdown", cmd: "node.create text 64 Bold" },
  { title: "Next-set card", cmd: "node.create frame layout vertical" },
  { title: "−15 s and +15 s", cmd: "node.create frame × 2, fill" },
  { title: "Skip rest and home indicator", cmd: "node.create frame #2F5BFF" },
  { title: "Rest screen rebuilt live", cmd: "select []", note: "done" },
  { title: "137 checks passed, 0 contrast issues", cmd: "check_design.py · audit_design.py", note: "done" },
];

export const INTRO = 60;
export const HOLD = 66;
export const XF = 10;
export const MAKING_OF_DURATION = INTRO + STEPS.length * HOLD + 30;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const Shot: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const from = INTRO + i * HOLD;
  if (frame < from - XF || frame > from + HOLD + XF) return null;
  const last = i === STEPS.length - 1;
  return (
    <Img
      src={staticFile(`build/${String(i).padStart(2, "0")}.png`)}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: interpolate(frame, [from - XF, from, from + HOLD, from + HOLD + XF], [0, 1, 1, last ? 1 : 0], clamp),
      }}
    />
  );
};

const Window: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 1300, H = 1300 * (900 / 1440);
  return (
    <div
      style={{
        position: "absolute", left: 560, top: (1080 - H - 36) / 2, width: W, height: H + 36,
        borderRadius: 14, overflow: "hidden", background: "#16181D",
        boxShadow: "0 0 0 1px #2E323D, 0 40px 120px rgba(0,0,0,0.6)",
        opacity: interpolate(frame, [INTRO - 20, INTRO], [0, 1], clamp),
        translate: interpolate(frame, [INTRO - 20, INTRO], ["0px 40px", "0px 0px"], { ...clamp, easing: easeOut }),
      }}
    >
      <div style={{ height: 36, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: "#1F2229" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: MUTED, fontSize: 15, marginRight: 60 }}>Barwise · FigCraft</div>
      </div>
      <div style={{ position: "relative", width: W, height: H }}>
        {STEPS.map((_, i) => <Shot key={i} i={i} />)}
      </div>
    </div>
  );
};

const StepList: React.FC = () => {
  const frame = useCurrentFrame();
  const current = Math.min(STEPS.length - 1, Math.max(0, Math.floor((frame - INTRO) / HOLD)));
  if (frame < INTRO - 20) return null;
  const s = STEPS[current];
  const color = s.note === "bug" ? "#F87171" : s.note === "fix" || s.note === "done" ? "#22C55E" : BLUE;
  return (
    <div style={{ position: "absolute", left: 70, top: 150, width: 440, opacity: interpolate(frame, [INTRO - 20, INTRO], [0, 1], clamp) }}>
      <div style={{ color: MUTED, fontSize: 22, fontWeight: 600, letterSpacing: 3 }}>HOW IT WAS MADE</div>
      <div style={{ color: "#fff", fontSize: 44, fontWeight: 700, lineHeight: 1.1, marginTop: 14 }}>Claude Code drives FigCraft live over MCP</div>
      <div style={{ marginTop: 56, color, fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
        STEP {String(current + 1).padStart(2, "0")} / {STEPS.length}{s.note === "bug" ? " · BUG" : s.note === "fix" ? " · FIXED" : ""}
      </div>
      <div style={{ color: "#fff", fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginTop: 12, minHeight: 84 }}>{s.title}</div>
      <div style={{ marginTop: 22, padding: "16px 18px", borderRadius: 12, background: "#151821", border: "1px solid #262A35", color: "#C9D2FF", fontFamily: MONO, fontSize: 19, lineHeight: 1.4 }}>
        <span style={{ color: MUTED }}>{s.cmd.includes(".py") ? "$ python3 " : "figcraft › "}</span>{s.cmd}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= current ? BLUE : "#262A35" }} />
        ))}
      </div>
    </div>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > INTRO) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [0, 12, INTRO - 18, INTRO - 4], [0, 1, 1, 0], clamp) }}>
      <div style={{ color: MUTED, fontSize: 30, fontWeight: 600, letterSpacing: 4 }}>THE MAKING OF BARWISE</div>
      <div style={{ color: "#fff", fontSize: 76, fontWeight: 700, marginTop: 18 }}>Designed live by Claude Code</div>
      <div style={{ color: MUTED, fontSize: 32, marginTop: 16 }}>Real captures of the FigCraft window, one per step</div>
    </AbsoluteFill>
  );
};

export const MakingOf: React.FC = () => (
  <AbsoluteFill style={{ background: INK, fontFamily: "Inter, sans-serif" }}>
    <Title />
    <Window />
    <StepList />
  </AbsoluteFill>
);
