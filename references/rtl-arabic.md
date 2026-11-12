# Arabic and right-to-left

## In the design

- Use a real Arabic font (Noto Sans Arabic or similar) on Arabic text; Latin fonts fall back badly.
- Right-align Arabic values inside left-to-right screens (e.g. a name field), or mirror the whole
  screen for an Arabic UI (back arrow flips, lists align right, icons with direction flip).
- Show at least one screen with real Arabic content: names, a mixed line, Arabic-Indic digits.
- Offer the digit choice (123 / ١٢٣) as a setting if the audience uses both.
- **Mixed text**: Arabic-Indic digits inside an English sentence get reordered by the bidi
  algorithm (`Updated ١١ Nov ٢٠٢٦ · ٥٠١ MB` rendered as `٥٠١٠٢٠٢٦`). Put LRM (U+200E) after each
  Arabic-Indic number in LTR text; in apps, wrap with Unicode isolates or set text direction.
- Plate/ID codes may use Arabic letters too; pickers should list both scripts.

## In data and code

Real Arabic data is messy. Before search or validation, normalize:

| Problem | Fix |
|---|---|
| Arabic-Indic `٠–٩` and Persian `۰–۹` digits | map to ASCII before parsing |
| Diacritics (harakat), tatweel `ـ` | strip for display cleanup |
| Invisible bidi marks from copy/paste (U+200E/F, U+202A–E, U+2066–9, U+061C, BOM) | strip |
| Presentation forms (U+FB50–FDFF, U+FE70–FEFF) | NFKC normalize |
| Spelling variants `أ إ آ ٱ → ا`, `ى → ي`, `ة → ه`, `ؤ → و` | fold for **search keys only**, never for display |
| `ال` prefix, `عبد الله` vs `عبدالله` | drop/join in name keys |
| Dates: `dd/mm/yyyy`, ISO, Levantine months (كانون الثاني…), MSA (يناير…), French | parse day-first; reject Hijri (`هـ`) rather than misread |
| Phones | normalize to E.164 per country rules; reject invalid prefixes |

Keep these rules in one module with tests that run against the real sample data (every date and
phone in the sample should parse or be deliberately rejected). Port the same tests when the app is
built in another language.

**Escapes in code**: write invisible characters as `\uXXXX` and check with
`scripts/escape_invisible.py --check`, editors and tools can silently turn escapes into raw bidi
controls, which security scanners flag and humans can't see.

## Legal note

Some datasets contain personal data (owner names, phones). Many countries regulate this (e.g.
Lebanon Law 81/2018, GDPR). Flag it to the user, design a "skip personal columns" option, and
record their decision in the handoff.
