import React from "react";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import VO from "./vo.json";

const FPS = 30;
export const REEL_DURATION = Math.round(VO.total * FPS);

const INK = "#0B0D12";
const BLUE = "#2F5BFF";
const SOFT_BLUE = "#7C9BFF";
const GREEN = "#22C55E";
const MUTED = "#A3AAB8";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

type Line = { text: string; file: string; seconds: number; start: number };
const LINES = VO.lines as Line[];
const at = (i: number) => Math.round(LINES[i].start * FPS);
const len = (i: number) => (i < LINES.length - 1 ? at(i + 1) : REEL_DURATION) - at(i);

// Word timings, approximated from each line's length: longer words and punctuation take longer.
const wordTimes = (line: Line) => {
  const words = line.text.split(" ");
  const weight = words.map((w) => w.length + 2 + (/[.,:]$/.test(w) ? 4 : 0));
  const sum = weight.reduce((a, b) => a + b, 0);
  let acc = 0;
  return words.map((w, k) => {
    const t = (acc / sum) * line.seconds;
    acc += weight[k];
    return { w, t };
  });
};

const Captions: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const sec = f / FPS;
  const words = wordTimes(LINES[i]);
  return (
    <div style={{ position: "absolute", left: 80, right: 150, top: 1170, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
      {words.map(({ w, t }, k) => {
        const on = sec >= t;
        const current = on && (k === words.length - 1 || sec < words[k + 1].t);
        return (
          <span key={k} style={{
            fontSize: 80, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5,
            color: current ? "#fff" : on ? "#fff" : "rgba(255,255,255,0.18)",
            background: current ? BLUE : "transparent", borderRadius: 14, padding: "0 12px",
            scale: current ? interpolate(sec - t, [0, 0.12], [0.9, 1], { ...clamp, easing: easeOut }) : 1,
            textShadow: current ? "none" : "0 4px 24px rgba(0,0,0,0.6)",
          }}>{w}</span>
        );
      })}
    </div>
  );
};

const Fade: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, 6, d - 5, d], [0, 1, 1, 0], clamp) }}>{children}</AbsoluteFill>;
};

const Phone: React.FC<{ src: string; w: number; left: number; top: number; rotate?: number; delay?: number }> = ({ src, w, left, top, rotate = 0, delay = 0 }) => {
  const f = useCurrentFrame();
  const h = w * (844 / 390);
  return (
    <div style={{
      position: "absolute", left, top, width: w + 20, height: h + 20, padding: 10, borderRadius: w * 0.15, background: "#1B1E26",
      boxShadow: "0 0 0 2px #2E323D, 0 40px 100px rgba(0,0,0,0.55)", rotate: `${rotate}deg`,
      opacity: interpolate(f, [delay, delay + 6], [0, 1], clamp),
      translate: interpolate(f, [delay, delay + 14], ["0px 80px", "0px 0px"], { ...clamp, easing: easeOut }),
    }}>
      <Img src={staticFile(src)} style={{ width: w, height: h, borderRadius: w * 0.12, display: "block" }} />
    </div>
  );
};

// 0: hook, the 16 screens drifting
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const names = ["Today", "Workout", "Rest", "Summary", "Progress", "Settings", "History", "Workout-dark"];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -120, top: 160, width: 1400, display: "flex", flexWrap: "wrap", gap: 26, rotate: "-8deg",
        translate: interpolate(f, [0, 90], ["0px 0px", "-90px -60px"], clamp), scale: interpolate(f, [0, 90], [1.08, 1], { ...clamp, easing: easeOut }) }}>
        {[...names, ...names].map((n, k) => (
          <Img key={k} src={staticFile(`grid/${k < 8 ? "iOS" : "Android"}-${(k % 8) + 1}-${n}.png`)}
            style={{ width: 300, borderRadius: 26, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", opacity: interpolate(f, [k * 1.5, k * 1.5 + 8], [0, 1], clamp) }} />
        ))}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,13,18,0) 40%, rgba(11,13,18,0.96) 58%)" }} />
    </AbsoluteFill>
  );
};

const Recording: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 40, top: 230, width: 1000, height: 900, borderRadius: 30, overflow: "hidden", boxShadow: "0 0 0 2px #2E323D, 0 40px 100px rgba(0,0,0,0.6)" }}>
      <Video src={staticFile(src)} muted style={{ position: "absolute", left: -260, top: -20, height: 940, width: 1450 }} />
    </div>
    <div style={{ position: "absolute", left: 40, top: 160, color: MUTED, fontSize: 30, fontWeight: 600, letterSpacing: 3 }}>REAL SCREEN RECORDING · FIGCRAFT</div>
  </AbsoluteFill>
);

const Prompt: React.FC = () => {
  const f = useCurrentFrame();
  const text = "Design a lifting tracker for iOS and Android";
  const shown = Math.min(text.length, Math.max(0, Math.floor((f - 26) / 1.4)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 470, padding: "44px 46px", borderRadius: 30, background: "#151821", border: "1px solid #262A35", fontFamily: MONO, fontSize: 52, lineHeight: 1.35, color: "#fff" }}>
        <div style={{ color: MUTED, fontSize: 28, marginBottom: 18, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: 3 }}>CLAUDE CODE</div>
        <span style={{ color: BLUE }}>{"> "}</span>{text.slice(0, shown)}
        <span style={{ color: BLUE, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }}>▍</span>
      </div>
    </AbsoluteFill>
  );
};

const Platforms: React.FC = () => (
  <AbsoluteFill>
    <Phone src="grid/Android-1-Today.png" w={300} left={60} top={330} rotate={-6} delay={0} />
    <Phone src="grid/iOS-8-Workout-dark.png" w={300} left={720} top={330} rotate={6} delay={22} />
    <Phone src="grid/iOS-1-Today.png" w={330} left={375} top={260} delay={10} />
  </AbsoluteFill>
);

const Tap: React.FC = () => {
  const f = useCurrentFrame();
  const screen = f < 34 ? "1-Today" : f < 64 ? "2-Workout" : "3-Rest";
  const taps = [{ t: 30, x: 195, y: 537 }, { t: 60, x: 195, y: 774 }];
  const S = 1.15;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: (1080 - 390 * S - 24) / 2, top: 150, padding: 12, borderRadius: 66, background: "#1B1E26", boxShadow: "0 0 0 2px #2E323D, 0 40px 100px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "relative", width: 390 * S, height: 844 * S, borderRadius: 54, overflow: "hidden" }}>
          <Img src={staticFile(`grid/iOS-${screen}.png`)} style={{ width: "100%", height: "100%" }} />
          <div style={{ position: "absolute", left: (390 * S - 120) / 2, top: 12, width: 120, height: 34, borderRadius: 17, background: "#000" }} />
          {taps.map((p) => (
            <div key={p.t} style={{ position: "absolute", left: p.x * S - 32, top: p.y * S - 32, width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.55)", border: `4px solid ${BLUE}`,
              opacity: interpolate(f, [p.t - 10, p.t - 4, p.t + 2, p.t + 8], [0, 1, 1, 0], clamp), scale: interpolate(f, [p.t - 10, p.t, p.t + 6], [1.3, 0.75, 1.1], clamp) }} />
          ))}
        </div>
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,13,18,0) 52%, rgba(11,13,18,0.95) 60%)" }} />
    </AbsoluteFill>
  );
};

const Checks: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [40, 90], [0, 137], { ...clamp, easing: easeOut }));
  const row = (d: number, c: React.ReactNode) => <div style={{ marginTop: 18, opacity: interpolate(f, [d, d + 5], [0, 1], clamp) }}>{c}</div>;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300, padding: "44px 46px", borderRadius: 30, background: "#151821", border: "1px solid #262A35", fontFamily: MONO, fontSize: 38, color: "#fff" }}>
        {row(0, <><span style={{ color: MUTED }}>$ </span>check_design.py</>)}
        {row(36, <span style={{ color: GREEN, fontSize: 64, fontWeight: 700 }}>{n} passed</span>)}
        {row(48, <span style={{ color: GREEN }}>0 failed</span>)}
        {row(70, <><span style={{ color: MUTED }}>$ </span>audit_design.py</>)}
        {row(100, <span style={{ color: GREEN, fontSize: 64, fontWeight: 700 }}>0 issues</span>)}
        {row(110, <span style={{ color: MUTED, fontSize: 28 }}>contrast · tap targets · 16 screens</span>)}
      </div>
    </AbsoluteFill>
  );
};

const Install: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", color: "#fff", fontSize: 92, fontWeight: 800, letterSpacing: -3,
        scale: interpolate(f, [0, 14], [0.92, 1], { ...clamp, easing: easeOut }) }}>mobile-app-designer</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 510, textAlign: "center", color: MUTED, fontSize: 40 }}>a free skill for Claude Code</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 640, padding: "34px 30px", borderRadius: 26, background: "#151821", border: `2px solid ${BLUE}`, fontFamily: MONO, fontSize: 36, color: "#fff", textAlign: "center", lineHeight: 1.4,
        opacity: interpolate(f, [8, 16], [0, 1], clamp) }}>
        npx skills add<br /><span style={{ color: SOFT_BLUE }}>chrollo-03/mobile-app-designer</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", color: MUTED, fontSize: 30, opacity: interpolate(f, [14, 22], [0, 1], clamp) }}>github.com/chrollo-03/mobile-app-designer</div>
    </AbsoluteFill>
  );
};

const VISUALS: React.FC[] = [
  Hook,
  () => <Recording src="rec-fast.webm" />,
  Prompt,
  () => <Recording src="reel-rec2.webm" />,
  Platforms,
  Tap,
  Checks,
  Install,
];

const Scenes: React.FC = () => (
  <>
    {LINES.map((_, i) => {
      const V = VISUALS[i];
      return (
        <Sequence key={i} from={i === 0 ? 0 : at(i)} durationInFrames={i === 0 ? at(1) : len(i)}>
          <Fade d={i === 0 ? at(1) : len(i)}><V /></Fade>
        </Sequence>
      );
    })}
    {LINES.map((_, i) => (
      <Sequence key={`c${i}`} from={at(i)} durationInFrames={len(i)}>
        <Captions i={i} />
      </Sequence>
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 64, display: "flex", justifyContent: "center" }}><div style={{ padding: "10px 24px", borderRadius: 30, background: "rgba(11,13,18,0.85)", border: "1px solid #262A35", color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>CLAUDE CODE SKILL</div></div>
  </>
);

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ background: INK, fontFamily: "Inter, sans-serif" }}>
    {/* Frame 0 shows the settled hook so the reel's cover is a real frame */}
    <Freeze frame={Math.round(LINES[0].start * FPS) + 60} active={(f) => f === 0}>
      <Scenes />
    </Freeze>
    <Audio src={staticFile("reel-bed.wav")} volume={0.32} />
    {LINES.map((l, i) => (
      <Sequence key={`a${i}`} from={at(i)} layout="none">
        <Audio src={staticFile(l.file)} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
