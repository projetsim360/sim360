# Pragma360 — UI Kit (App web)

Pixel-fidelity recreations of core screens. React 19 + Radix-style primitives + CVA-inspired variants, but here simplified to plain JSX that reads the design tokens directly from `../../colors_and_type.css`.

## Stack (cible production)

- React 19
- Radix UI primitives (Dialog, Popover, DropdownMenu, Tooltip, Sheet…)
- CVA pour les variants
- Tailwind v4 avec CSS vars (`@theme`)
- react-hook-form + zod
- Sonner (toasts)
- Framer Motion pour les animations complexes
- next-themes (dark mode)
- KeenIcon (UI) + Lucide (menus) — **Lucide en stand-in partout ici**

## Écrans inclus

- **Dashboard apprenant** — KPIs, simulations en cours, inbox, FAB Agent PMO
- **Agent PMO drawer** — tabs Chat / Contexte, messages
- **Simulation meeting** — page shell avec transcript + décision à prendre
- **Livrable** — card livrable + feedback IA coach
- **Rapport 360 recruteur** — scores candidat + analyse

Click-through via state React local. Les écrans sont switchables via la sidebar.

## Fichiers

- `index.html` — entrée + composition
- `App.jsx` — router local + sidebar
- `Sidebar.jsx` — nav latérale
- `Toolbar.jsx` — toolbar top avec titre/breadcrumb/actions
- `Dashboard.jsx` — écran accueil apprenant
- `Simulation.jsx` — meeting en cours
- `Deliverable.jsx` — livrable + feedback
- `Recruiter360.jsx` — rapport 360
- `PmoDrawer.jsx` + `Fab.jsx` — agent contextuel
- `primitives.jsx` — Button, Card, Input, Badge, Avatar, KpiTile, ProgressBar…
