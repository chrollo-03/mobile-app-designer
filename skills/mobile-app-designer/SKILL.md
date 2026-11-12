---
name: mobile-app-designer
description: Design a mobile app end to end and hand it off ready to build, following professional design rules (8-pt grid, type scale, WCAG contrast, 44/48 tap targets, platform conventions), brief and data check, design system, iOS and Android screens, a clickable prototype that takes input (variables, sheets, toggles, typing), Arabic/RTL, app icon and logo, automated checks (screens, links, contrast, tap targets), and a handoff zip (build prompt, setup guide, tokens, PNGs). Uses FigCraft via MCP (detects the OS and installs and connects it if no design tool is set up), Figma, or HTML mockups. Use whenever someone wants to design, mock up, prototype or redesign a phone app or screens, make an app icon or logo, make a prototype clickable, add Arabic or RTL to a design, check a design file for missing screens, broken links or accessibility, or package a design for a developer or another Claude to build, even if they don't name a tool.
---

# Mobile app design → handoff

This skill takes an app idea from a sentence to a design another developer (or another Claude)
can build without guessing. It covers both platforms, Arabic/RTL, an interactive prototype and a
handoff zip, and calls out the traps that cost time in real projects.

The workflow has eight phases. Do them in order, but scale each to the request: "make me an app
icon" only needs phase 6; "check my design" only phase 7. When a phase needs a decision only the
user can make, ask with a short multiple-choice question (with a recommended option first) instead
of guessing, wrong guesses on platform, language or data handling mean redoing screens.

| Phase | Output | Reference to read |
|---|---|---|
| 1. Brief and data | `BRIEF.md` with decisions and data facts | `references/app-types.md`, `references/inspiration.md` |
| 2. Tool setup | a design file you can drive | `references/install-figcraft.md`, `references/figcraft.md` or `references/other-tools.md` |
| 3. Design system | colour system, tokens, components | `references/color.md`, `references/design-principles.md`, `references/design-system.md` |
| 4. Screens | every state, both platforms | `references/design-principles.md`, `references/design-system.md` |
| 5. Prototype | links + working inputs | `references/prototype.md` |
| 6. Logo and icon | icon set, wordmarks | `references/logo.md` |
| 7. Checks | passing `check_design.py` and `audit_design.py` | `references/checks.md` |
| 8. Handoff | zip with prompt, setup, tokens, PNGs | `references/handoff.md` |
| any | Arabic / RTL | `references/rtl-arabic.md` |

**Design rules.** Read `references/design-principles.md` before phase 3. It holds the rules
professional designers apply on every screen, 8-pt grid, a real type scale, WCAG contrast,
44 pt / 48 dp tap targets, one primary action, Fitts's and Hick's laws, every state designed,
purposeful motion, platform conventions, each with the reason behind it, plus the efficient work
order (content first, tokens before screens, hardest screen first, one platform then convert).
Apply them while designing, not as an afterthought: fixing contrast or tap targets after twenty
screens copy the mistake costs far more than getting the component right once.

**A worked example** lives in the repository's `examples/barwise/`
(https://github.com/chrollo-03/mobile-app-designer/tree/main/examples/barwise): a lifting tracker
designed in FigCraft (16 screens on iOS and Android, clickable prototype, app icon), its checker
spec and a short case study. When unsure what "good" looks like for a phase, look there, and run
the scripts on it.

## Phase 1: Brief and data

Start from `templates/BRIEF.template.md` and fill it in as answers arrive. Identify the **app type**
and read its section in `references/app-types.md`, it lists the screens and states that type
needs, the patterns users expect, the colour preset and the traps. If the user names inspiration
(sites, apps), read `references/inspiration.md`, look at the source, and agree on the transferable
principles before designing; never copy a brand's look.

Get these answered before drawing anything:

- **Platforms**: iOS, Android, or both. Both doubles the screens; ask, don't assume.
- **Languages**: any right-to-left language (Arabic, Hebrew, Persian, Urdu)? It changes fonts,
  layout mirroring and number formatting from the start, read `references/rtl-arabic.md`.
- **Data**: if the app shows records (products, workouts, contacts…), look at real or sample
  data now. Profile every column: formats, empty markers, value sets, scripts. The data decides
  the UI, e.g. a category picker should list exactly the values that occur in the data, most
  common first, and "unknown" markers like `0` or `-------` should become "-".
- **Online or offline, accounts or not**: these decide whether screens like sign-in exist at all
  and what the copy may promise ("nothing leaves your phone" is only true offline).
- **Sensitive data**: if the data includes personal details (names, phones, addresses, IDs),
  point it out and ask how it should be handled before designing screens that show it. Note the
  decision in the handoff so the builder doesn't have to rediscover it.

Write the decisions down where the next session will find them (project memory or a
`DECISIONS.md`). Users change their minds mid-project, in the source project the stack went
Flutter + API → Kotlin offline in one afternoon, so record *what* was decided and *why*, and
update it when it changes.

## Phase 2: Tool setup

Prefer **FigCraft** when its MCP tools are available (`mcp__figcraft-app__*` or similar): it gives
real frames, auto layout, components, variables and a clickable prototype, and the file is a zip
of JSON you can check with scripts. Read `references/figcraft.md` before the first command, it
has the command patterns and the gotchas.

**No design tool connected?** Run `python3 scripts/figcraft_setup.py detect`. It reports the OS,
CPU and Linux distro (with the FUSE check AppImages need on Fedora and others), any FigCraft or
Figma registration and its mode, whether the app is running, the release file for this machine and
ready-made `claude mcp add` commands. Then follow `references/install-figcraft.md`: ask the user
once, download and checksum-verify, install without admin rights, and register FigCraft
**headless** (`cli mcp`, confined to the project folder), no app has to stay running, which avoids
the most common failure (an "attached" server whose app isn't open). Use attached mode only if the
user wants to watch live, and the **web build** (via Claude in Chrome or the built-in browser) if
nothing may be installed. MCP servers connect at startup, so the user restarts Claude Code before the
tools appear, say so plainly and stop there rather than pretending the tools are available. If the
user declines all of it, use `references/other-tools.md` (Figma via its MCP, or HTML/CSS mockups
rendered to PNG). The later phases still apply; only the mechanics change.

Before editing an existing file, inspect it (page list, frame names, an overview screenshot)
and match what's there. Names matter: phase 7's checker finds screens by name.

## Phase 3: Design system

Define tokens before screens: colours (light and dark), type scale, radii, spacing, and the few
components every screen reuses (buttons, fields, list rows, cards, segmented control, toggle,
bottom sheet). `references/design-system.md` has platform sizes and defaults for iOS and
Material 3.

**Colour** comes from a system, not hand-picked hexes (`references/color.md`). Start from the app
type's preset or the brand colour and generate every role for light and dark, contrast-checked:

```bash
python3 scripts/palette.py preset finance              # or: make "#1F4FD1" --accent "#12B886"
python3 scripts/palette.py preset finance --format compose   # css | compose | swiftui | flutter | json
```

Offer the user `assets/color-panel.html` (opens in any browser): curated palettes by app type with
mood filters, a custom brand picker, light and dark phone previews, contrast badges and copy buttons.
Choosing colours by seeing them on a phone mock-up is faster and better than debating hexes. Build reusable pieces as components so a change propagates (the logo mark in the
source project lived in 5 headers; as a component, one edit updated all of them).

## Phase 4: Screens

Name every top-level frame `Platform / N Name` (e.g. `iOS / 3 Result`, `Android / 12b Importing`)
and use fixed device sizes (iOS 390×844, Android 412×917). For each flow, draw every state, not
just the happy path: loading, one result, several results, no result, error, empty list, dark
variant of at least the home screen.

Work in small verified steps. After each screen, screenshot it at 1–2× and look: text clipped,
items overlapping the home indicator, a card running off the frame. Fix before moving on, it's
cheap now and expensive once twenty screens copy the mistake. Screenshot screens one at a time;
rendering several far-apart frames together shrinks them to nothing.

When adding something to a full screen, measure the free space first (read the spacer heights)
and make the new element fit, rather than letting the frame overflow.

For the second platform, duplicate the finished screens and convert them (platform fonts, radii,
app bars, status bar) instead of building twice.

## Phase 5: Prototype

Link every screen so it can be clicked through, then make inputs real where the tool allows:
segmented controls and toggles that switch, pickers in bottom sheets, typed text that carries to
the next screen. `references/prototype.md` has the patterns (variables bound to text, variants and
visibility; append-only typing; mode switches) and their limits.

Be upfront about limits. Prototype expressions often can't delete one character or round numbers;
say what works ("Clear empties the field; there's no single-character delete") rather than letting
the user discover it. And after simulating taps by setting variables, **reset them to their
defaults before saving**, the checker enforces this because a file saved mid-simulation shows
wrong values to everyone who opens it.

## Phase 6: Logo and icon

Derive the logo from the product's own visual language (a small mark already used in the header
often grows into the icon). Build it as vectors in the design file, check it at real sizes,
and export the full set. `references/logo.md` has the checklist: 29/60 px legibility, Android's 66 %
safe circle, no alpha channel in store icons, and an image-generator prompt template for when the
user wants AI exploration instead.

## Phase 7: Checks

Write a spec for `scripts/check_design.py` (start from `templates/design-spec.example.json`) and
run it after every batch of changes:

```bash
python3 scripts/check_design.py design-spec.json
```

It checks: every screen exists on every platform with the right name and size, nothing unlisted,
every link lands on a real screen or overlay of the same platform, the key flows go where they
should, every screen is reachable, variables are saved at their defaults, exports and required
files exist, store icons have no alpha. A failing reachability check is a finding, not a test to
loosen, in the source project it exposed a "No match" screen nothing linked to. Prove a new check
can fail (break a copy of the spec or file) before trusting it. Details: `references/checks.md`.

Then audit the design rules that are easiest to measure:

```bash
python3 scripts/audit_design.py design/App.figcraft "Screens"
```

It reports text below WCAG AA contrast (4.5:1, or 3:1 for large text; gradients judged by their
worst stop) and tappable layers smaller than 44 pt (iOS) / 48 dp (Android), including taps inside
components. Fix real findings in the component or token so the fix spreads; deliberately inactive
text and status-bar clocks are exempt, note them rather than "fixing" them. Run through the
review checklist at the end of `references/design-principles.md` for the rules a script can't see.

## Phase 8: Handoff

Package what a builder needs into one zip: the design file, PNG of every in-scope screen and sheet,
`DESIGN-TOKENS.md` generated from real values (`scripts/extract_tokens.py`), the logo set, reference
code and sample data, `SETUP.md` (what to install), and `PROMPT.md`, a short paste-in prompt plus
the full spec: fixed decisions, screens table, behaviour, data, open decisions, milestones with
"done when" checks. Leave out real or personal data, secrets, and out-of-scope screens. Unzip a
fresh copy and run its tests before handing it over. Templates and checklist:
`references/handoff.md` and `templates/`.

## Habits that kept the source project on track

- **Verify, then claim.** Screenshot after every visual change; run the checker after every batch;
  run tests from a fresh unzip. Report failures as failures.
- **Look before you set values.** Read exact radii, colours and ids from the file
  (`extract_tokens.py`, node inspection) instead of writing them from memory, several "remembered"
  values in the source project's token sheet were wrong until checked.
- **Batch, but keep batches checkable.** One failing step rolls back a whole batch; when it does,
  look up the real ids rather than guessing again.
- **Watch for invisible characters.** When code contains Arabic or `\uXXXX` escapes, run
  `scripts/escape_invisible.py --check` on it, escapes can get written as raw bidi controls.
- **Tell the user about trade-offs in plain words**, and confirm before anything outward-facing
  (uploading data to a cloud service, publishing, deleting).
