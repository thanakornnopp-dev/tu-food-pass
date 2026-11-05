# Product

<!-- impeccable:product-schema 1 -->

<!-- Provenance: written from the owner's answers in the planning conversation (2026-11-05). The structured interview round was replaced by those answers because the user said to proceed; facts below were stated by the user unless marked [inferred]. -->

## Platform

web

## Stack

Plain static HTML, CSS and vanilla JavaScript with classic scripts, no build step, no framework. Delegated to the assistant by the user; chosen so the project stays editable by a student and runs fully offline. Deploy target: GitHub Pages (HTTPS) so the service worker can cache the app for offline use after one visit [inferred from the offline iPhone requirement].

## Users

- **Primary:** Thammasat University (Rangsit campus) students deciding what to eat between classes, often on a budget, often with friends.
- **Actual audience of this build:** the TU109 (Innovation & Entrepreneurship) professor, who sees the app through iPhone-to-Mac screen share while a student presents. The screen is shown at iPhone size; no desktop layout is wanted.
- The project belongs to the user's friend; the user is helping build it.

## Product Purpose

TU Food Pass tells a student which stall to eat at, what to order and what it costs, then pays them back with coupons. It is a course project that must demonstrate a believable 3-tier subscription business model (Eater Pass 39 baht, Meal Plan Creator 79 baht, VIP / Feature Unlocked 99 baht per month) and a working product behind it. Success = the professor sees every promised feature actually work, offline, on a phone.

## Positioning

Existing campus random-food pickers (the baanTU Food & Lifestyle spinner that inspired this) only return a stall name. TU Food Pass returns the stall, the dish, the price and a redeemable coupon, can plan a whole week of meals inside a budget, and settles group arguments with a veto round.

## Operating Context

- Runs on an iPhone (Safari / Add to Home Screen), screen-shared to a Mac for a classroom presentation.
- Must work with no internet: no network fonts, no CDN scripts, no API calls. State lives in localStorage.
- Presenter walks the tiers in order: Free, Eater Pass, Meal Plan, VIP. A discreet presenter control must switch tiers and reset the demo.
- All user-facing copy is Thai.

## Capabilities and Constraints

- Tiers are cumulative: Eater Pass adds coupons on every spin; Meal Plan adds the 7-day, 21-meal planner with a savings summary measured against the 79 baht fee; VIP adds lucky-colour (สายมู) spin, detailed health filters and the Party Veto group spin.
- Party Veto is simulated on one phone: friends are named avatars, each can veto.
- Checkout is a pretend flow; no payment is processed.
- Stall, price, hours and coupon data in `js/data.js` is demonstration data, not verified real deals. The UI must say so and must not show invented user counts or partnerships.
- Photos of food are NOT available yet; the owner will supply them later. Imagery is a placeholder system that photos can replace.
- Out of scope and removed: Shops/Market tab, Events and Announcements, the unwired Canvas wheel, TH/EN switch.

## Brand Commitments

- Name: **TU Food Pass**. Own identity; baanTU is credited only as inspiration, never imitated.
- Visual direction pinned by the user: campus-heritage (Thammasat crimson and gold) combined with a ticket / pass visual language. Do not copy any university emblem.
- Tier names and prices stay exactly as in the README.
- Mascot: a yellow character with a red pagoda-style hat, supplied by the user as an image (`img/mascot.png`, cut out from the user's file). It runs in and jumps for joy when a spin lands and after a successful upgrade. Rights to use it were not confirmed with the user; ask the owner before public release.

## Evidence on Hand

- README.md: business rationale and TU109 grading alignment.
- `js/data.js`: 10 locations, 8 food types, 7 day lucky-colour entries, stalls with prices, hours, calories, tags and coupon deals (demonstration data).
- No photography, no logo files beyond placeholder PWA icons, no real user numbers. Do not fabricate testimonials or counts.

## Product Principles

1. Every control does something real; nothing is decorative or an alert().
2. The business model is visible in the product: locked features show what unlocking buys.
3. Readable at arm's length under campus daylight, in Thai first.
4. Works with no network, always.
5. Honest demo: simulated things are labelled simulated.

## Accessibility & Inclusion

Thai typography with tone marks must not clip. Body text at least 4.5:1 contrast, tap targets at least 44 pt, pinch-zoom allowed, reduced-motion respected, VoiceOver labels on icon-only buttons.
