# Without FigCraft

The phases are the same; only the mechanics change.

## Figma

- Needs a Figma MCP server or plugin bridge with write access; read-only Dev Mode MCP can inspect
  but not draw. Check which tools exist before promising edits.
- Map the FigCraft concepts: frames, auto layout, components/variants and variables all exist in
  Figma; prototype variables and conditionals exist on paid plans.
- `check_design.py` reads `.figcraft` only. For Figma, export the file JSON via the REST API
  (`GET /v1/files/:key`) and adapt the loader (node names and `prototypeInteractions`/`reactions`),
  or check exported PNG names and a link list instead.

## HTML/CSS mockups (works anywhere)

1. One HTML file per screen (or one page with sections), sized to the device frame
   (`width: 390px; height: 844px` / `412×917`), tokens as CSS custom properties on `:root` with a
   dark override.
2. Load fonts from Google Fonts; use real copy and sample data.
3. Render each screen to PNG at 2× with a headless browser (e.g. Playwright:
   `page.setViewportSize`, `page.screenshot({ path, scale: "device" })` with `deviceScaleFactor: 2`).
4. Make it clickable with plain links and a little JS for state (segmented controls, sheets), the
   same patterns as `prototype.md`, with real text inputs, which HTML gives you for free.
5. The handoff is the same zip, with the HTML in `design/mockups/` alongside the PNGs.

HTML mockups are faster to iterate and take real input, but drift further from native components;
say so, and lean on screenshots of the built app for the final comparison.
