# Prototype patterns

Goal: someone presenting the prototype can tap through every flow and use the main inputs, with
state that carries between screens. Patterns below are tool-neutral in idea; command syntax is in
`figcraft.md`.

## Navigation

- Every screen gets an incoming link (the checker's reachability test enforces it). Typical gaps:
  error/empty states. Give them a natural entry, e.g. a "recent search" row that had no match.
- Back/close links on every pushed screen; sheets close via a Done/option tap.
- Push left for drill-down, push right for back, move in from the top (or slide up) for modal
  flows, dissolve for "replace" transitions (sign in → home).

## State with variables

Keep one variable collection (e.g. "App state") and name variables after what they mean
(`language`, `appearance`, `searchText`, `showAdvanced`). Then:

| UI element | Pattern |
|---|---|
| Segmented control / radio | component set with one variant per option (`Value=Light`…); each option inside every variant sets the variable; instances bind `componentProperties/Value` to it |
| Toggle | variants `State=On`/`State=Off`; tapping On sets "Off" and vice versa; bind the instance |
| Picker in a sheet | sheet component with variants per selected value (checkmark moves); options set the variable then close the overlay; the row's value text binds to the variable |
| Value shown in many places | bind every text that shows it (header, tiles, other screens) to the same variable |
| Two modes of one area (Simple / Advanced) | duplicate the area, style the copy for mode 2, bind `visible` of each to its own boolean, switch both booleans together |
| Typed input | append with an expression (`text + "7"`), count length in a number variable, guard with a condition (`len < 6`); Clear sets "" and 0 |
| Process that finishes | `afterDelay` on the progress frame: set result variables, navigate back |
| Desktop presenting | `keyPress` triggers on the screen for digits; guard them with the current mode |

## Limits to state honestly

- Expression languages are small. If there's no substring function, there is no one-character
  delete, offer Clear instead and say so.
- Prototype data is fake: typed values change labels, not the looked-up record. Say it.
- Hidden layers still respond to key triggers unless the condition checks the mode.
- Real apps should use the system keyboard; custom keypads in the prototype exist only because the
  tool can't take typing. Note that in the handoff so the builder doesn't recreate them.

## Simulate, screenshot, reset

To verify without clicking: set the variables the way a tap would (`variable.set`), screenshot
the affected screens, compare with what you expect, then **set every variable back** to its
default and save. Put the defaults in the checker spec (`defaults`) so a forgotten reset fails.
