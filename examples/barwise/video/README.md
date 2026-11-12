# Barwise videos

A 33 second walkthrough of the Barwise prototype on an iPhone frame: Today → Start workout →
Log set → Rest → Skip rest → Finish → Summary → Save → Progress → History → Settings, with a
tap dot on every button the prototype links.

The frames are the real FigCraft screens exported at 3x and animated with
[Remotion](https://www.remotion.dev). The phone is a drawn frame, not a recording from a device.

- `barwise-timelapse.mp4` / `.gif`: the real 24:07 screen recording of the session, idle moments cut, 18x faster, with chapters and the real clock (`src/Timelapse.tsx`, `src/keptTimes.json`)
- `barwise-film.mp4`: the two videos below joined, 1:02
- `barwise-making-of.mp4` / `.gif`: 29 s timelapse of Claude Code rebuilding the Rest screen in FigCraft over MCP, from 12 real captures of the FigCraft window (`build-frames/`)
- `barwise-walkthrough.mp4`: 1920 x 1080, 30 fps, H.264
- `barwise-walkthrough.gif`: 720 px preview for the README
- `src/`: the Remotion compositions (`Walkthrough.tsx`, `MakingOf.tsx`, `Timelapse.tsx`, `Brag.tsx`, `Reel.tsx`, `Composition.tsx`), the reel's voice script (`reel-tts.mjs`, Kokoro) and the synthesized music (`brag-music.py`, `reel-bed.py`)

## Render it yourself

```bash
npx create-video@latest --yes --blank --no-tailwind barwise-video
cp src/*.tsx barwise-video/src/
# put the 3x screen PNGs in barwise-video/public/screens/ and the icon in public/icon.png
cd barwise-video && npx remotion render BarwiseWalkthrough out/barwise-walkthrough.mp4
```
