# FigCraft recipes

FigCraft is a desktop design tool driven through an MCP server (tool names like
`mcp__figcraft-app__batch`). Coordinates are in points, y down; `x`/`y` are relative to the parent
frame. Every menu action is a command: discover them with `list_commands` + a `filter`.

## Contents
1. Setup and orientation
2. Building: batch, refs, auto layout
3. Editing existing layers
4. Components and variants
5. Variables and bindings
6. Prototype interactions
7. Exporting
8. Reading the file directly
9. Gotchas (things that cost a retry)

## 1. Setup and orientation

- The app must be running before Claude Code starts, or the MCP server fails to connect. If the
  tools are missing, tell the user to start FigCraft (with its control port) and restart the session.
- First look: `inspect_document` with `outline: true, depth: 1` (pages and top-level frames), then a
  page `screenshot`. On big files a full inspect overflows; use `get_node` on one subtree with
  `fields: [...]` to keep responses small.
- `run_command page.select {id}` before creating layers on another page, new top-level layers
  land on the **current** page, whatever page you meant.

## 2. Building: batch, refs, auto layout

Use `batch` for anything over two steps: it's one undo step and later steps can reference earlier
results.

```json
[{"command":"node.create","as":"card","params":{"type":"frame","name":"Owner","parent":2017,"index":2,
   "props":{"fill":"#FFFFFF","cornerRadius":20,"layout":"horizontal","gap":12,"padding":[8,8,8,12],
            "crossAlign":"center","sizingH":"fill","sizingV":"hug"}}},
 {"command":"node.create","params":{"type":"text","parent":{"$ref":"card"},"text":"Tony Issa",
   "props":{"fontFamily":"Inter","fontStyle":"Semi Bold","fontSize":15,"fill":"#0A0A12"}}}]
```

- `{"$ref":"name"}` stands for the `id` of the step named with `"as"`. Commands that return several
  ids (like `edit.duplicate`) need `{"$ref":"name","field":"ids/0"}`; with `"map": true`, a copy of
  layer 3 is `{"$ref":"dup","field":"map/3"}`.
- Inside auto-layout parents, position comes from `index`; use `sizingH: "fill"` for full-width
  children and spacer frames (`fills: []`, fixed height) for vertical rhythm, matching the file's
  existing style.
- Vectors: `type: "vector"` with an SVG `path`, `width`/`height` to scale, `fills: []` and a
  `stroke` for line icons. A path not starting at 0,0 is offset by its own box; fix with `x`/`y`.
- Gradients: `"fills":[{"type":"linearGradient","stops":["#3355FF","#7C5CFF"],"from":[0,0],"to":[1,1]}]`.
- Blur glows: an ellipse with `effects:[{"type":"layerBlur","radius":200}]` and low opacity.
- Shadows: `{"type":"dropShadow","color":"#05051C26","offset":[0,2],"radius":6}`.

## 3. Editing existing layers

- `set_properties` (or `node.set` in a batch) for properties; `characters` for text.
- Delete is **`edit.delete {ids}`** (there is no `node.delete`).
- Reorder in auto layout: `node.reorder {id, index}`. Move into another parent:
  `node.reparent {ids, parent, index}` (also works with a page id as parent).
- Duplicate: `edit.duplicate {ids, dx, dy, map:true}`. With `dx/dy` 0 the copy stays in the same
  parent, handy for "same thing, other state" pairs. Copies keep interactions and variable
  bindings; clear (`proto.interaction.clear`) and rebind what should differ.
- Scale a group with its strokes/text: `transform.scale {ids, factor, cx, cy}`.
- Second platform: duplicate the finished screen frame, delete its body, reparent a duplicate of the
  other platform's body into it, then convert fonts/radii in one `node.set` over the collected text
  ids. Collect ids with `get_node` (`fields: ["type","fontFamily","name"]`), don't guess them.

## 4. Components and variants

- `node.create` with `type: "component"` makes a main component; `instance.create {component, parent}`
  places it. Put mains on a `Components` page so they don't clutter screens.
- Variants: create one component per state named `Prop=Value` (e.g. `Value=Light`), then
  `component.combineVariants {ids}` → a set with property `Prop`. To add a state to an existing
  component, `component.addVariant {id, property, value}` (duplicating a main gives an instance,
  not a variant).
- Interactions placed inside variants work on every instance, that's how a segmented control can
  set state wherever it's used.

## 5. Variables and bindings

```json
{"command":"variable.createCollection","params":{"name":"App state","modes":["Default"]}}
{"command":"variable.create","params":{"collection":"App state","name":"appearance","type":"string","value":"Auto"}}
{"command":"variable.bind","params":{"ids":[3225],"field":"characters","variable":"VariableID:1"}}
{"command":"variable.bind","params":{"ids":[3765],"field":"componentProperties/Value","variable":"VariableID:2"}}
{"command":"variable.bind","params":{"ids":[1792],"field":"visible","variable":"VariableID:10"}}
```

- Bind `characters` (text follows a string variable), `componentProperties/<Prop>` (an instance shows
  the variant named by a string variable), `visible` (boolean), colours, sizes.
- `variable.set {variable, value}` changes the stored value, use it to **simulate taps** and
  screenshot the result, then set everything back (see prototype.md).
- `proto.evaluate {expression}` tests an expression without changing anything. Check what the
  language supports before designing around it (string `+` worked; `slice`, `substring`,
  `length`, `floor`, `round` and `%` did not in the version used).

## 6. Prototype interactions

```json
{"command":"proto.interaction.add","params":{"id":1777,"trigger":{"type":"onClick"},
  "action":{"type":"navigate","dest":3121},"transition":{"type":"push","direction":"left"},
  "durationMs":320,"easing":"easeOut"}}
```

- `dest` goes **inside** `action`. Multiple actions: `"actions":[...]` instead of `"action"`.
- Set state: `{"type":"setVariable","variable":"VariableID:2","value":"Dark"}` or with
  `"expression":"searchText + \"1\""`.
- Conditional: `{"type":"conditional","blocks":[{"expression":"searchLen < 6","actions":[...]},
  {"actions":[...]}]}`, a block without condition is the else. `and` combines conditions.
  Change a condition later with `proto.conditional.setCondition {id,index,path,block,expression}`.
- Bottom sheets: a top-level frame named `Overlay / <name> · <Platform>` holding an instance of the
  sheet component; open with `{"type":"openOverlay","dest":<frame>,"position":"bottomCenter",
  "background":"#0A0A1266"}` and close from inside with `{"type":"closeOverlay"}`.
- Timed steps: trigger `{"type":"afterDelay","ms":2500}` on a frame (e.g. a progress screen that
  finishes by itself, setting variables then navigating).
- Physical keys while presenting: trigger `{"type":"keyPress","key":"7"}` on the screen frame.

## 7. Exporting

- `export {ids, scale:2, path}` → PNG of one frame (shadows included). For the whole page pass the
  list of top-level ids explicitly: with no ids it exports the **selection**, which after an edit
  may be one tiny layer.
- `export {ids, format:"svg", path}` for logos; `size:"1024w"` for exact widths.
- `save_file {path:"…/App.fig"}` writes an experimental Figma copy, it drops variable and
  conditional prototype actions; say so when handing it over.
- Always `save_file` (no path) after a batch you want to keep; checks read the saved file.

## 8. Reading the file directly

`.figcraft` is a zip containing `document.json`: `pages` (ids), `nodes` (id → node with `name`,
`type`, `parent`, `children`, `width`, `height`, `fills`, `style` for text, `corners`, `interactions`,
`bound` for variable bindings, `component` for instances) and `variables`. Scripts in `scripts/`
read it; so can a builder who doesn't have FigCraft.

## 9. Gotchas

| Symptom | Cause / fix |
|---|---|
| Batch fails with "no such node" and nothing changed | the whole batch rolled back; a step referenced a layer deleted earlier in the same batch, or a guessed id. Look ids up, retry |
| `$ref` "result has no id" | the step returned `ids` (duplicate), use `field: "ids/0"` |
| New component appeared on the wrong page | current page wasn't selected; `node.reparent` it to the right page |
| Screenshot of several frames is tiny | they're far apart on the canvas; screenshot one at a time |
| White text renders as empty | screenshot of a layer with no background; screenshot its parent |
| Multi-line overflow after adding a row | check spacer heights first; shrink spacers rather than the frame |
| Arabic digits jumble inside English text | bidi reordering; put LRM (U+200E) after each Arabic-Indic number |
| Copied layer still opens the old sheet | duplicates keep interactions; clear and re-add |
| Fresh export of the page is 4000×106 | exported the selection, pass explicit ids |
