# Design rules and the reasoning behind them

These are the rules experienced product designers apply on every screen, drawn from Apple's Human
Interface Guidelines, Material Design 3, WCAG 2.2 and Nielsen's usability heuristics. Each rule
says *why*, apply the reasoning when a case isn't covered. `scripts/audit_design.py` measures the
two most often broken (contrast, tap targets).

## Contents
1. Work order (efficiency)
2. Layout and spacing
3. Typography
4. Colour and contrast
5. Touch and interaction
6. Hierarchy and choice
7. States, feedback, errors
8. Accessibility beyond contrast
9. Motion
10. Platform fit
11. Review checklist

## 1. Work order: the efficient way to design

1. **Content and flows before pixels.** List what each screen must show and do, with real data.
   Most redesigns come from discovering content late (a longer name, a missing state).
2. **Tokens before screens, components before copies.** One colour or radius change should be
   one edit. Hand-styled duplicates drift; components don't.
3. **Design the hardest screen first** (the densest data screen, not the splash). It stress-tests
   the system; easy screens then fall out of it.
4. **One platform complete, then convert**, don't build iOS and Android in parallel.
5. **Auto layout everywhere.** Spacing and resizing stay correct when content changes, and the
   builder reads the intent (padding, gap, fill/hug) straight from the file.
6. **Name layers by role** (`Field / Email`, `Row / Language`), not `Frame 231`. Names are the API
   for the prototype, the checker and the developer.
7. **Verify in small loops**: change → screenshot → fix. Batch commands, never batch looking.

## 2. Layout and spacing

- **8-point grid** (4 for fine steps): spacing and sizes in multiples of 8 (4). Consistent rhythm
  reads as quality, and it maps cleanly to every screen density.
- **Spacing shows grouping (proximity)**: space inside a group < space between groups. If two things
  belong together, put them closer than either is to anything else, before reaching for lines or boxes.
- **Alignment**: everything sits on a few shared edges. One left edge per column; no near-misses
  (a 2-pt offset looks like a mistake).
- **Margins**: 16 (Android) / 16–20 (iOS) side padding; never let text touch screen edges.
- **Safe areas**: nothing interactive under the status bar, notch or home indicator.
- **Whitespace is a feature**: crowding hides the important thing. Remove before you shrink.

## 3. Typography

- **A type scale, not ad-hoc sizes**: ~6 steps (e.g. 12 / 13 / 15–17 / 20 / 28 / 34–40). Hierarchy
  comes from contrast between steps; too many sizes flatten it.
- **Body ≥ 16 sp/pt on phones** (iOS body 17); captions ≥ 12. Smaller fails readability outdoors.
- **Line length** 30–40 characters is comfortable on phones; line height ~1.3–1.5× for body.
- **Two typefaces max** (plus a mono for codes and a script font per extra writing system).
- **Weight before size** for emphasis within a component; colour (muted) for de-emphasis.
- **Tabular figures for numbers that change or align** (counts, prices, timers).
- **Support Dynamic Type / font scaling**: layouts must survive 130–200 % text without clipping,
  let rows grow, avoid fixed-height text containers.

## 4. Colour and contrast

- **WCAG AA contrast**: body text ≥ **4.5:1** against its background; large text (≥ 24 px, or ≥ 18.7 px
  bold) and UI parts (icons, field borders, focus rings) ≥ **3:1**. Check text on gradients against
  the lightest stop. People read phones in sunlight; low contrast is the most common real defect.
- **Never colour alone**: pair colour with an icon, label or shape (error = red + icon + message;
  selected = colour + check or weight). ~8 % of men have colour-vision deficiency.
- **60-30-10**: mostly neutral, a secondary, one accent for the primary action. If everything is
  bright, nothing is.
- **One primary action colour** used only for the main action per screen.
- **Bright accents (lime, yellow) take dark text**; white on them fails contrast.
- **Dark mode is its own palette**, not inverted: near-black backgrounds (not pure #000 for large
  areas), lighter surfaces for elevation, slightly desaturated accents, re-checked contrast.

## 5. Touch and interaction

- **Tap targets ≥ 44×44 pt (iOS) / 48×48 dp (Android)**, with ≥ 8 between targets. The visible icon
  can be smaller; the tappable frame can't. Small targets cause mis-taps and fail accessibility.
- **Fitts's law**: the more important/frequent the action, the bigger and closer to the thumb.
  Primary actions bottom or full-width; destructive actions away from frequent ones.
- **Thumb zone**: bottom half of the screen is easy, top corners hard, put navigation and the
  main action low (tab bars, bottom buttons, bottom sheets).
- **Use the right keyboard and input**: numeric pad for numbers, email keyboard, capitalization
  for codes, pickers for fixed sets. Every avoided keystroke counts.
- **Forgiving inputs**: accept spaces, dashes, other digit scripts, lowercase; normalize silently.

## 6. Hierarchy and choice

- **One primary action per screen**, visually dominant; secondary actions quieter (outline, text).
- **Hick's law**: decision time grows with the number of choices, show fewer options, group the
  rest, default to the common one.
- **Progressive disclosure**: show what most people need; put the rest one tap away (details,
  advanced settings). Don't make everyone pay for edge cases.
- **Recognition over recall**: show recent items, suggestions, current values in settings rows.
- **Squint test**: blur the screen, the most important element should still stand out.

## 7. States, feedback, errors

- **Every async action has visible feedback within ~100 ms**; anything > 1 s gets progress,
  > 10 s gets a percentage or steps and a way to cancel.
- **Design all states**: empty (with a helpful next step, not just "No data"), loading (skeletons
  over spinners for content), partial, error (what happened + how to fix + retry), success.
- **Prevent errors before reporting them**: constrain inputs, confirm destructive actions, offer undo
  where possible (undo beats confirmation dialogs for reversible actions).
- **Error messages**: plain language, at the field, say how to fix ("Use 6 digits"), never blame.
- **Keep users oriented**: clear titles, back always available, current selection visible.

## 8. Accessibility beyond contrast

- Every icon-only button needs a text label for screen readers (TalkBack / VoiceOver); write
  them in the handoff.
- Logical reading/focus order (top-to-bottom, start-to-end; mirrored in RTL).
- Don't encode meaning only in position or animation.
- Respect reduced motion and bold text settings.
- Text in images is invisible to screen readers and translation, use real text.

## 9. Motion

- **Purposeful only**: show where something came from or went (navigation, sheets, state change).
- **Durations**: 100–200 ms for small UI feedback, 200–300 ms for screen/sheet transitions,
  ≤ 400 ms for large movements. Ease-out entering, ease-in leaving.
- Never block input on animation; offer reduced-motion alternatives (cross-fade).

## 10. Platform fit

- **Follow platform conventions unless there's a reason**: iOS back gesture and large titles,
  Android system back and top app bars, native toggles and pickers. Familiarity is free usability.
- Keep **one brand** across platforms (colour, type, illustration, copy) and let **controls** be native.
- Use the platform's spacing and sizes (`design-system.md`), its icon styles, its haptics.

## 11. Review checklist (run before calling a screen done)

- [ ] One clear primary action; squint test passes
- [ ] Spacing on the 8-pt grid; grouping visible from spacing alone
- [ ] Type from the scale only; body ≥ 16; no clipped text at large font sizes
- [ ] Contrast ≥ 4.5:1 text, ≥ 3:1 large text/UI (`audit_design.py`)
- [ ] Tap targets ≥ 44 pt / 48 dp (`audit_design.py`)
- [ ] Colour never the only signal
- [ ] Empty, loading, error and success states exist
- [ ] Works mirrored for RTL; long and Arabic text fits
- [ ] Dark variant checked
- [ ] Icon-only buttons have labels in the handoff
- [ ] Copy is real, short and consistent with what the app actually does
