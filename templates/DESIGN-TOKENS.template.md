# Design tokens (<Platform>)

Values from `<App>.figcraft` (via `scripts/extract_tokens.py`). Sizes in dp/pt, text in sp/pt.
Reference frames are <W>×<H>. Values not drawn in any screen are marked "suggested".

## Colours

| Token | Light | Dark | Used for |
|---|---|---|---|
| `brandStart` → `brandEnd` | `#…` → `#…` | `#…` → `#…` | hero gradient |
| `primary` | `#…` | `#…` | links, focus, selected |
| `accent` | `#…` | | main action, logo |
| `ink` | `#…` | `#…` | text, primary buttons |
| `paper` | `#…` | `#…` | background |
| `surface` | `#…` | `#…` | cards, fields |
| `surfaceStroke` / `divider` | `#…` | `#…` | borders, dividers |
| `muted` | `#…` | `#…` | secondary text |
| `danger` / `success` | `#…` | | destructive, done |

## Type

| Role | Font | Size / weight | Letter spacing |
|---|---|---|---|
| Display number | | | |
| Screen title | | | |
| Body | | | |
| Secondary | | | |
| Caption (caps) | | | |
| Mono (codes) | | | |
| Arabic | | match Latin size | |

## Shape and spacing

| Thing | Value |
|---|---|
| Side padding | |
| Cards / tiles | radius |
| Fields | radius, border |
| Buttons | height, radius |
| Segmented control | height, radius, padding, selected style |
| Bottom sheets | top radius, handle, scrim |

## Logo

`logo/`, app icon (light/dark), adaptive layers, store icon, wordmarks, `mark.svg` (header mark).
