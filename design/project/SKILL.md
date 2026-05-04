---
name: pragma360-design
description: Use this skill to generate well-branded interfaces and assets for Pragma360 (SaaS de simulation de gestion de projet & recrutement), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

This design system contains:
- `README.md` — product context, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — all CSS tokens (colors, type, spacing, radius, elevation, motion) + light/dark vars
- `assets/` — logos (wordmark bicolor + reverse + mono + favicon), hero geometric, empty-state illustration
- `preview/` — HTML reference cards for every foundation + component
- `ui_kits/app/` — Pragma360 app UI kit (React 18 + tokens) with 4 screens: Dashboard apprenant, Simulation meeting, Deliverable, Recruiter 360 report + PMO drawer + FAB

**Brand** : Pragma360 — "Pro d'abord, ludique ensuite". Crédible comme Linear/Stripe, pas Duolingo.
**Palette stricte** : brand `#1A2B48` + accent CTA `#EE7A3A` + warm-gray neutrals.
**Typo** : Montserrat 700/800 (display) + Inter 400-700 (body).
**Radius** : sobre (4/6/8/12 + full) — **jamais** 16–20px.
**Voice** : français, vous par défaut, verbes d'action, **pas d'emoji dans l'UI produit**, pas d'interjections.
**Icons** : KeenIcon (UI app) + Lucide (menus uniquement). Dans ce skill, Lucide est utilisé partout en stand-in.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. Import `colors_and_type.css` and reuse the `ui_kits/app/primitives.jsx` component patterns.

If working on production code, the real stack is React 19 + Radix UI + CVA + Tailwind v4 (`@theme` directive) + react-hook-form + zod + Sonner + Framer Motion + next-themes. Read the patterns in `ui_kits/app/*.jsx` to understand component shape.

If the user invokes this skill without any other guidance, ask them what they want to build, ask a few targeted questions (surface : apprenant / recruteur / admin / marketing ; écrans clés ; variations souhaitées), and act as an expert designer who outputs HTML artifacts **or** production code, depending on the need.
