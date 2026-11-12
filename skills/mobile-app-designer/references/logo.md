# Logo and app icon

## Approach

1. Find the motif in the product: an object the app is about (a barbell, a ticket, a leaf),
   simplified to 2–4 shapes. If the UI already has a small mark, grow it into the logo so icon and
   app feel like one thing.
2. Colours from the tokens: background = brand gradient, motif = accent, details = ink. Optional
   soft glows like the app's hero (keep them subtle, a lime glow over blue turns grey-muddy;
   drop its opacity to ~0.3).
3. Build as vectors in the design file (1024×1024 frame, clip on). No text in the icon.
4. Make the small header mark a **component** and use instances everywhere it appears.

## Checks before exporting

| Check | How |
|---|---|
| Legible small | export at 60 px and 29 px; the main shape and its key detail must read |
| Android safe zone | motif inside the central 66 % circle (≈ 675 px at 1024), round masks crop corners; scale the motif down a few % if a corner pokes out |
| No alpha in store icons | App Store rejects 1024 icons with an alpha channel even if opaque: flatten (`magick in.png -background "#3355FF" -alpha remove -alpha off PNG24:out.png`) and confirm colour type 2 |
| Dark variant | ink/dark gradient background, same motif; tone glows way down |

## Export set

`app-icon-1024.png` (iOS, opaque) · `app-icon-dark-1024.png` · `play-store-512.png` (opaque) ·
`android-adaptive-foreground.png` (transparent, motif only) · `android-adaptive-background.png` ·
`wordmark-light.png/.svg` · `wordmark-dark.png/.svg` · `mark.svg` · `app-icon.svg`.

## Image-generator prompt (when the user wants AI exploration)

```
App icon for "<Name>", <one line on what the app does and for whom>. A single bold, geometric
symbol: <motif, described as simple shapes, no text>. Motif in <accent hex> with <ink hex> details,
centred on a smooth diagonal gradient from <start hex> (top-left) to <end hex> (bottom-right),
with a soft <accent> glow behind it. Flat vector style, crisp edges, generous padding, reads
clearly at 29 px, iOS squircle and Android adaptive-icon safe zone, no letters, no numbers,
no words, no realistic photo, no 3D bevels, no mockup. 1024x1024, centred.
Negative: text, letters, watermark, photo, 3D render, bevel, busy background, device mockup
```

Image models garble letters, keep text out of the icon and set the wordmark in a real font.
Avoid copying official designs (government plates, real brands) closely.
