// Generates the reel voiceover, one WAV per line, with Kokoro (open weights, runs locally).
// usage: node tts.mjs  -> public/vo/NN.wav and src/voLines.json (durations in seconds)
import { KokoroTTS } from "kokoro-js";
import { mkdirSync, writeFileSync } from "node:fs";

const VOICE = "af_heart";
const LINES = [
  "Claude Code can design your whole app now.",
  "Not a mockup. The real thing.",
  "I typed one line: design a lifting tracker for iOS and Android.",
  "It opened a real design tool, and built every screen. Live.",
  "Sixteen screens. Both platforms. Dark mode.",
  "And a prototype you can actually tap through.",
  "Then it checked its own work. A hundred and thirty-seven checks. Zero contrast issues.",
  "It's a free skill. One command to install.",
];

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
mkdirSync("public/vo", { recursive: true });
const out = [];
for (const [i, text] of LINES.entries()) {
  const audio = await tts.generate(text, { voice: VOICE, speed: 1.08 });
  const file = `vo/${String(i).padStart(2, "0")}.wav`;
  await audio.save(`public/${file}`);
  const seconds = audio.audio.length / audio.sampling_rate;
  out.push({ text, file, seconds: Math.round(seconds * 1000) / 1000 });
  console.log(i, seconds.toFixed(2), text);
}
writeFileSync("src/voLines.json", JSON.stringify(out, null, 2));
