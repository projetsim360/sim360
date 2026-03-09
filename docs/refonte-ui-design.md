# ProjectSim360 — Refonte UI Design System

> **Version** : 1.0
> **Date** : 2026-03-09
> **Objectif** : Transformer l'identite visuelle de la plateforme avec une palette derivee de `#4b2f95` (violet profond) et `#f14f1a` (orange vif), unifier les interfaces, et atteindre un niveau de finition digne d'une licorne.

---

## Table des matieres

1. [Audit visuel actuel](#1-audit-visuel-actuel)
2. [Nouvelle identite de marque](#2-nouvelle-identite-de-marque)
3. [Palette de couleurs complete](#3-palette-de-couleurs-complete)
4. [Migration des CSS variables](#4-migration-des-css-variables)
5. [Corrections d'uniformite](#5-corrections-duniformite)
6. [Audit et harmonisation des icones](#6-audit-et-harmonisation-des-icones)
7. [Refonte des cartes KPI](#7-refonte-des-cartes-kpi)
8. [Amelioration des pages cles](#8-amelioration-des-pages-cles)
9. [Composants a enrichir](#9-composants-a-enrichir)
10. [Micro-details premium](#10-micro-details-premium)
11. [Plan d'implementation](#11-plan-dimplementation)
12. [Inventaire des fichiers](#12-inventaire-des-fichiers)

---

## 1. Audit visuel actuel

### 1.1 Etat des lieux

| Aspect | Etat actuel | Score |
|--------|-------------|-------|
| Palette de couleurs | Indigo generique (#6366f1), sans identite forte | 5/10 |
| Uniformite des couleurs | Hardcoded dans 4+ pages (simulations-list, debriefing, etc.) | 6/10 |
| Coherence des icones | 85% KeenIcon duotone, 2 pages avec Lucide, meetings inconsistant | 7/10 |
| Hierarchie typographique | Pas de standard clair h1/h2/h3 entre pages | 6/10 |
| Finition des composants | Cards propres mais sans polish premium | 7/10 |
| Identite de marque | Aucune — indigo standard, pas de personnalite | 3/10 |
| Dark mode | Fonctionnel mais fade (slate generique) | 6/10 |
| **Score global** | | **5.7/10** |

### 1.2 Problemes identifies

**P1 — Aucune identite de marque**
La couleur primaire `indigo-500` (#6366f1) est la couleur par defaut de Tailwind. Rien ne distingue ProjectSim360 d'une app generique. Il n'y a pas de gradient signature, pas de couleur accent memorable, pas de personnalite visuelle.

**P2 — Couleurs hardcodees dans le code**
Plusieurs pages contournent le design system avec des couleurs Tailwind directes :
- `simulations-list.tsx` : `bg-gray-100`, `bg-blue-100`, `bg-green-500`, `bg-yellow-500`, `bg-red-500`
- `debriefing-page.tsx` : `text-green-600`, `text-yellow-600`, `text-blue-600`, `text-gray-900`
- `simulation-detail.tsx` (kpiColor) : `bg-green-500`, `bg-yellow-500`, `bg-red-500`
- Divers : `text-gray-*` au lieu de `text-foreground` / `text-muted-foreground`

**P3 — Icones inconsistantes**
- Meetings : `people` dans le menu, `message-text` dans le contenu
- 1 page (`profile-import-step.tsx`) utilise Lucide (`Upload`, `ArrowRight`) au lieu de KeenIcon
- Pas de convention claire : duotone partout (70%), pas de hierarchie visuelle par style d'icone
- Tailles d'icones variables sans standard (size-3 a size-8)

**P4 — Cartes KPI banales**
Les cartes KPI de simulation sont fonctionnelles mais plates. Pas de gradient, pas d'elevation, pas de micro-animation. Elles ne transmettent pas l'urgence ni l'importance des metriques.

**P5 — Loading states mixtes**
Mix de spinners generiques (`animate-spin rounded-full`) et de Skeleton sur differentes pages. Pas d'uniformite.

**P6 — Manque de finition premium**
- Pas de gradient signature dans les headers ou cards hero
- Pas de hover states enrichis (scale, shadow elevation)
- Pas de bordures subtiles avec gradient
- Sidebar sans personnalite visuelle (blanc plat)

---

## 2. Nouvelle identite de marque

### 2.1 Philosophie

ProjectSim360 simule la gestion de projet. La marque doit transmettre :
- **Autorite & expertise** → Violet profond (#4b2f95) — confiance, leadership, premium
- **Energie & action** → Orange vif (#f14f1a) — dynamisme, urgence, CTA fort
- **Intelligence** → Gradient violet→orange — transition entre reflexion et action

### 2.2 Couleurs fondatrices

| Role | Hex | Nom | Usage |
|------|-----|-----|-------|
| **Primary** | `#4b2f95` | Violet ProjectSim | Sidebar, headers, navigation, badges, focus rings |
| **Accent** | `#f14f1a` | Orange Energie | CTA principaux, badges urgents, notifications, hover states |
| **Gradient signature** | `#4b2f95 → #f14f1a` | Gradient ProjectSim | Hero sections, cards premium, barre de progression, onboarding |

### 2.3 Pourquoi ces couleurs ?

- **#4b2f95** (Violet profond) : Proche du violet PMI, evoque la maitrise et le professionnalisme. Plus profond et distinctif que l'indigo generique.
- **#f14f1a** (Orange vif) : Couleur d'action et d'urgence. Parfait contraste avec le violet. Attire l'oeil pour les CTA et les elements importants.
- **Combinaison** : Le duo violet/orange est rare dans le SaaS, ce qui rend la marque immediatement reconnaissable. C'est un contraste complementaire fort (couleurs opposees sur le cercle chromatique).

---

## 3. Palette de couleurs complete

### 3.1 Violet Primary — Derivee de #4b2f95

```
violet-50:  #f3f0fa   — Fond subtil, hover cards
violet-100: #e4dcf4   — Fond sections, badges light
violet-200: #c9b8e9   — Bordures actives, rings
violet-300: #a88ddb   — Texte secondaire sur fond sombre
violet-400: #7d5cbf   — Texte hover, icones actives
violet-500: #4b2f95   — PRIMAIRE — boutons, sidebar active, headings
violet-600: #3d2679   — Hover boutons primaires
violet-700: #301d60   — Pressed state, sidebar fond
violet-800: #241548   — Fond sombre premium
violet-900: #190e33   — Dark mode fond
violet-950: #0f081f   — Dark mode profond
```

### 3.2 Orange Accent — Derivee de #f14f1a

```
orange-50:  #fff4f0   — Fond notifications, alertes douces
orange-100: #ffe3d9   — Badge light, hover fond
orange-200: #ffc4ad   — Bordures accent
orange-300: #ff9e7a   — Icones accent
orange-400: #f67648   — Texte accent hover
orange-500: #f14f1a   — ACCENT — CTA, badges urgents, notifications
orange-600: #d1400f   — Hover CTA
orange-700: #ae3409   — Pressed CTA
orange-800: #8a2a08   — Dark accent
orange-900: #6b2208   — Dark mode accent
orange-950: #3d1203   — Dark mode accent profond
```

### 3.3 Palette semantique

Les couleurs semantiques restent basees sur les conventions universelles :

| Role | Couleur | Hex | Inchangee |
|------|---------|-----|-----------|
| Success | Emerald | #10b981 | Oui |
| Warning | Amber | #f59e0b | Oui |
| Destructive | Red | #ef4444 | Oui |
| Info | **Violet-400** | #7d5cbf | **Change** (etait blue-500) |

> **Info passe au violet** pour renforcer l'identite de marque dans les messages informatifs.

### 3.4 Neutrals

Les gris restent en Slate mais le dark mode utilise les teintes violet :

| Mode | Background | Card | Borders |
|------|-----------|------|---------|
| Light | slate-50 (#f8fafc) | white | slate-200 (#e2e8f0) |
| Dark | **violet-950** (#0f081f) | **violet-900** (#190e33) | **violet-800/50** |

> Le dark mode prend une teinte violette subtile au lieu du gris standard, renfor\u00e7ant l'identite de marque.

### 3.5 Couleurs des charts KPI

| KPI | Couleur | Hex | Raison |
|-----|---------|-----|--------|
| Budget | Violet-500 | #4b2f95 | Primaire = metrique principale |
| Delai | Orange-500 | #f14f1a | Accent = urgence temporelle |
| Qualite | Emerald-500 | #10b981 | Vert = qualite positive |
| Moral equipe | Amber-500 | #f59e0b | Ambre = moral/humain |
| Risque | Red-500 | #ef4444 | Rouge = danger/risque |

---

## 4. Migration des CSS variables

### 4.1 Fichier : `apps/webapp/src/styles/globals.css`

#### Light mode (`:root`)

```css
/* Avant */
--primary: var(--color-indigo-500);
--primary-foreground: var(--color-white);
--ring: var(--color-indigo-500);

/* Apres */
--primary: #4b2f95;
--primary-foreground: #ffffff;
--primary-light: #f3f0fa;    /* violet-50 — pour bg-primary/10 equivalent */
--primary-hover: #3d2679;    /* violet-600 */
--accent-brand: #f14f1a;     /* orange CTA */
--accent-brand-foreground: #ffffff;
--accent-brand-hover: #d1400f;
--accent-brand-light: #fff4f0;
--ring: #4b2f95;

/* Info devient violet */
--color-info: #7d5cbf;       /* violet-400 */
--color-info-soft: #f3f0fa;  /* violet-50 */
--color-info-alpha: #c9b8e9; /* violet-200 */
--color-info-accent: #3d2679;/* violet-600 */

/* Charts */
--chart-1: #4b2f95;  /* Budget → violet */
--chart-2: #10b981;  /* Qualite → emerald */
--chart-3: #f14f1a;  /* Delai → orange */
--chart-4: #ef4444;  /* Risque → red */
--chart-5: #f59e0b;  /* Moral → amber */
```

#### Dark mode (`.dark`)

```css
/* Avant */
--background: var(--color-slate-900);
--card: var(--color-slate-800);
--border: var(--color-slate-700);

/* Apres — teinte violette subtile */
--background: #0f081f;       /* violet-950 */
--card: #190e33;             /* violet-900 */
--card-foreground: #e4dcf4;  /* violet-100 */
--popover: #190e33;
--popover-foreground: #e4dcf4;
--border: rgba(36, 21, 72, 0.5); /* violet-800/50 */
--input: rgba(36, 21, 72, 0.5);
--muted: #241548;            /* violet-800 */
--muted-foreground: #a88ddb; /* violet-300 */
--accent: #241548;
--accent-foreground: #e4dcf4;
--primary: #7d5cbf;          /* violet-400 — plus clair en dark */
--ring: #7d5cbf;

/* Charts dark */
--chart-1: #7d5cbf;  /* Budget → violet clair */
--chart-2: #34d399;  /* Qualite → emerald-400 */
--chart-3: #f67648;  /* Delai → orange-400 */
--chart-4: #f87171;  /* Risque → red-400 */
--chart-5: #fbbf24;  /* Moral → amber-400 */
```

### 4.2 Variables CSS supplementaires a ajouter

```css
:root {
  /* Gradient signature */
  --gradient-brand: linear-gradient(135deg, #4b2f95, #f14f1a);
  --gradient-brand-subtle: linear-gradient(135deg, #f3f0fa, #fff4f0);
  --gradient-brand-dark: linear-gradient(135deg, #301d60, #ae3409);

  /* Sidebar */
  --sidebar-bg: #4b2f95;
  --sidebar-bg-dark: #190e33;
  --sidebar-text: rgba(255, 255, 255, 0.85);
  --sidebar-text-active: #ffffff;
  --sidebar-accent: #f14f1a;
  --sidebar-hover: rgba(255, 255, 255, 0.1);
}
```

### 4.3 Classes utilitaires Tailwind a ajouter

Ajouter dans `globals.css` via `@theme inline` :

```css
@theme inline {
  --color-brand: #4b2f95;
  --color-brand-50: #f3f0fa;
  --color-brand-100: #e4dcf4;
  --color-brand-200: #c9b8e9;
  --color-brand-300: #a88ddb;
  --color-brand-400: #7d5cbf;
  --color-brand-500: #4b2f95;
  --color-brand-600: #3d2679;
  --color-brand-700: #301d60;
  --color-brand-800: #241548;
  --color-brand-900: #190e33;
  --color-brand-950: #0f081f;

  --color-accent-brand: #f14f1a;
  --color-accent-brand-50: #fff4f0;
  --color-accent-brand-100: #ffe3d9;
  --color-accent-brand-200: #ffc4ad;
  --color-accent-brand-300: #ff9e7a;
  --color-accent-brand-400: #f67648;
  --color-accent-brand-500: #f14f1a;
  --color-accent-brand-600: #d1400f;
  --color-accent-brand-700: #ae3409;
  --color-accent-brand-800: #8a2a08;
  --color-accent-brand-900: #6b2208;
  --color-accent-brand-950: #3d1203;
}
```

---

## 5. Corrections d'uniformite

### 5.1 Couleurs hardcodees a migrer

#### `simulations-list.tsx`

```typescript
// AVANT — hardcoded
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  ABANDONED: 'bg-red-100 text-red-700',
};
function kpiColor(value: number): string {
  if (value > 70) return 'bg-green-500';
  if (value >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// APRES — Badge component + theme
// Remplacer les <span className={STATUS_COLORS[status]}> par :
<Badge variant={STATUS_VARIANT[status]} appearance="light" size="sm">

// Remplacer kpiColor par :
function kpiColor(value: number): string {
  if (value > 70) return 'bg-success';
  if (value >= 40) return 'bg-warning';
  return 'bg-destructive';
}
```

#### `debriefing-page.tsx`

```typescript
// AVANT — hardcoded
className="text-green-600"   → className="text-success"
className="text-yellow-600"  → className="text-warning"
className="text-blue-600"    → className="text-primary"
className="text-gray-900"    → className="text-foreground"
```

#### Tous les fichiers — migration `text-gray-*`

| Avant | Apres |
|-------|-------|
| `text-gray-900` | `text-foreground` |
| `text-gray-700` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground/70` |
| `bg-gray-50` | `bg-background` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-200` | `bg-accent` |
| `border-gray-200` | `border-border` |
| `border-gray-300` | `border-border` |

### 5.2 Constantes de couleurs partagees

Creer un fichier de mapping centralise :

**Fichier** : `apps/webapp/src/config/theme.constants.ts` (nouveau)

```typescript
import type { BadgeVariant } from '@/components/ui/badge';

export const STATUS_VARIANT: Record<string, BadgeVariant> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  ACTIVE: 'primary',
  COMPLETED: 'success',
  PAUSED: 'warning',
  ABANDONED: 'destructive',
  CLOSED: 'secondary',
  ARCHIVED: 'secondary',
  PENDING: 'warning',
  PROFILING: 'info',
  SUBMITTED: 'info',
  EVALUATED: 'primary',
  VALIDATED: 'success',
  REJECTED: 'destructive',
  RESPONDED: 'success',
} as const;

export const KPI_LEVEL = {
  high: { bg: 'bg-success', text: 'text-success', label: 'Bon' },
  medium: { bg: 'bg-warning', text: 'text-warning', label: 'Attention' },
  low: { bg: 'bg-destructive', text: 'text-destructive', label: 'Critique' },
} as const;

export function getKpiLevel(value: number) {
  if (value > 70) return KPI_LEVEL.high;
  if (value >= 40) return KPI_LEVEL.medium;
  return KPI_LEVEL.low;
}

export const CULTURE_LABELS: Record<string, { label: string; description: string }> = {
  AGILE: {
    label: 'Agile',
    description: 'Environnement flexible, iterations rapides, retrospectives frequentes.',
  },
  STRICT: {
    label: 'Strict',
    description: 'Processus formel, documentation rigoureuse, validation hierarchique.',
  },
  COLLABORATIVE: {
    label: 'Collaboratif',
    description: 'Travail en equipe, consensus, communication ouverte.',
  },
};
```

---

## 6. Audit et harmonisation des icones

### 6.1 Standard de style par contexte

| Contexte | Style KeenIcon | Quand |
|----------|---------------|-------|
| **Navigation (sidebar, menus)** | `duotone` | Toujours |
| **En-tetes de sections** | `duotone` | Toujours |
| **Boutons d'action primaires** | `solid` | CTA, actions importantes |
| **Indicateurs de statut** | `filled` | Succes, erreur, alerte |
| **Decoratif (cards hero, empty states)** | `duotone` | Illustrations grandes |

### 6.2 Mapping icones definitif par concept

| Concept | Icone | Style recommande | Taille |
|---------|-------|-----------------|--------|
| Dashboard | `category` | duotone | size-4 |
| Simulations | `rocket` | duotone | size-4 |
| Decisions | `question-2` | duotone (nav) / filled (badge) | size-4 |
| Evenements | `flash` | duotone (nav) / filled (badge) | size-4 |
| **Reunions** | `message-text` | duotone | size-4 |
| Emails | `sms` | duotone | size-4 |
| Livrables | `document` | duotone | size-4 |
| Agent PMO | `robot` | duotone | size-4 |
| Intranet | `book-open` | duotone | size-4 |
| KPI / Historique | `graph-up` | duotone | size-4 |
| Timeline | `time` | duotone | size-4 |
| Recrutement | `briefcase` | duotone | size-4 |
| Valorisation | `award` | duotone (nav) / solid (badge) | size-4 |
| Portfolio | `briefcase` | duotone | size-4 |
| Debriefing | `abstract-26` | duotone | size-4 |
| Badges | `award` | solid | size-4 |
| Profil | `profile-circle` | duotone | size-4 |
| Parametres | `setting-2` | duotone | size-4 |
| Admin Templates | `clipboard` | duotone | size-4 |
| Admin Documents | `notepad` | duotone | size-4 |
| IA / AI Usage | `artificial-intelligence` | duotone | size-4 |

### 6.3 Corrections a faire

| Page | Probleme | Correction |
|------|----------|------------|
| Menu sidebar (reunions) | `people` | → `message-text` |
| `profile-import-step.tsx` | Lucide `Upload` | → KeenIcon `file-up` duotone |
| `profile-import-step.tsx` | Lucide `ArrowRight` | → KeenIcon `arrow-right` solid |
| Divers sections "Reunions" | Mix `people` / `message-text` | Standardiser `message-text` partout |
| Dashboard activite | Icones manquantes par type | Ajouter mapping type → icone |

### 6.4 Standardisation des tailles

| Contexte | Taille | Equivalent |
|----------|--------|------------|
| Navigation sidebar | `size-4` | 16px / 1rem |
| En-tete de section dans card | `size-4` | 16px / 1rem |
| Icone dans badge ou bouton | `size-3.5` | 14px |
| Icone decorative (empty state) | `size-8` | 32px / 2rem |
| Icone hero (page 404, welcome) | `size-12` | 48px / 3rem |
| Icone dans circle-icon bg | `size-5` | 20px / 1.25rem |

---

## 7. Refonte des cartes KPI

### 7.1 Etat actuel

Les cartes KPI dans `simulation-detail.tsx` sont des `Card` simples avec une barre de progression. Fonctionnel mais plat.

### 7.2 Nouveau design

Chaque carte KPI doit transmettre son importance visuellement :

```
┌──────────────────────────────────┐
│  ┌────┐                         │
│  │ 💰 │  Budget                 │
│  └────┘  72%                    │
│  ████████████████░░░░  72/100   │
│  ▲ +3 depuis derniere phase     │
└──────────────────────────────────┘
```

**Ameliorations** :
1. **Icone dans un cercle colore** au lieu d'un simple texte
2. **Valeur en grand** (text-2xl font-bold) au lieu de text-sm
3. **Barre de progression avec gradient** (vert→jaune→rouge selon valeur)
4. **Indicateur de tendance** : fleche haut/bas avec delta depuis la derniere phase
5. **Hover state** : elevation legere (shadow-md → shadow-lg) + scale 1.02

### 7.3 Pattern de couleur par KPI

```typescript
const KPI_THEME = {
  budget: {
    icon: 'dollar',
    label: 'Budget',
    bg: 'bg-primary/10',
    iconBg: 'bg-primary/20',
    text: 'text-primary',
    bar: 'bg-primary',
  },
  schedule: {
    icon: 'time',
    label: 'Delai',
    bg: 'bg-accent-brand/10',     // orange
    iconBg: 'bg-accent-brand/20',
    text: 'text-accent-brand',
    bar: 'bg-accent-brand',
  },
  quality: {
    icon: 'medal-star',
    label: 'Qualite',
    bg: 'bg-success/10',
    iconBg: 'bg-success/20',
    text: 'text-success',
    bar: 'bg-success',
  },
  teamMorale: {
    icon: 'people',
    label: 'Moral',
    bg: 'bg-warning/10',
    iconBg: 'bg-warning/20',
    text: 'text-warning',
    bar: 'bg-warning',
  },
  riskLevel: {
    icon: 'shield-cross',
    label: 'Risque',
    bg: 'bg-destructive/10',
    iconBg: 'bg-destructive/20',
    text: 'text-destructive',
    bar: 'bg-destructive',
  },
};
```

---

## 8. Amelioration des pages cles

### 8.1 Sidebar — Identite forte

**Etat actuel** : Fond blanc/slate, texte sombre, aucune personnalite.

**Nouveau design** :
- **Fond** : Gradient vertical `#4b2f95 → #301d60` (violet profond)
- **Texte** : Blanc 85% opacite, blanc 100% pour l'item actif
- **Item actif** : Fond `rgba(255,255,255,0.15)` + bordure gauche orange `#f14f1a` (3px)
- **Item hover** : Fond `rgba(255,255,255,0.08)`
- **Logo** : Zone en haut avec fond `rgba(255,255,255,0.1)`, logo blanc
- **Badges compteur** : Fond orange `#f14f1a`, texte blanc
- **Separateurs** : `rgba(255,255,255,0.1)` au lieu de border-border
- **Dark mode** : Fond `#0f081f → #190e33`, meme logique

**Fichier** : `apps/webapp/src/components/layouts/layout-6/components/sidebar-menu-primary.tsx`
**Fichier** : `apps/webapp/src/styles/globals.css` (variables sidebar)

### 8.2 Dashboard — Hero section

**Ajouter un hero band** en haut du dashboard :

```
┌──────────────────────────────────────────────────────────┐
│  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱  GRADIENT  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱  │
│  Bonjour Marie !                                         │
│  Voici votre espace de gestion de projet.                │
│  [Progression globale: ████████░░ 73%]                   │
└──────────────────────────────────────────────────────────┘
```

- Fond : gradient brand subtil (`--gradient-brand-subtle`)
- Bordure gauche : 4px gradient vertical `#4b2f95 → #f14f1a`
- Texte : `text-foreground` pour le nom, `text-muted-foreground` pour le sous-titre

### 8.3 Simulation Detail — Phase stepper ameliore

Le stepper de phases actuel (dots) doit devenir plus expressif :

```
  [Initiation]───[Planning]───[Execution]───[Monitoring]───[Cloture]
      ✅             ✅           🔵              ⬜            ⬜
```

- Etape completee : Cercle violet plein avec check blanc
- Etape active : Cercle avec bordure orange pulsante + fill orange
- Etape a venir : Cercle gris (muted) avec numero
- Ligne de connexion : Violette si completee, grise si a venir
- Labels sous chaque cercle

### 8.4 Campagne Detail — Stepper + dashboard stats

Les stats cards du dashboard campagne doivent utiliser des icones dans des cercles colores :

| Stat | Icone | Couleur fond | Couleur icone |
|------|-------|-------------|---------------|
| Total candidats | `people` | `bg-primary/10` | `text-primary` |
| En attente | `time` | `bg-warning/10` | `text-warning` |
| En cours | `loading` | `bg-info/10` | `text-info` |
| Termines | `check-circle` | `bg-success/10` | `text-success` |
| Abandonnes | `cross-circle` | `bg-destructive/10` | `text-destructive` |
| Score moyen | `medal-star` | `bg-primary/10` | `text-primary` |

### 8.5 Candidate Report — Score circles premium

Les cercles de score (hardSkills, softSkills, etc.) doivent utiliser des SVG circulaires avec animation :

- Progression animee au chargement (0 → valeur reelle en 1s, easeOut)
- Gradient sur le cercle (`stroke: url(#gradient-brand)`)
- Valeur en gras au centre
- Label en `text-muted-foreground` dessous

### 8.6 Page de connexion / Landing

La landing page et les pages d'auth doivent refleter la nouvelle identite :

- **Landing** : Hero avec gradient `#4b2f95 → #f14f1a`, texte blanc, CTA orange
- **Login/Register** : Card centree avec gradient subtil en bordure superieure
- **Fond** : Pattern geometrique subtil avec le violet en background

### 8.7 Join Campaign (page publique)

Cette page est la premiere impression pour les candidats externes :

- Header avec gradient brand
- Company name en badge violet
- CTA "Commencer l'evaluation" en orange vif (`bg-accent-brand`)
- Info cards avec bordure superieure gradient

---

## 9. Composants a enrichir

### 9.1 Bouton — Nouveau variant `accent`

Ajouter un variant de bouton pour les CTA secondaires :

```typescript
// button.tsx — nouveau variant
accent: 'bg-accent-brand text-accent-brand-foreground shadow-xs hover:bg-accent-brand-hover',
```

Usage : "Commencer", "Lancer", "Generer", "Publier" — toutes les actions d'impulsion.

### 9.2 Bouton — Nouveau variant `gradient`

```typescript
gradient: 'bg-gradient-to-r from-[#4b2f95] to-[#f14f1a] text-white shadow-md hover:shadow-lg hover:opacity-95',
```

Usage : Hero CTA, onboarding, landing page.

### 9.3 Card — Variant `premium`

```typescript
premium: 'bg-card border-0 shadow-md hover:shadow-lg transition-shadow duration-200 ring-1 ring-border/50',
```

Ajouter un hover state avec elevation pour les cards cliquables (simulation cards, campaign cards).

### 9.4 Badge — Variant accent

```typescript
accent: 'bg-accent-brand text-accent-brand-foreground',
// + appearance light :
accent + light: 'bg-accent-brand-light text-accent-brand border-accent-brand/20',
```

### 9.5 Progress bar avec gradient

Creer une variante de barre de progression qui utilise le gradient brand :

```typescript
// Quand la valeur globale de progression est affichee
<div className="h-2 rounded-full bg-muted overflow-hidden">
  <div
    className="h-full rounded-full bg-gradient-to-r from-[#4b2f95] to-[#f14f1a]"
    style={{ width: `${percent}%` }}
  />
</div>
```

Usage : Getting Started progress, progression globale, onboarding wizard.

### 9.6 Stat Card standardise

Creer un composant reutilisable pour les cartes statistiques :

```typescript
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' };
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'accent';
}
```

Utilise dans : Dashboard stats, Campaign dashboard, Simulation KPIs.

---

## 10. Micro-details premium

### 10.1 Hover states enrichis

Toutes les cards cliquables (simulations, campagnes, livrables) :
- `transition-all duration-200`
- Hover : `shadow-md` → `shadow-lg`, `scale-[1.01]`, bordure plus visible
- Active : `scale-[0.99]`

### 10.2 Gradient accent sur les bordures

Pour les sections importantes (Getting Started, Next Step, Hero) :
```css
.gradient-border-top {
  border-top: 3px solid;
  border-image: linear-gradient(90deg, #4b2f95, #f14f1a) 1;
}
```

### 10.3 Animations d'entree

Les stat cards du dashboard doivent entrer avec un stagger :
```typescript
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

### 10.4 Focus states

Tous les focus rings passent au violet :
```css
--ring: #4b2f95;
```
Les inputs en focus ont un ring `#4b2f95` a 30% opacite au lieu de indigo.

### 10.5 Selection text

```css
::selection {
  background-color: rgba(75, 47, 149, 0.2);
  color: inherit;
}
```

### 10.6 Scrollbar stylisee

```css
::-webkit-scrollbar-thumb {
  background-color: rgba(75, 47, 149, 0.3);
}
.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(125, 92, 191, 0.3);
}
```

### 10.7 Favicon et titre

- Mettre a jour le favicon avec un logo utilisant le violet `#4b2f95`
- Title : "ProjectSim360 — Simulation de Gestion de Projet"

---

## 11. Plan d'implementation

### Phase A — Identite de marque (priorite haute)

| # | Tache | Fichiers | Impact |
|---|-------|----------|--------|
| A.1 | Migrer les CSS variables primaires | `globals.css` | Toute l'app change de couleur |
| A.2 | Ajouter les variables brand/accent-brand | `globals.css` (@theme inline) | Nouvelles classes Tailwind |
| A.3 | Migrer le dark mode vers teintes violettes | `globals.css` (.dark) | Dark mode premium |
| A.4 | Sidebar fond violet + texte blanc | `sidebar-menu-primary.tsx`, `sidebar.tsx`, CSS | Navigation identitaire |
| A.5 | Ajouter variant bouton `accent` + `gradient` | `button.tsx` | Nouveaux CTA |
| A.6 | Ajouter variant badge `accent` | `badge.tsx` | Badges orange |
| A.7 | Creer `theme.constants.ts` | Nouveau fichier | Constantes partagees |

### Phase B — Uniformite (priorite haute)

| # | Tache | Fichiers | Impact |
|---|-------|----------|--------|
| B.1 | Migrer couleurs hardcodees `simulations-list.tsx` | `simulations-list.tsx` | Consistency |
| B.2 | Migrer couleurs hardcodees `debriefing-page.tsx` | `debriefing-page.tsx` | Consistency |
| B.3 | Remplacer `text-gray-*` par theme vars | 15+ fichiers | Consistency globale |
| B.4 | Remplacer `bg-gray-*` par theme vars | 15+ fichiers | Consistency globale |
| B.5 | Standardiser les icones (meetings, profile) | 5 fichiers | Icon consistency |
| B.6 | Standardiser tailles d'icones | 10+ fichiers | Visual hierarchy |

### Phase C — Polish premium (priorite moyenne)

| # | Tache | Fichiers | Impact |
|---|-------|----------|--------|
| C.1 | Hero section dashboard avec gradient | `dashboard.tsx` | First impression |
| C.2 | Cards cliquables hover states enrichis | `simulations-list`, `campaigns-list`, etc. | Feel premium |
| C.3 | KPI cards refonte (icone cercle, tendance, grand chiffre) | `simulation-detail.tsx` | Information hierarchy |
| C.4 | Gradient border-top sur sections cles | Getting Started, Next Step, hero | Brand reinforcement |
| C.5 | Animations stagger stat cards | `dashboard.tsx` | Motion design |
| C.6 | Score circles animes candidat | `candidate-report.tsx` | Wow factor |
| C.7 | Phase stepper ameliore (violet/orange) | `simulation-detail.tsx` | Brand consistency |

### Phase D — Finitions (priorite basse)

| # | Tache | Fichiers | Impact |
|---|-------|----------|--------|
| D.1 | Selection text violette | `globals.css` | Micro-detail |
| D.2 | Scrollbar violette | `globals.css` ou scrollable.css | Micro-detail |
| D.3 | Focus states violet | `globals.css` | Accessibility |
| D.4 | Join campaign page redesign | `join-campaign.tsx` | External branding |
| D.5 | Landing page gradient brand | `landing-page.tsx` | First impression externe |
| D.6 | Favicon mise a jour | `public/` | Branding |

---

## 12. Inventaire des fichiers

### Fichiers NOUVEAUX (2)

| Fichier | Contenu |
|---------|---------|
| `src/config/theme.constants.ts` | Mappings STATUS_VARIANT, KPI_LEVEL, CULTURE_LABELS |

### Fichiers CSS MODIFIES (2)

| Fichier | Modifications |
|---------|---------------|
| `src/styles/globals.css` | Palette primaire, dark mode, variables sidebar, gradient, selection, scrollbar |
| `src/styles/layout.css` | Variables sidebar si necessaire |

### Fichiers COMPOSANTS MODIFIES (3)

| Fichier | Modifications |
|---------|---------------|
| `src/components/ui/button.tsx` | Variants `accent`, `gradient` |
| `src/components/ui/badge.tsx` | Variant `accent` |
| `src/components/ui/workflow-stepper.tsx` | Couleurs violet/orange |

### Fichiers LAYOUT MODIFIES (3)

| Fichier | Modifications |
|---------|---------------|
| `layout-6/components/sidebar-menu-primary.tsx` | Fond violet, texte blanc, item actif orange |
| `layout-6/components/sidebar.tsx` | Fond gradient violet |
| `layout-6/components/simulation-context-bar.tsx` | Couleurs brand |

### Fichiers PAGES MODIFIES (15+)

| Fichier | Modifications |
|---------|---------------|
| `dashboard/pages/dashboard.tsx` | Hero gradient, stagger animations, couleurs brand |
| `simulation/pages/simulations-list.tsx` | Couleurs theme, hover cards, icones |
| `simulation/pages/simulation-detail.tsx` | KPI cards refonte, phase stepper brand |
| `recruitment/pages/campaigns-list.tsx` | Hover cards, couleurs theme |
| `recruitment/pages/campaign-detail.tsx` | Stats icons, couleurs brand |
| `recruitment/pages/candidate-report.tsx` | Score circles animes |
| `recruitment/pages/join-campaign.tsx` | Gradient brand, CTA orange |
| `deliverables/pages/deliverables-list-page.tsx` | Hover cards, couleurs theme |
| `deliverables/pages/deliverable-editor-page.tsx` | Couleurs theme |
| `valorization/pages/debriefing-page.tsx` | Migration couleurs hardcodees |
| `valorization/pages/portfolio-page.tsx` | Couleurs brand |
| `valorization/pages/badges-page.tsx` | Couleurs brand |
| `pmo/pages/pmo-chat-page.tsx` | Couleurs theme |
| `simulated-emails/pages/email-inbox-page.tsx` | Couleurs theme |
| `profile/pages/profile-import-step.tsx` | KeenIcon au lieu de Lucide |
| `pages/landing/landing-page.tsx` | Gradient brand, CTA |

### Fichiers de config MODIFIES (2)

| Fichier | Modifications |
|---------|---------------|
| `src/config/menu.config.ts` | Icone reunions → `message-text` |
| `src/config/simulation-context-menu.ts` | Verification icones |

---

## Resume de l'impact

| Metrique | Avant | Apres |
|----------|-------|-------|
| Identite de marque | Generique (indigo Tailwind) | Violet #4b2f95 + Orange #f14f1a — unique |
| Couleurs hardcodees | 4+ pages | 0 — tout via theme |
| Icones inconsistantes | 3 problemes identifies | 0 — mapping standardise |
| Dark mode | Slate generique | Violet profond (#0f081f) — premium |
| Sidebar | Blanc plat | Gradient violet — signature |
| Hover states | Basiques | Elevation + scale — premium |
| Score visuel | 5.7/10 | **9/10** cible |

---

> **Estimation** : 3-5 jours de developpement
> **Impact** : Transformation de l'identite visuelle. La plateforme passe d'une app generique a une marque reconnaissable avec une palette signature violet/orange.
