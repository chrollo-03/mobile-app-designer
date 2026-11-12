# Example: Barwise, a lifting tracker (iOS + Android)

A complete design made with this skill in FigCraft: 16 screens (8 per platform), a clickable
prototype, an app icon and a checker spec. All names and numbers are made up.

![Overview](screens/_overview.png)

## Brief
Log strength workouts fast, between sets, with one hand. Plan today's session, log weight and
reps per set, rest with a timer, see new records at the end, and track strength over months.
Offline first, no account needed.

## What's in the file
- **Page `Screens`**: `iOS / N Name` (390 x 844) and `Android / N Name` (412 x 917):
  1 Today, 2 Workout, 3 Rest, 4 Summary, 5 Progress, 6 Settings, 7 History, 8 Workout · dark.
- **Page `Logo`**: the 1024 px app icon and the `Logo / mark` frame (barbell with a lime
  "progress" dot).
- **Prototype**: Start workout → Workout → Log set → Rest → Skip rest → Workout → Finish →
  Summary → Save workout → Today, plus every tab, on both platforms.

| | |
|---|---|
| ![iOS Today](screens/iOS-1-Today.png) | ![iOS Workout](screens/iOS-2-Workout.png) |
| ![Android Rest](screens/Android-3-Rest.png) | ![Android Summary](screens/Android-4-Summary.png) |

## Decisions that shaped it
- **One primary action per screen**: Start workout, Log set, Skip rest, Save workout. The rest
  are text buttons or quiet secondary buttons.
- **The current set is the loudest thing on the Workout screen**: tinted row, outlined inputs,
  and the bottom button repeats exactly what will be logged ("Log set 3 · 82.5 kg × 6").
- **"Previous" column**: last session's numbers sit next to today's inputs, so progressive
  overload needs no memory.
- **Records get their own colour**: lime is used only for done sets and new records, so it
  always means "good news".
- **Rest is dark on purpose**: the screen people stare at between sets is calm and readable
  from a distance.
- **Platform fit**: iOS tab bar with home indicator and 44 pt targets; Android navigation bar
  with a pill on the active tab, gesture handle, pill buttons and 48 dp targets.

## Colour tokens
| Role | Light | Dark |
|---|---|---|
| Background | `#F4F3EF` | `#0E0F11` |
| Surface | `#FFFFFF` | `#1A1B1F` |
| Text | `#111214` | `#F2F2F3` |
| Text, secondary | `#5B5E66` | `#A3A6AE` |
| Primary (actions) | `#C2410C` | `#FF8A4C` |
| Hero / rest | `#17181C` | `#17181C` |
| Record / done | `#D9F99D` on `#1A2E05` | same |

Font: Inter on both platforms.

## Check it yourself
```bash
python3 scripts/check_design.py examples/barwise/design-spec.json      # 137 passed, 0 failed
python3 scripts/audit_design.py examples/barwise/Barwise.figcraft Screens   # 0 issues
python3 scripts/extract_tokens.py examples/barwise/Barwise.figcraft Screens "iOS /"
```
