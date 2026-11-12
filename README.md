# mobile-app-designer

A [Claude Code](https://claude.com/claude-code) skill that designs a mobile app end to end and
hands it off ready to build, by [Chrollo](https://github.com/chrollo-03).

![Example: Barwise, a lifting tracker, 16 screens on iOS and Android](examples/barwise/screens/_overview.png)

It walks Claude through eight phases: **brief and real-data check → design system and colour →
iOS and Android screens → a clickable prototype with working inputs → app icon and logo →
automated design checks → a build-ready handoff zip**, with Arabic / right-to-left support
throughout and professional design rules applied at every step.

The example above, [`examples/barwise`](examples/barwise), was designed with this skill in
FigCraft: a lifting tracker with 16 screens, a clickable prototype and an app icon. It passes
every check the skill ships with.

## What you get

- **A workflow** (`SKILL.md`) that asks the decisions only you can make (platforms, languages,
  online/offline, personal data), designs by **app type**, and verifies every visual step.
- **Design rules with reasons** (`references/design-principles.md`): 8-pt grid, type scale, WCAG
  contrast, 44/48 tap targets, one primary action, Fitts's/Hick's laws, states, motion, platform fit,
  an efficient work order and a review checklist.
- **12 app-type guides** (`references/app-types.md`): finance, health & fitness, wellness, food &
  delivery, e-commerce, social, productivity, travel & mobility, education, media, booking,
  utility/lookup, screens, expected patterns, colour preset and traps for each.
- **A colour system**: `scripts/palette.py` turns one brand colour into full light + dark roles,
  checks WCAG AA, and exports CSS, Jetpack Compose, SwiftUI, Flutter or design-token JSON;
  13 curated palettes by app type in `assets/palettes.json`; and **`assets/color-panel.html`**, a
  visual panel with phone previews, contrast badges and copy buttons.
- **Inspiration, done right** (`references/inspiration.md`): transferable principles from Webflow
  and designeer.xyz, plus where to find mobile patterns, fonts, icons and colour tools.
- **Design-tool setup**: detailed [FigCraft](https://github.com/storytold/figcraft) recipes; if no
  design tool is set up, the skill detects your OS (Fedora/FUSE included), downloads and verifies
  FigCraft, and connects it **headless** (no app to keep open), or uses the web build in your
  browser, Figma, or HTML mockups.
- **Scripts** (Python 3, no dependencies):

| Script | Does |
|---|---|
| `check_design.py` | screens on every platform at the right size, links, key flows, reachability, variables at defaults, exports |
| `audit_design.py` | WCAG contrast of every text layer and tap-target sizes, including inside components |
| `palette.py` | colour system from a seed, contrast report, exports, preset check, builds the colour panel |
| `extract_tokens.py` | the text styles, colours, gradients and radii a design really uses |
| `figcraft_setup.py` | detects OS and design-tool setup, downloads FigCraft with SHA-256 verification |
| `escape_invisible.py` | finds/escapes invisible and bidi control characters in code |

- **Templates**: project brief, build prompt, setup guide, design tokens, handoff README, checker spec.

## Install

```bash
git clone https://github.com/chrollo-03/mobile-app-designer ~/.claude/skills/mobile-app-designer
```

(or into `.claude/skills/` inside one project). Restart Claude Code; the skill triggers when you
ask to design, prototype, check or package a mobile app, or when you call it by name.

## Try it

> Design a food delivery app for Android and iOS with dark mode and an Arabic option, make the
> prototype clickable, and give me a zip my developer can build from.

> Open the colour panel and help me pick colours for my meditation app.

> Check my design file design/App.figcraft: every screen on both platforms, contrast and tap targets.

Or run the scripts on the bundled example:

```bash
cd ~/.claude/skills/mobile-app-designer
python3 scripts/check_design.py examples/barwise/design-spec.json
python3 scripts/audit_design.py examples/barwise/Barwise.figcraft Screens
python3 scripts/palette.py list && python3 scripts/palette.py preset food-delivery
xdg-open assets/color-panel.html     # macOS: open, Windows: start
```

## Layout

```
SKILL.md            the workflow
references/         loaded per phase: app types, inspiration, design principles, colour,
                    install FigCraft, FigCraft recipes, other tools, design system, prototype,
                    RTL/Arabic, logo, checks, handoff
scripts/            the six scripts above
assets/             palettes.json, color-panel.html (+ its template)
templates/          brief, build prompt, setup, tokens, handoff README, checker spec
examples/barwise/   a complete design: FigCraft file, screens, icon and checker spec
evals/              test cases for `claude plugin eval`
```

## Test cases

`evals/` holds four realistic prompts in the format `claude plugin eval` reads. Running them makes
real (billed) model runs with and without the skill:

```bash
claude plugin eval . --allow-tools Write,Edit,Bash --scaffold
```

## License

MIT, see `LICENSE`.
