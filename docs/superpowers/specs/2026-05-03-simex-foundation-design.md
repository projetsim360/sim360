# Simex pro — Design Foundation (Phase 1)

> **Author:** Claude (Opus 4.7) avec @shounsa
> **Date:** 2026-05-03
> **Status:** Spec — pré-implémentation
> **Scope:** Phase 1 sur 5 du plan de migration Simex pro
> **Reference visual:** `design/project/preview/simex-simulation.html`

---

## 1. Goal

Remplacer la fondation visuelle de `apps/webapp` (palette violette/coral héritée de Sim360) par les tokens Simex pro (Deep Blue + Warm Orange + warm-gray neutrals), en conservant intacts tous les composants UI et toutes les pages existantes.

À la fin de Phase 1 :
- L'application tourne avec la nouvelle palette appliquée à tous les composants existants (qui consomment les tokens via Tailwind v4 `@theme`).
- Montserrat est self-hostée et utilisable comme `font-display` ; Inter via Google Fonts CDN comme `font-body`.
- Un toggle de thème (Light/Dark/System) est fonctionnel dans la toolbar de `layout-6`.
- Le wordmark « Simex • pro » remplace « Sim360 / ProjectSim360 » dans la `<Helmet>` et le HTML root.
- Aucun changement de layout, aucune nouvelle interaction, aucune migration de page.

## 2. Non-goals

- Pas de nouveau shell (Phase 2)
- Pas de nouveau pattern `<PageHeader>` (Phase 3)
- Pas d'intégration PMO drawer (Phase 4)
- Pas de migration des features existantes (Phase 5)
- Pas de page de réglages utilisateur
- Pas de variable d'environnement `VITE_SIMEX_DEMO_CONTROLS` (Phase 2)
- Pas de modification des packages `@sim360/*`, schéma Prisma, ou DB (rebrand cosmétique uniquement)

## 3. Architecture & approche

**Approche A** retenue : tokens inlinés dans `apps/webapp/src/styles/globals.css`. Pas de package npm, pas d'import croisé vers `design/project/`. La duplication d'une centaine de lignes de tokens est acceptée — `design/project/colors_and_type.css` reste la **source de vérité documentaire** ; `globals.css` est la **source de vérité runtime**.

**Suppression nette des anciens tokens :** les variables héritées (`--primary` violet, `--accent-brand` coral, `--gradient-brand`, `--color-1..5` rainbow) sont **supprimées**, pas aliasées. Les composants existants qui utilisent les noms shadcn-style (`bg-primary`, `text-primary-foreground`, etc.) continuent de fonctionner car les noms sont conservés ; seules les **valeurs** changent.

## 4. Files touched

| Fichier | Action |
|---|---|
| `apps/webapp/src/styles/globals.css` | **Réécriture** (tokens + Tailwind `@theme` + dark mode block) |
| `apps/webapp/public/fonts/montserrat/*.ttf` | **Création** — copie des 16 TTF depuis `design/project/fonts/` |
| `apps/webapp/src/components/logo/index.tsx` | **Création** — composant `<Logo>` Simex pro |
| `apps/webapp/src/components/theme-toggle/index.tsx` | **Création** — composant `<ThemeToggle>` (Sun/Moon, next-themes) |
| `apps/webapp/src/components/layouts/layout-6/components/toolbar.tsx` | **Modification** — insertion `<ThemeToggle />` |
| `apps/webapp/src/components/layouts/layout-6/index.tsx` | **Modification** — `<Helmet><title>` |
| `apps/webapp/index.html` | **Modification** — `<title>`, `<meta>` description, lang |
| Autres `<Helmet>` `Sim360` dans le webapp | **Modification** — remplacés par `Simex pro` |

**Aucune modification** des 92 composants `components/ui/`, des 39 layouts, des 13 features, du schéma Prisma, des packages backend.

## 5. Token mapping

Les composants existants utilisent les noms sémantiques shadcn-style. On conserve les noms, on remplace les valeurs.

### 5.1 Surfaces

| Token | Light | Dark |
|---|---|---|
| `--background` | `var(--neutral-50)` (`#F5F5F4`) | `var(--neutral-900)` |
| `--foreground` | `var(--neutral-900)` | `var(--neutral-50)` |
| `--card` | `#ffffff` | `var(--neutral-800)` |
| `--card-foreground` | `var(--neutral-900)` | `var(--neutral-50)` |
| `--popover` | `#ffffff` | `var(--neutral-800)` |
| `--popover-foreground` | `var(--neutral-900)` | `var(--neutral-50)` |

### 5.2 Brand & accent (CTA)

Le **CTA primaire est désormais orange**. L'ancien `--primary` (violet) est repointé sur l'orange.

| Token | Light | Dark |
|---|---|---|
| `--primary` | `var(--accent-500)` (`#EE7A3A`) | `var(--accent-400)` |
| `--primary-foreground` | `#ffffff` | `#ffffff` |
| `--primary-hover` | `var(--accent-600)` | `var(--accent-500)` |
| `--secondary` | `var(--neutral-100)` | `var(--neutral-700)` |
| `--secondary-foreground` | `var(--neutral-700)` | `var(--neutral-100)` |
| `--muted` | `var(--neutral-100)` | `var(--neutral-700)` |
| `--muted-foreground` | `var(--neutral-500)` | `var(--neutral-300)` |
| `--accent` | `var(--neutral-100)` | `var(--neutral-700)` |
| `--accent-foreground` | `var(--neutral-700)` | `var(--neutral-100)` |

### 5.3 Sémantiques

| Token | Light | Dark |
|---|---|---|
| `--destructive` | `var(--error-500)` | `var(--error-200)` |
| `--destructive-foreground` | `#ffffff` | `var(--neutral-900)` |
| `--color-success` | `var(--success-500)` | `var(--success-200)` |
| `--color-success-foreground` | `#ffffff` | `var(--neutral-900)` |
| `--color-warning` | `var(--warning-500)` | `var(--warning-200)` |
| `--color-warning-foreground` | `#ffffff` | `var(--neutral-900)` |
| `--color-info` | `var(--info-500)` | `var(--info-200)` |
| `--color-info-foreground` | `#ffffff` | `var(--neutral-900)` |

Les variantes `*-soft` / `*-alpha` / `*-accent` héritées peuvent être recalculées :
- `*-soft` = teinte `-50`
- `*-alpha` = teinte `-200`
- `*-accent` = teinte `-700`

### 5.4 Charts (KPI)

Réassignation domaine → couleur :

| Token | Domain | Light | Dark |
|---|---|---|---|
| `--chart-1` | Budget | `var(--accent-500)` | `var(--accent-400)` |
| `--chart-2` | Qualité | `var(--success-500)` | `var(--success-200)` |
| `--chart-3` | Délai | `var(--info-500)` | `var(--info-200)` |
| `--chart-4` | Risque | `var(--error-500)` | `var(--error-200)` |
| `--chart-5` | Scope | `var(--warning-500)` | `var(--warning-200)` |

### 5.5 Borders, inputs, focus

| Token | Light | Dark |
|---|---|---|
| `--border` | `var(--neutral-200)` | `var(--neutral-700)` |
| `--input` | `var(--neutral-200)` | `var(--neutral-700)` |
| `--ring` | `rgba(238,122,58,.30)` | `rgba(238,122,58,.30)` |
| `--radius` | `0.5rem` (= 8px) | idem |

### 5.6 Tokens supprimés (clean removal)

```
--gradient-brand
--gradient-brand-subtle
--accent-brand
--accent-brand-foreground
--accent-brand-hover
--accent-brand-light
--color-1 .. --color-5  (rainbow button)
```

Si un composant `ui/` consomme un de ces tokens, le build échouera. Cas connu à ce jour : `rainbow-button.tsx` (à vérifier en exécution). En cas d'échec, on documente le composant cassé et on le marque comme `@deprecated` — il sera supprimé en Phase 5 ou réécrit en Phase 2.

### 5.7 Tokens nouveaux ajoutés (utilisés par futur shell)

L'intégralité de `design/project/colors_and_type.css` est inlinée :
- `--brand-50` → `--brand-950` (12 nuances)
- `--accent-50` → `--accent-950` (12 nuances)
- `--neutral-0` → `--neutral-900` (10 nuances)
- `--space-0_5` → `--space-24` (12 valeurs)
- `--radius-xs` → `--radius-full` (5 valeurs)
- `--elevation-0` → `--elevation-xl` + `--shadow-accent` (6 valeurs)
- `--duration-fast` → `--duration-slower` (4 valeurs)
- `--ease-out` / `--ease-in-out` / `--ease-in`
- `--container-max`, `--sidebar-width`, `--toolbar-height`
- `--font-display` (Montserrat), `--font-body` (Inter)

## 6. Fonts

### 6.1 Montserrat — self-hosted

**Source** : `design/project/fonts/Montserrat-{Thin..Black}{,Italic}.ttf` (16 fichiers)
**Destination** : `apps/webapp/public/fonts/montserrat/` (chemin résolu par Vite à `/fonts/montserrat/...` au runtime)

`@font-face` × 16 dans `globals.css`, `font-display: swap`, poids 100 → 900 + italics, exactement comme `colors_and_type.css`.

### 6.2 Inter — Google Fonts CDN

`@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");`

Conservé tel quel ; pas de self-host à ce stade (pas d'asset Inter fourni dans `design/project/fonts/`).

### 6.3 Variables font

```css
--font-display: "Montserrat", "Segoe UI", system-ui, -apple-system, sans-serif;
--font-body:    "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
```

Et exposition Tailwind v4 :

```css
@theme {
  --font-display: "Montserrat", "Segoe UI", system-ui, sans-serif;
  --font-body:    "Inter", "Segoe UI", system-ui, sans-serif;
}
```

→ utilisable comme `font-display` et `font-body` dans les classes Tailwind.

### 6.4 Body defaults

```css
body {
  font-family: var(--font-body);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## 7. Tailwind v4 `@theme` block

Bloc `@theme inline` minimaliste qui expose les tokens existants comme classes utilitaires. Conserve la structure shadcn (afin que les composants existants `bg-primary`, `text-foreground`, etc. continuent de fonctionner) :

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  --color-info: var(--color-info);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-display: "Montserrat", "Segoe UI", system-ui, sans-serif;
  --font-sans:    "Inter", "Segoe UI", system-ui, sans-serif;
}
```

Les nouveaux tokens (`--brand-*`, `--accent-*`, `--neutral-*`) sont définis dans `:root` mais **pas exposés dans `@theme`** en Phase 1 — ils servent de socle pour Phase 2. Si un composant existant veut y accéder, il utilise `var(--brand-700)` directement.

## 8. Dark mode

### 8.1 CSS

Bloc `.dark { ... }` réécrit selon `colors_and_type.css` :

```css
.dark {
  --background: var(--neutral-900);
  --foreground: var(--neutral-50);
  --card: var(--neutral-800);
  /* ... etc, voir 5.1-5.5 */
  color-scheme: dark;
}
```

### 8.2 Toggle UI

`apps/webapp/src/components/theme-toggle/index.tsx` — composant standalone :

```tsx
'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Basculer le thème"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
```

### 8.3 Insertion dans layout-6

`layout-6/components/toolbar.tsx` — ajout du `<ThemeToggle />` à droite de l'existant. Pattern reproduit depuis `layout-19/components/header-toolbar.tsx`.

`next-themes` est déjà wiré dans `App.tsx` (Provider), donc rien d'autre à plumber.

## 9. Wordmark / branding

### 9.1 Composant Logo

`apps/webapp/src/components/logo/index.tsx` :

```tsx
import { cn } from '@/lib/utils';

interface LogoProps { className?: string; }

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 font-display font-extrabold text-[22px] leading-none tracking-[-0.01em] select-none', className)}>
      <span className="text-foreground dark:text-white">Simex</span>
      <span className="size-2 rounded-full bg-primary" aria-hidden />
      <span className="text-primary">pro</span>
    </div>
  );
}
```

Pas d'asset SVG en Phase 1. La typographie + le dot orange suffisent. Un asset SVG pourra remplacer ce composant en Phase 5 sans rupture d'API.

### 9.2 Helmet & document title

- `apps/webapp/index.html` : `<title>Simex pro</title>`, `<html lang="fr">`, `<meta name="description">`
- `apps/webapp/src/components/layouts/layout-6/index.tsx` : `<title>Simex pro — Tableau de bord</title>` (au lieu de `Sim360 - Dashboard`)
- Tous les `<Helmet>` dans `features/` qui mentionnent `Sim360` → `Simex pro`

## 10. Validation

### 10.1 Build & types

```bash
pnpm --filter @sim360/webapp lint
pnpm --filter @sim360/webapp typecheck
pnpm --filter @sim360/webapp build
```

Les trois doivent passer sans warning nouveau (sauf le `rainbow-button` documenté en 5.6).

### 10.2 Runtime smoke test (manuel)

Démarrer `pnpm --filter @sim360/webapp dev`, puis :
1. Page de login s'affiche avec le wordmark Simex pro et la palette orange/blue
2. Login fonctionne, dashboard charge
3. Naviguer : `/simulations` → ouvrir une simulation → onglet Meeting → un livrable
4. Toggle theme dans la toolbar :
   - Clic → `<html>` reçoit la classe `dark`
   - Sidebar, cards, textes basculent en mode sombre cohérent
   - Recharger → la préférence est conservée
5. Inspecter via DevTools : aucune occurrence du violet `#4b2f95` ou coral `#d4836a` dans le DOM rendu (rechercher dans Computed styles)
6. Inspecter polices : titres en Montserrat, body en Inter (DevTools → Computed → font-family)

### 10.3 Visual regression (optionnel)

Si Chromatic / Storybook configuré, snapshot avant/après pour les composants `ui/` clés (Button, Card, Input, Badge, Alert).

## 11. Risques connus

### 11.1 Brand UI temporairement déséquilibrée

Les composants existants ont été conçus avec `--primary` violet en couleur dominante. En basculant `--primary` sur orange, des écrans peuvent paraître chargés (8 boutons primaires sur un dashboard → tout orange). C'est **attendu** ; corrigé en Phase 5 quand on rationalise les CTA selon le DS (Linear-style : un seul CTA primaire par écran).

### 11.2 Composants legacy cassés

`rainbow-button.tsx` consomme `--color-1` à `--color-5` (supprimés). Action : le marquer `@deprecated`, l'isoler dans le code, l'exclure du build d'app si nécessaire. Liste à compléter à l'exécution de Phase 1.

### 11.3 Charts existants

Les charts du dashboard utilisent `--chart-1..5`. Les couleurs changent (violet → orange pour Budget). Documents pédagogiques (briefings, captures d'écran) qui réfèrent à l'ancien code couleur deviennent obsolètes. Hors scope Phase 1.

### 11.4 Inter chargée depuis Google Fonts CDN

CDN externe = dépendance réseau au premier chargement, échec possible offline. Acceptable en Phase 1 ; self-host d'Inter pourra être ajouté en Phase 2 si nécessaire (récupérer les fichiers depuis google-webfonts-helper).

## 12. Order of operations

L'ordre suivant minimise les états cassés intermédiaires :

1. Copier les `.ttf` Montserrat dans `public/fonts/montserrat/`
2. Réécrire `globals.css` (tokens + `@font-face` + `@theme` + dark)
3. Créer `<Logo>` et `<ThemeToggle>`
4. Modifier `layout-6/components/toolbar.tsx` pour insérer `<ThemeToggle>`
5. Mettre à jour `index.html` + tous les `<Helmet>`
6. `pnpm typecheck` + `lint` + `build`
7. Smoke test runtime

## 13. Out of spec

Sera traité en **Phase 2** (nouveau shell) :
- Composant `<Logo>` peut être réutilisé tel quel
- Composant `<ThemeToggle>` peut être réutilisé ou remplacé par un Switch dans la nouvelle topbar
- Variable d'env `VITE_SIMEX_DEMO_CONTROLS` pour les toggles de démo
- Mode `system` du theme (déjà supporté par next-themes, juste pas exposé en UI Phase 1)
- Toggle content-mode (Fluide / Centré 1080)
- Settings page utilisateur

---

## Appendix A — Mapping condensé pour quick-reference

```
Old token                   →  New value
─────────────────────────      ──────────────────
--primary (violet)          →  var(--accent-500)  [orange CTA]
--primary-hover             →  var(--accent-600)
--accent-brand (coral)      →  var(--accent-500)  [fusion]
--secondary, --muted, --accent →  var(--neutral-100)
--destructive               →  var(--error-500)
--color-success             →  var(--success-500)
--color-warning             →  var(--warning-500)
--color-info                →  var(--info-500)
--border, --input           →  var(--neutral-200)
--ring                      →  rgba(238,122,58,.30)
--radius                    →  0.5rem
--background                →  var(--neutral-50)
--card, --popover           →  #fff
--foreground                →  var(--neutral-900)
--chart-1 Budget            →  var(--accent-500)
--chart-2 Qualité           →  var(--success-500)
--chart-3 Délai             →  var(--info-500)
--chart-4 Risque            →  var(--error-500)
--chart-5 Scope             →  var(--warning-500)
--gradient-brand            →  [removed]
--color-1..5 rainbow        →  [removed]
```
