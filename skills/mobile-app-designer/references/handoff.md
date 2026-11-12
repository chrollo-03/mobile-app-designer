# Handoff package

The test of a handoff: another developer (or Claude Code in a fresh session) can build the app
without asking what you meant. Templates are in `templates/`.

## Layout

```
<app>-<platform>-handoff/
├── README.md              what's inside, where to start (templates/README.template.md)
├── PROMPT.md              short paste-in prompt + full build spec (templates/PROMPT.template.md)
├── SETUP.md               what to install, phone/simulator setup (templates/SETUP.template.md)
├── design/
│   ├── DESIGN-TOKENS.md   from scripts/extract_tokens.py (templates/DESIGN-TOKENS.template.md)
│   ├── screens/           PNG of every in-scope screen + sheet, 2×, plus _overview.png
│   ├── <App>.figcraft     source (zip of JSON, readable without FigCraft)
│   ├── <App>.fig          optional Figma copy (say it has no variable interactions)
│   └── logo/              full icon set + logo prompt
└── reference/             rules modules + tests, sample (fake) data
```

## Writing PROMPT.md

1. **Paste-in prompt** (5–8 lines): read these files, build in `./app-src`, check tools from
   SETUP.md (ask before installing), go milestone by milestone, run each milestone's checks and
   show results, ask before deciding anything marked OPEN.
2. **What the app is**, two or three sentences.
3. **Fixed decisions** table: platform, stack, data (online/offline), accounts, min OS, languages,
   testing device. Mark them "don't change without asking".
4. **Screens** table: number, PNG file, name, notes. Say which designed screens are out of scope
   and which prototype-only widgets (custom keypads) should become system controls.
5. **Behaviour**: search/lookup rules, settings and how they persist, import/sync, errors.
6. **Data**: column table with meaning and quirks (unknown markers, scripts, formats); which
   columns are personal data.
7. **Rules module**: point at the reference code and its tests as the spec; ask for a port with
   the same cases.
8. **OPEN decisions**: conflicts you found (e.g. a design showing personal data while the import
   screen says it's skipped). List options and a recommendation; tell the builder to ask.
9. **Milestones** with "done when" checks (build passes, tests pass, sample import gives N rows,
   screenshots match).
10. **Don'ts**: no network/analytics if offline, no bundled real data, no invented data.

## Before zipping

- Exclude: real or personal datasets, `.env`/keys/tokens, caches, lock files, out-of-scope
  screens (e.g. iOS when building Android, account screens that were dropped).
- Double-check token values against the file, don't trust memory.
- Re-export screens changed since the last export (the checker's export test helps).
- Zip, unzip into a fresh folder, run the reference tests from there, open the design file.
- Tell the user what was left out and why, and which OPEN decisions they could settle now.
