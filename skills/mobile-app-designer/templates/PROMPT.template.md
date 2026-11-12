# Build prompt: <App name> (<Platform>)

> Open Claude Code in this folder and paste the short prompt below. The rest is the full spec.

```
Read PROMPT.md, SETUP.md and design/DESIGN-TOKENS.md, then look at every PNG in
design/screens/. Build the <App name> app described in PROMPT.md as a new <stack> project in
./app-src. First check the tools in SETUP.md are installed (install what's missing, asking me
first), then work through the milestones in order. After each milestone run its checks and show
me the results. Ask me before deciding anything PROMPT.md marks as OPEN.
```

---

## 1. What the app is

<Two or three sentences: what it does, for whom, the one thing it must do well.>

## 2. Fixed decisions (don't change without asking)

| Decision | Value |
|---|---|
| Platform | <Android only / iOS only / both> |
| Stack | <Kotlin + Jetpack Compose (Material 3) / SwiftUI / Flutter / React Native> |
| Data | <offline local DB / API at … / both> |
| Accounts | <none / email + password / …> |
| Min OS | <Android API 26 / iOS 16> |
| Languages | <English + Arabic (RTL)> |
| Testing | <developer's phone over USB / simulator> |

## 3. Screens

Reference images: `design/screens/` (<W>×<H> frames at 2×). Source: `design/<App>.figcraft`
(zip with `document.json`, read exact values with a script).

| # | File | Screen | Notes |
|---|---|---|---|
| 1 | `<Platform>-1-<Name>.png` | <Name> | <what's on it, what it does> |

Out of scope: <screens designed but not to be built>. Prototype-only widgets to replace with system
controls: <e.g. custom number pad → system keyboard>.

## 4. Behaviour

### <Main flow>
- <rules: inputs, validation, what each outcome shows>

### Settings (persist with <DataStore / UserDefaults>)
- <each setting and its effect>

### <Import / sync / other hard part>
1. <steps, limits, error cases>

## 5. Data

| Column | Meaning | Notes |
|---|---|---|
| <col> | <meaning> | <format, unknown markers, script> |

Personal data columns: <list>, see OPEN.

## 6. Rules module

`reference/<module>` is the reference implementation and `reference/<tests>` the spec. Port it to
<language> and port every test case.

## 7. OPEN decisions: ask the owner

1. <conflict or undecided point, options, recommendation>

## 8. Milestones and checks

| # | Milestone | Done when |
|---|---|---|
| 1 | Project skeleton + theme from tokens + navigation | build passes; app opens on device |
| 2 | Rules module port + tests | unit tests pass with every reference case |
| 3 | <data layer> | <sample data gives N rows> |
| 4 | <main flow screens> | <sample searches hit the right screens> |
| 5 | Settings | <language/RTL flips layout; dark theme matches the dark design> |
| 6 | Polish to the design | side-by-side device screenshots match `design/screens/*.png` |

## 9. Don'ts
- <e.g. no network permission or analytics in an offline app>
- Don't bundle real data; don't invent data, missing values show "-".
