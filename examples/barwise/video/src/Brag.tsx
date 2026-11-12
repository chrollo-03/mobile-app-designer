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

// 120 BPM at 30 fps: 1 beat = 15 frames. Every cut is on a beat.
export const BRAG_DURATION = 600;
const POSTER = 170;

const INK = "#0B0D12";
const BLUE = "#2F5BFF";
const GREEN = "#22C55E";
const MUTED = "#A3AAB8";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

const SCREENS = ["Today", "Workout", "Rest", "Summary", "Progress", "Settings", "History", "Workout-dark"];

// Old content out over 6 frames before the cut, new content in after it.
const sceneOpacity = (f: number, dur: number) => interpolate(f, [0, 6, dur - 6, dur], [0, 1, 1, 0], clamp);

const Caption: React.FC<{ text: string; f: number; dur: number; top?: number; size?: number }> = ({ text, f, dur, top = 80, size = 64 }) => (
  <div
    style={{
      position: "absolute", top, left: 0, right: 0, textAlign: "center", color: "#fff",
      fontSize: size, fontWeight: 700, letterSpacing: -1,
      opacity: interpolate(f, [4, 14, dur - 6, dur], [0, 1, 1, 0], clamp),
      translate: interpolate(f, [4, 18], ["0px 24px", "0px 0px"], { ...clamp, easing: easeOut }),
    }}
  >
    {text}
  </div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const prompt = "Design a lifting tracker for iOS and Android";
  const shown = Math.min(prompt.length, Math.max(0, Math.floor((f - 6) / 1.1)));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: sceneOpacity(f, 90) }}>
      <div style={{ color: MUTED, fontSize: 30, fontWeight: 600, letterSpacing: 4, marginBottom: 28 }}>ONE PROMPT</div>
      <div style={{ padding: "34px 44px", borderRadius: 22, background: "#151821", border: "1px solid #262A35", fontFamily: MONO, fontSize: 46, color: "#fff", minWidth: 1180 }}>
        <span style={{ color: BLUE }}>{"> "}</span>
        {prompt.slice(0, shown)}
        <span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: BLUE }}>▍</span>
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const w = 170, h = Math.round(170 * (844 / 390)), gap = 22;
  const total = 8 * w + 7 * gap;
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(f, 90) }}>
      <Caption text="16 screens. iOS and Android." f={f} dur={90} top={70} size={60} />
      {[0, 1].map((row) =>
        SCREENS.map((name, i) => {
          const k = row * 8 + i;
          const at = 2 + k * 3.75; // one screen per 16th note
          return (
            <Img
              key={k}
              src={staticFile(`grid/${row ? "Android" : "iOS"}-${i + 1}-${name}.png`)}
              style={{
                position: "absolute", left: (1920 - total) / 2 + i * (w + gap), top: 200 + row * (h + 26),
                width: w, height: h, borderRadius: 16, boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
                opacity: interpolate(f, [at, at + 6], [0, 1], clamp),
                translate: interpolate(f, [at, at + 12], ["0px 60px", "0px 0px"], { ...clamp, easing: easeOut }),
                scale: interpolate(f, [at, at + 12], [0.92, 1], { ...clamp, easing: easeOut }),
              }}
            />
          );
        }),
      )}
    </AbsoluteFill>
  );
};

const Live: React.FC = () => {
  const f = useCurrentFrame();
  const W = 1360, H = Math.round(1360 * (934 / 1440));
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(f, 120) }}>
      <Caption text="Designed live in FigCraft." f={f} dur={120} top={50} size={56} />
      <div
        style={{
          position: "absolute", left: (1920 - W) / 2, top: 150, width: W, height: H, borderRadius: 14, overflow: "hidden",
          boxShadow: "0 0 0 1px #2E323D, 0 40px 120px rgba(0,0,0,0.6)",
          scale: interpolate(f, [0, 120], [0.97, 1.02], clamp),
        }}
      >
        <Video src={staticFile("rec-fast.webm")} muted style={{ width: W, height: H, display: "block" }} />
      </div>
      <div style={{ position: "absolute", right: 300, top: 120, color: MUTED, fontSize: 22 }}>real recording · 24 min</div>
    </AbsoluteFill>
  );
};

const Prototype: React.FC = () => {
  const f = useCurrentFrame();
  const S = 1.0, PW = 390 * S, PH = 844 * S;
  // taps on beats: 30, 60, 90 (11 s, 12 s, 13 s in the film)
  const screen = f < 33 ? "Today" : f < 63 ? "Workout" : "Rest";
  const taps = [{ at: 30, x: 195, y: 537 }, { at: 60, x: 195, y: 774 }, { at: 90, x: 195, y: 740 }];
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(f, 120) }}>
      <div style={{ position: "absolute", left: 1060, top: 400, width: 700 }}>
        <div style={{ color: "#fff", fontSize: 64, fontWeight: 700, lineHeight: 1.05, opacity: interpolate(f, [4, 14, 114, 120], [0, 1, 1, 0], clamp) }}>A prototype<br />you can click.</div>
        <div style={{ color: MUTED, fontSize: 30, marginTop: 20, opacity: interpolate(f, [10, 20], [0, 1], clamp) }}>Every button and tab linked, on both platforms.</div>
      </div>
      <div style={{ position: "absolute", left: 420, top: (1080 - PH - 24) / 2, padding: 12, borderRadius: 60, background: "#1B1E26", boxShadow: "0 0 0 2px #2E323D, 0 40px 120px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "relative", width: PW, height: PH, borderRadius: 48, overflow: "hidden" }}>
          <Img src={staticFile(`grid/iOS-${SCREENS.indexOf(screen) + 1}-${screen}.png`)} style={{ width: PW, height: PH }} />
          <div style={{ position: "absolute", left: (PW - 110) / 2, top: 11, width: 110, height: 32, borderRadius: 16, background: "#000" }} />
          {taps.map((t) => (
            <div key={t.at} style={{
              position: "absolute", left: t.x - 26, top: t.y - 26, width: 52, height: 52, borderRadius: 26,
              background: "rgba(255,255,255,0.55)", border: `3px solid ${BLUE}`,
              opacity: interpolate(f, [t.at - 10, t.at - 4, t.at + 2, t.at + 8], [0, 1, 1, 0], clamp),
              scale: interpolate(f, [t.at - 10, t.at, t.at + 6], [1.25, 0.75, 1.1], clamp),
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Checks: React.FC = () => {
  const f = useCurrentFrame();
  const passed = Math.round(interpolate(f, [15, 45], [0, 137], { ...clamp, easing: easeOut }));
  const line = (at: number, content: React.ReactNode) => (
    <div style={{ opacity: interpolate(f, [at, at + 4], [0, 1], clamp), marginTop: 14 }}>{content}</div>
  );
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(f, 90) }}>
      <Caption text="It checks its own work." f={f} dur={90} top={130} size={64} />
      <div style={{ position: "absolute", left: 360, top: 330, width: 1200, padding: "36px 44px", borderRadius: 22, background: "#151821", border: "1px solid #262A35", fontFamily: MONO, fontSize: 34, color: "#fff" }}>
        {line(4, <><span style={{ color: MUTED }}>$ </span>python3 check_design.py design-spec.json</>)}
        {line(15, <span style={{ color: GREEN }}>{passed} passed, 0 failed</span>)}
        {line(30, <><span style={{ color: MUTED }}>$ </span>python3 audit_design.py Barwise.figcraft Screens</>)}
        {line(45, <span style={{ color: GREEN }}>16 screens, 0 issue(s)</span>)}
        {line(52, <span style={{ color: MUTED, fontSize: 26 }}>WCAG contrast on every text layer · 44 pt / 48 dp tap targets</span>)}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(f, [0, 8, 84, 90], [0, 1, 1, 0], clamp) }}>
      <div style={{ color: "#fff", fontSize: 104, fontWeight: 800, letterSpacing: -3, scale: interpolate(f, [0, 16], [0.94, 1], { ...clamp, easing: easeOut }) }}>mobile-app-designer</div>
      <div style={{ color: MUTED, fontSize: 38, marginTop: 14, opacity: interpolate(f, [6, 16], [0, 1], clamp) }}>A skill for Claude Code. Free and open source.</div>
      <div style={{ marginTop: 54, padding: "20px 32px", borderRadius: 16, background: "#151821", border: `1px solid ${BLUE}`, fontFamily: MONO, fontSize: 30, color: "#fff", opacity: interpolate(f, [12, 22], [0, 1], clamp), translate: interpolate(f, [12, 26], ["0px 20px", "0px 0px"], { ...clamp, easing: easeOut }) }}>
        npx skills add chrollo-03/mobile-app-designer
      </div>
    </AbsoluteFill>
  );
};

const Scenes: React.FC = () => (
  <>
    <Sequence durationInFrames={90}><Hook /></Sequence>
    <Sequence from={90} durationInFrames={90}><Reveal /></Sequence>
    <Sequence from={180} durationInFrames={120}><Live /></Sequence>
    <Sequence from={300} durationInFrames={120}><Prototype /></Sequence>
    <Sequence from={420} durationInFrames={90}><Checks /></Sequence>
    <Sequence from={510} durationInFrames={90}><Outro /></Sequence>
  </>
);

export const Brag: React.FC = () => (
  <AbsoluteFill style={{ background: INK, fontFamily: "Inter, sans-serif" }}>
    {/* Frame 0 shows the poster (the settled reveal grid) so thumbnails use it. */}
    <Freeze frame={POSTER} active={(f) => f === 0}>
      <Scenes />
    </Freeze>
    <Audio src={staticFile("brag-music.wav")} />
  </AbsoluteFill>
);

export { easeIn };
