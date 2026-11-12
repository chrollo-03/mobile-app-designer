# Design system and platform conventions

## Frames

| | iOS | Android |
|---|---|---|
| Frame | 390×844 (iPhone 14/15) | 412×917 (Pixel-class) |
| Status bar | 54 tall, time left, battery right | 40 tall |
| Top bar | large title or centred title, text buttons ("Cancel", "Save") | Material top app bar 64: icon button (← or ×), left title, actions |
| Home indicator | 134×5 at y 831, keep content 12+ above | 108×4 near the bottom |
| Frame corner (mockup) | 44 | 28 |
| Primary button | 56 tall, radius 18 | 56 tall, fully rounded (28) |
| Cards | radius 20 | radius 16 |
| Fields | radius 16, 1.5 border | radius 12, 1.5 border |
| Side padding | 20 | 16 |
| UI font | Inter / SF-like sans | Roboto |
| Settings | grouped white lists, chevrons, section captions | same layout works; switch to Material toggles if strict |

Pick one display face for big numbers and titles (the source project used Inter Display) and one
mono face for codes/IDs (Noto Sans Mono). Add a script font for each RTL language
(Noto Sans Arabic). Check every font is free to bundle (SIL OFL / Apache).

## Tokens to define first

- **Colour**: brand gradient (start/end), primary (links, focus), accent (main action), ink, paper
  (background), surface, stroke, divider, muted text, danger, success; tile/pastel pairs
  (background + darker label colour) if the app shows data tiles. Define a dark column for each.
- **Type**: display (40–64), title (32–40), screen title (34), body (15–17), secondary (13),
  caption caps (12, +0.6 letter spacing), mono (18–20).
- **Shape**: card, field, button, sheet (top 24), segmented (pill), avatar (circle).
- **Spacing**: 6 label→field, 10 grid gaps, 14–20 between sections.

Contrast: lime/yellow accents need ink text, not white; check light text on gradients
(use a soft tint like `#E3E7FF` for secondary text on blue/violet).

## Components worth building once

Button (primary, secondary/outline, destructive), text field (label, value, focused, error),
list row (avatar/icon, title, subtitle, chevron), data tile (label + value), segmented control,
toggle, bottom sheet (handle, title, content), status pill, logo mark. Variants for states
(selected/unselected, on/off) make the prototype phase much easier.

## States checklist per flow

loading · success (one) · several · none · error · empty list · offline (if relevant) ·
long text (names, Arabic) · dark mode (at least home and one detail screen).

## Copy

Write real copy, not lorem ipsum: it reveals layout problems (long names, two-line titles) and
the builder reuses it. Keep promises consistent with the architecture (offline claims, privacy
notes) and update them if decisions change.
