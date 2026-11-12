# Designing by app type

Find the type closest to the brief and read its section before phase 3. Each lists the screens to
design, the patterns users expect, the colour preset (`assets/palettes.json`), type direction,
and the traps. Mixed apps (e.g. a fitness app with a shop): combine sections, keep one primary
identity.

## Contents
1. Finance & banking
2. Health & fitness
3. Meditation & wellness
4. Food & delivery
5. E-commerce & retail
6. Social & messaging
7. Productivity & tools
8. Travel, maps & mobility
9. Education & kids
10. Media & streaming
11. Real estate, booking & hospitality
12. Utility, search & lookup

---

## 1. Finance & banking: preset `finance`
**Screens**: onboarding + ID/KYC, sign in (biometric), home (balance, recent activity), account
detail, transaction detail, send/transfer (amount → recipient → review → success), cards (freeze,
limits), budgets/insights, notifications, settings & security.
**Patterns**: balance as the big-number anchor with a hide/show toggle; activity grouped by day;
review screen before any money moves; success screen with receipt and share.
**Type**: tabular figures for all amounts; currency symbol smaller than the number; sign (−/+) plus
colour plus label for debits/credits.
**Traps**: red/green as the only signal; ambiguous dates; no confirmation on transfers; tiny
disclosures. Security cues (lock icons, masked numbers) must be real, not decoration.

## 2. Health & fitness: preset `health-fitness`
**Screens**: goal setup, today dashboard (rings/progress), workout or activity list, live
tracking (big glanceable metrics, large controls), summary/history, plans, profile with units.
**Patterns**: progress rings or bars with numeric value; streaks; glanceable live screens usable
while moving (huge numbers, ≥ 56 pt targets); celebratory completion.
**Traps**: shaming copy; medical claims; tiny controls during workouts; units not respecting locale
(km/mi, kg/lb). Health data is sensitive, say where it's stored.

## 3. Meditation & wellness: preset `wellness`
**Screens**: gentle onboarding (intent), home with today's session, player (full-screen, minimal),
library by mood/length, progress (soft, not competitive), reminders.
**Patterns**: dark mode as default option; slow, eased motion (300–500 ms); large whitespace;
audio player with big play/pause and timer.
**Traps**: loud colours and badges; streak guilt; too many choices up front (Hick's law).

## 4. Food & delivery: preset `food-delivery`
**Screens**: address + location permission, home (search, categories, promos, restaurants),
restaurant menu, item detail with options, cart, checkout (address, time, payment, tip),
live order tracking (map + steps), ratings, order history.
**Patterns**: photo-led cards (photo, name, rating, time, fee); sticky cart bar with total;
step tracker with ETA; reorder.
**Traps**: hiding fees until checkout; unreadable text on photos (use a scrim); options that
reset when going back; tiny "+" buttons.

## 5. E-commerce & retail: preset `ecommerce`
**Screens**: home/feed, search with filters and sort, product list (grid), product detail
(gallery, variants, price, delivery, reviews), cart, checkout, order tracking, returns,
wishlist, account.
**Patterns**: filter chips + sort; product card = image, name, price, rating; sticky "Add to
cart"; variant pickers that show availability; trust signals (returns, delivery date) near price.
**Traps**: colour as the only variant indicator; forced sign-up before checkout; images with
different aspect ratios in one grid; discount maths the user has to do.

## 6. Social & messaging: preset `social`
**Screens**: onboarding + contacts permission, feed, post detail with comments, compose (media,
mentions), profile, chat list, chat thread, notifications, search, privacy & blocking.
**Patterns**: content-first layouts with quiet chrome; reactions; unread badges; composer
pinned above the keyboard; message states (sending, sent, read, failed + retry).
**Traps**: low-contrast timestamps; no report/block path; infinite feed with no end state;
notifications as the only colour.

## 7. Productivity & tools: preset `productivity`
**Screens**: empty-state onboarding (create first item), list/board, item detail/editor, quick add,
search, filters/views, calendar/due dates, settings, sync/offline state.
**Patterns**: fast capture (one tap to add); swipe actions with undo; keyboard-friendly forms;
clear empty states with a next step; offline/sync indicators.
**Traps**: decoration over density; destructive swipes without undo; lost edits on back.

## 8. Travel, maps & mobility: preset `travel-mobility`
**Screens**: search (from/to, dates, travellers), results with sort/filter, detail, seat/room
choice, checkout, trip/ticket (offline-ready, QR), live trip/map, changes and refunds.
**Patterns**: map + bottom sheet (peek / half / full); big ticket card with QR and key times;
timeline of a trip; offline access to tickets.
**Traps**: text over maps without a surface; time zones; tiny date pickers; tickets that need
network to show.

## 9. Education & kids: preset `education`
**Screens**: profile/age setup, home with today's lesson, lesson player (step by step), quiz with
feedback, progress and rewards, parent area (gated), settings.
**Patterns**: one task per screen; immediate, kind feedback; progress bars; rewards with an accent
colour; large targets (≥ 48) and big readable text for young readers.
**Traps**: reward noise that distracts from learning; ads/dark patterns; parental gates that are
trivial. Mind child-privacy laws (COPPA, GDPR-K).

## 10. Media & streaming: preset `media`
**Screens**: profiles, home (hero + rails), browse/search, title detail, player (controls,
subtitles, quality), downloads, continue watching, settings.
**Patterns**: dark-first UI so artwork glows; horizontal rails with partial last card; poster
cards with progress bar; player controls that hide and return on tap.
**Traps**: text over artwork without a gradient scrim; autoplay with sound; tiny player controls.

## 11. Real estate, booking & hospitality: preset `real-estate-booking`
**Screens**: search with location and filters, map/list toggle, listing detail (gallery, price,
key facts, map, host/agent), booking flow (dates, guests, price breakdown), messages, trips/saved.
**Patterns**: photo-first detail with a sticky price + action bar; price breakdown before paying;
map pins with price labels; saved/heart.
**Traps**: hidden fees; filters that reset; galleries without count/position.

## 12. Utility, search & lookup: preset `utility-lookup`
**Screens**: search home (input + recent), searching/progress, one result, several results, no
result (with "try another way"), detail with copyable fields, saved items, settings, data import
and update.
**Patterns**: input that matches the data (pickers built from the real codes, a keyboard
limited to valid characters); recent searches including misses; big result anchor (the ID searched for) with data tiles;
copy buttons on IDs; honest privacy/offline copy with proof ("0 bytes sent").
**Traps**: one flat "not found" dead end; ignoring mixed scripts/digits in input; showing personal
data without a decision on it.

---

## Universal for every type
Onboarding ≤ 3 screens and skippable · permissions asked in context, with a reason · empty,
loading, error and offline states · settings with language, appearance, notifications · an
accessible tab bar or clear back navigation · a privacy explanation in plain words.
