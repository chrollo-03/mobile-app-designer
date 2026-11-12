# Colour

Good app colour is a **system**, not a set of favourite hexes: a few hues, each turned into a
ramp of tones, then assigned to **roles** (primary, surface, on-surface, outline…) with fixed tone
steps so contrast holds in light and dark. `scripts/palette.py` does this; `assets/color-panel.html`
lets the user explore it visually.

## Tools

| Task | Command |
|---|---|
| See the curated palettes | `python3 scripts/palette.py list` |
| Full system from a brand colour | `python3 scripts/palette.py make "#1F4FD1" --accent "#12B886"` |
| A curated preset | `python3 scripts/palette.py preset finance` |
| Export for code | `--format css | compose | swiftui | flutter | json` (JSON = W3C design-tokens style) |
| Check every preset passes AA | `python3 scripts/palette.py check` |
| Visual panel | open `assets/color-panel.html` in a browser (rebuild after editing presets: `palette.py panel`) |

The panel shows a light and dark phone preview, contrast badges for 11 key pairs, tonal ramps and
copy buttons. Offer it to the user when they're choosing colours, seeing beats reading hexes.

## Choosing the seed

1. **Start from the app type** (`assets/palettes.json`, also in `app-types.md`): each preset says
   which mood it carries and why (finance = trust blue, food = appetite red-orange, wellness = low-
   chroma sage, media = dark-first).
2. **Adjust to the brand**: keep the preset's role structure, change the seed hue. If the brand has
   a logo colour, use it as the seed and let the generator pick tones; don't force the exact logo
   hex onto text.
3. **One accent at most**, for one job (rewards, promos, "new", the main action on a gradient).
   Bright accents (lime, yellow) work as **container fills with dark text**, never as text on white.

## Roles (what each colour is for)

| Role | Light tone | Dark tone | Use |
|---|---|---|---|
| primary / onPrimary | 40 / 100 | 80 / 20 | main buttons, active states, links |
| primaryContainer / on… | 90 / 10 | 30 / 90 | tonal buttons, selected chips, highlights |
| secondary(Container) | 40/90 | 80/30 | quieter selection, segmented controls |
| tertiary(Container) | 40/90 | 80/30 | the accent: badges, rewards, contrast moments |
| error(Container) | 40/90 | 80/30 | errors only, never decoration |
| surface / onSurface | 98 / 10 | 6 / 90 | background and main text |
| surfaceContainer Low→Highest | 96–90 | 10–22 | cards, sheets, nav bars (elevation by tone, not shadow, in dark) |
| onSurfaceVariant | 30 | 80 | secondary text, icons |
| outline / outlineVariant | 50 / 80 | 60 / 30 | field borders / dividers |

Tones are CIE L* lightness, so the steps give predictable contrast for any hue: tone 40 on 98 ≈ 6:1,
10 on 98 ≈ 16:1. That's why the generator can promise AA for any seed.

## Rules

- **Contrast**: text ≥ 4.5:1, large text and UI parts ≥ 3:1 (`palette.py` checks roles; `audit_design.py`
  checks the actual design).
- **60-30-10**: ~60 % surfaces, ~30 % secondary/containers, ~10 % primary + accent.
- **Semantic colours are reserved**: red = error/loss/destructive, green = success/gain, amber =
  warning/pending. Don't use them as brand decoration in apps that show money or health data.
- **Dark mode is its own palette**: tone 6 background (not pure black for big areas), elevation by
  lighter surface tones, primary at tone 80. Check images and illustrations too.
- **Gradients**: two neighbouring hues (blue → violet), used on a hero or icon, with text checked
  against the lighter end. Never put body text on a gradient.
- **Colour-blind safety**: never colour alone, add icon, label or weight.
- **Data colours** (charts): use a categorical set with distinct lightness, not just hue; at most
  6–8 series, the rest "Other".

## Good colour sources

OKLCH picker (oklch.com) · Huetone (huetone.ardov.me, accessible ramps) · Atmos (atmos.style) ·
Ramps (ramps.studio) · Color.review (contrast) · APCA (apcaw3.myndex.com, perceptual contrast) ·
Material Theme Builder (material-foundation) for cross-checking roles.
