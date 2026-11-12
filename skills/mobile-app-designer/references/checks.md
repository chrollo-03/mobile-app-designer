# Design checks

`scripts/check_design.py` reads the saved `.figcraft` (a zip with `document.json`) and a JSON spec.
Start from `templates/design-spec.example.json`. Spec keys:

| Key | Meaning |
|---|---|
| `file` | path to the `.figcraft`, relative to the spec (or absolute) |
| `page` | page holding the screens |
| `platforms` | `{"iOS": {"size": [390, 844]}, ...}`, screen names must start with these |
| `screens` | number → name shared by all platforms (`"2b": "Searching · end"`) |
| `platform_screens` | extra screens for one platform (dark variants that differ) |
| `not_linked` | screen numbers allowed to have no incoming link (start screen, side-by-side variants) |
| `overlay_prefix` | top-level frames that are bottom sheets, named `Overlay / Name · Platform` |
| `flows` | `{platform, from, layer, to}`, tapping that layer on that screen must lead to screen `to`; for timed steps the layer is the frame's own name |
| `defaults` | variable → value the file must be saved with |
| `exports` | `{dir, pattern}`, each screen's PNG must exist (`{platform}-{num}-{name}.png`, name words joined by `-`) |
| `required_files` | any other files that must exist (logo set…) |
| `no_alpha` | PNGs that must have no alpha channel (store icons) |

Output lists failures and a total; exit code 1 on any failure, so it can gate a commit or CI.

## Using it well

- Run after every batch of design changes, and before every export or handoff.
- When the user adds a screen, add it to the spec first; "no unlisted screens" fails otherwise,
  which keeps the spec honest.
- A failing reachability check usually means a real UX gap (a screen nothing leads to). Fix the
  design, not the spec, unless the screen genuinely is a side-by-side variant.
- Prove checks can fail: run against a deliberately broken copy (a missing screen, a wrong flow,
  a changed default) and confirm each is reported. A check that can't fail proves nothing.
- Keep project-specific assertions (e.g. "each Settings control is bound to its variable") in a
  small extra test next to the spec when the generic checker doesn't cover them.

## Design-rule audit

```bash
python3 scripts/audit_design.py design/App.figcraft "Screens" [--prefix "Android /"] [--json]
```

- **Contrast**: every visible text layer against its nearest ancestor background, with
  semi-transparent fills blended and gradients judged by the worst stop (conservative: text over
  the darker part of a gradient may be fine in practice, look at the screenshot). WCAG exempts
  inactive/disabled text and logos; status-bar clocks are system UI.
- **Tap targets**: layers with a click interaction smaller than 44×44 (iOS) / 48×48 (Android),
  including layers inside main components of instances on screens. A small visible icon is fine if
  its tappable frame is big: fix by enlarging the frame (padding), not the icon.
- Text over a *sibling* shape (not an ancestor) isn't seen, check those by eye.
- In the source project the first run found white-on-violet text at 4.35:1, red destructive
  labels at 3.9:1 and 22 px clear buttons: real defects nobody had noticed by eye.

## Token extraction

```bash
python3 scripts/extract_tokens.py design/App.figcraft "Screens" "Android /"
```

Prints every text style (with a sample string), colours by frequency, gradients and radii used by
matching frames. Write `DESIGN-TOKENS.md` from this output; mark anything not drawn in the design
(e.g. dark values for screens that have no dark version) as a suggestion.
