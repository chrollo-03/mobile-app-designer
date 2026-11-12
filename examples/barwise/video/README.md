# Barwise prototype walkthrough (video)

A 33 second walkthrough of the Barwise prototype on an iPhone frame: Today → Start workout →
Log set → Rest → Skip rest → Finish → Summary → Save → Progress → History → Settings, with a
tap dot on every button the prototype links.

The frames are the real FigCraft screens exported at 3x and animated with
[Remotion](https://www.remotion.dev). The phone is a drawn frame, not a recording from a device.

- `barwise-walkthrough.mp4`: 1920 x 1080, 30 fps, H.264
- `barwise-walkthrough.gif`: 720 px preview for the README
- `src/`: the Remotion composition (`Walkthrough.tsx`, `Composition.tsx`)

## Render it yourself

```bash
npx create-video@latest --yes --blank --no-tailwind barwise-video
cp src/*.tsx barwise-video/src/
# put the 3x screen PNGs in barwise-video/public/screens/ and the icon in public/icon.png
cd barwise-video && npx remotion render BarwiseWalkthrough out/barwise-walkthrough.mp4
```
