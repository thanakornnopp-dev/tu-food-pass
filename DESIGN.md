# Design system: TU Food Pass

Built from the shipped app (css/app.css). Mode: Operate. Platform: mobile web, iPhone-only.

## Idea
The app is a pass wallet. Every result, coupon, plan slot and tier is a perforated paper ticket lying on a crimson ground. Gold is foil: it marks the primary action, the active tab and money saved.

Signature move: after the ticket reel lands, the result ticket prints out of a slot, then the stub settles (`.result.fresh`).

## Color
Strategy: Committed crimson ground; paper tickets; gold foil; jade only for open / success.

| Token | Value | Use |
| --- | --- | --- |
| `--crimson-950` | #2d0711 | tab bar, wells, panels |
| `--crimson-900` | #44091a | top bar |
| `--crimson-800` | #5a0d22 | page ground (with faint dot grid) |
| `--crimson-600` | #99182f | buttons on paper, prices |
| `--gold-400` / `--gold-300` | #e8b94b / #f2d37c | primary button, active tab, foil |
| `--paper` / `--paper-2` | #f8f0e0 / #efe3cb | tickets and sheets / stubs |
| `--ink` / `--ink-2` | #2a0b13 / #66434a | text on paper |
| `--jade` | #1b7a55 | open, success |
| `--on-crimson-2` | #e8c8cd | secondary text on crimson |

## Type
- Display and numerals: **Mitr** 500/600 (bundled). Line-height 1.3–1.4 so Thai tone marks never clip.
- Body and UI: **Bai Jamjuree** 400–700 (bundled). Body 16px, small 14px, floor 12px.

## Shape and depth
- Ticket: radius 18, side notches cut with a CSS mask at the perforation line, dashed tear line, stub. Depth is `filter: drop-shadow` on the wrapper (a mask would clip a box-shadow).
- Variants: `--v` (stub below), `--h` (stub right, coupons), `--side` (notches at mid-height, list rows), `--gold` (member pass, plan summary).
- Controls: 44px minimum targets; gold primary button; segmented control; native selects.

## Icons
One authored SVG sprite in `index.html`, 24px grid, 1.75 stroke, round caps. Food glyphs (`f-*`) are placeholders for photos: add `photo` to a stall in `js/data.js` and the tile shows the image instead.

## Motion
Reel (3.1s ease-out-quart with tick sound), ticket print (0.9s), stub settle, stamp on used coupon, sheet slide. All collapse under `prefers-reduced-motion`.

## Provenance
- Fonts: Mitr and Bai Jamjuree from Google Fonts (SIL Open Font License), downloaded into `/fonts`.
- App icons (`icons/icon-*.png`): drawn procedurally with Pillow (crimson ground, gold ticket, bowl). No stock images, no generated rasters.
- Mascot (`img/mascot.png`): user-supplied artwork, background removed with macOS Vision subject lifting and a manual fill of the arm, then trimmed and resized. Animated with CSS only (`.mascot`).
- No photography yet. Stall data is demonstration data.
