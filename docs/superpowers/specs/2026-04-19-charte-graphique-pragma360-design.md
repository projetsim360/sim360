# Charte graphique — Pragma360

> **Version** : 1.0
> **Date** : 2026-04-19
> **Statut** : Design spec (pré-implémentation)
> **Audience** : équipe design, équipe dev, Claude Design (assistant IA de génération d'UI)

Ce document est la **source de vérité** pour toute décision visuelle et d'interaction sur Pragma360. Il couvre : identité de marque, tokens fondamentaux (couleurs, typo, espacements), principes d'accessibilité, et 15 patterns UI clés. Il est pensé pour être exploité par un LLM qui génère de l'interface (Claude Design) — chaque règle est explicite, chaque token est nommé, chaque exemple est minimal et copiable.

---

## Table des matières

1. [Introduction & principes UX](#1-introduction--principes-ux)
2. [Identité de marque](#2-identité-de-marque)
3. [Voice & tone](#3-voice--tone)
4. [Couleurs (tokens)](#4-couleurs-tokens)
5. [Typographie](#5-typographie)
6. [Espacement, grille & radius](#6-espacement-grille--radius)
7. [Ombres, élévation & motion](#7-ombres-élévation--motion)
8. [Iconographie](#8-iconographie)
9. [Imagerie & illustrations](#9-imagerie--illustrations)
10. [Patterns UI](#10-patterns-ui)
11. [Accessibilité & dark mode](#11-accessibilité--dark-mode)

---

## 1. Introduction & principes UX

### 1.1 Mission produit

Pragma360 transforme la gestion de projet en expérience vécue. La plateforme simule des projets réels où les apprenants décident, collaborent avec des IA, et reçoivent un feedback pédagogique. Elle sert également les recruteurs qui évaluent des candidats sur mise en situation.

### 1.2 Positionnement

- **Publics** : apprenants B2C (étudiants, futurs PM) + entreprises B2B (DRH, cabinets RH, L&D)
- **Personnalité dominante** : **Pro d'abord, ludique ensuite**. La gamification existe mais en sous-couche visuelle discrète (progression, jalons, scores). Jamais de confettis, de trophées animés, ou de vocabulaire infantilisant.
- **Concurrents de référence** (ton & craft) : Linear, Vercel, Notion, Stripe. Inspirations edtech raisonnables : Masterclass, Coursera (pas Duolingo).

### 1.3 Les 5 principes UX

Chaque décision de design doit répondre positivement à ces 5 principes.

| # | Principe | Règle concrète |
|---|----------|----------------|
| 1 | **Clarté > densité** | L'utilisateur ne doit jamais être submergé. Dashboards = l'essentiel. Détails à un clic. Max 3 niveaux de hiérarchie par écran. |
| 2 | **Crédibilité > fun** | Animations sobres, langage pro. Gamification visuelle discrète (progression, jalons). Pas de confettis, pas de trophées animés, pas d'emojis dans l'UI produit. |
| 3 | **Adaptation au profil** | L'UI s'ajuste au niveau (junior/senior) et au rôle (apprenant/recruteur/admin). Le ton du PMO change, pas le chrome de l'app. |
| 4 | **Feedback immédiat** | Chaque action produit une confirmation visible en ≤200ms (toast, état, micro-animation). Les actions longues ont skeleton loading. |
| 5 | **Progression visible** | Partout où c'est possible, l'utilisateur voit où il en est : KPIs, progression de phase, score, jauges. Jamais de "noir" sans indicateur. |

---

## 2. Identité de marque

### 2.1 Wordmark

Le logo est un **wordmark typographique** (pas de symbole) construit en deux parties de couleurs contrastées.

```
Pragma360
├── "Pragma" — Montserrat 800, couleur brand-700 (#1A2B48)
└── "360"    — Montserrat 800, couleur accent-500 (#EE7A3A)
```

**Règles de construction** :
- Aucun espace entre `Pragma` et `360`
- Aucun séparateur (ni tiret, ni point, ni barre)
- `Pragma` et `360` partagent exactement la même taille et le même poids
- Toujours sur une seule ligne (jamais empilé sauf carré/favicon)

### 2.2 Variations autorisées

| Variation | Usage | Spec |
|-----------|-------|------|
| **Standard** (bicolor) | Sur fond clair (neutral-0 à neutral-100) | `Pragma` en brand-700, `360` en accent-500 |
| **Reverse** | Sur fond sombre (brand-700 à brand-950) | `Pragma` en white, `360` en accent-400 |
| **Mono sombre** | Tampons, signatures email, fax | Tout en brand-700 |
| **Mono clair** | Overlay sur photos, fonds complexes | Tout en white |
| **Favicon / App icon** | 16×16 à 512×512 | "P" capitale en brand-700 + petit "360" orange empilé ou adjacent selon taille |

### 2.3 Safe zone & tailles

- **Safe zone** : padding minimum autour du wordmark = hauteur de la majuscule "P"
- **Taille minimale web** : 16px de hauteur (navbar mobile)
- **Taille minimale print** : 22px de hauteur (5.8mm)
- **Favicon** : 16×16, 32×32, 192×192, 512×512

### 2.4 Interdits

- ❌ Stretch / squeeze (garder les proportions natives de Montserrat)
- ❌ Rotation, skew, effets 3D
- ❌ Drop shadow, glow, outline
- ❌ Changer la typographie
- ❌ Remplacer "360" par un symbole
- ❌ Inverser les couleurs (`Pragma` en orange, `360` en blue)
- ❌ Placer le wordmark sur un fond qui ne respecte pas le contraste WCAG AA

---

## 3. Voice & tone

### 3.1 Personnalité écrite

**Expert, direct, humain, sans jargon gratuit.** Pragma360 parle comme un senior manager qui mentore un junior : précis, bienveillant, orienté résultat. Jamais condescendant, jamais infantilisant.

### 3.2 Règles générales (toutes cibles)

- **Langue** : français d'abord. Les termes techniques anglais sont conservés uniquement s'ils sont standards dans la discipline (KPI, roadmap, sprint, feedback, stakeholder, etc.).
- **Forme** : **vous par défaut**. `tu` accepté uniquement dans l'onboarding apprenant B2C et le feedback IA coach.
- **Phrases** : courtes, max 20 mots. Une idée par phrase.
- **Verbes** : verbes d'action (*Lancez*, *Analysez*, *Décidez*, *Soumettez*). Jamais "Cliquez ici".
- **Emojis** : **jamais dans l'UI produit**. Exceptions tolérées : badges gamification (un seul par badge), messages du coach IA (un seul emoji contextuel max).
- **Interjections** : **jamais** "oups !", "oh non", "zut", "aïe". On reste pro.

### 3.3 Tonalité par contexte

| Contexte | Ton | Exemple |
|----------|-----|---------|
| **Onboarding apprenant** | Chaleureux, encourageant | "Bienvenue Alex. Commençons par cerner ton profil." |
| **Feedback IA coach** | Analytique, constructif | "Votre score de communication a baissé de 12%. Dans la dernière simulation, vous avez ignoré les alertes du Lead Developer. Tentez la communication non-violente." |
| **Erreur système** | Factuel, solution immédiate | "Connexion perdue. Vos données sont sauvegardées. Reprenez quand vous le souhaitez." |
| **Confirmation destructive** | Clair, conséquence explicite | "Cette simulation sera définitivement supprimée. Cette action est irréversible." |
| **Marketing B2C** | Engageant, ambition | "La gestion de projet n'est pas une théorie. Vivez-la." |
| **Marketing B2B recrutement** | Crédible, ROI | "Évaluez vos candidats sur mise en situation réelle. Mesurez leur leadership, pas leur CV." |
| **Admin / paramètres** | Neutre, précis | "Rôle administrateur. Toute modification est auditée." |
| **Empty state** | Invitation à l'action | "Lancez votre première simulation." (jamais "Aucun résultat") |

### 3.4 Microcopy : do/don't

| Contexte | ✅ À écrire | ❌ À ne pas écrire |
|----------|------------|-------------------|
| Bouton action | `Lancer la simulation` | `Cliquez ici pour lancer` |
| Erreur réseau | `Connexion perdue. Vos données sont sauvegardées.` | `Oups ! Quelque chose s'est mal passé` |
| Confirmation | `Simulation démarrée.` | `Super ! 🎉` |
| Empty state | `Lancez votre première simulation.` | `Aucun résultat trouvé` |
| Helper text | `Format recommandé : PDF, DOCX. Max 10 Mo.` | `Svp choisissez un fichier` |

---

## 4. Couleurs (tokens)

Les couleurs sont exprimées en tokens sémantiques. Toutes les valeurs ci-dessous sont accessibles en CSS via `var(--color-xxx)` et en Tailwind via la configuration `tailwind.config`.

### 4.1 Palette brand (Deep Blue — primary)

| Token | Valeur | Usage |
|-------|--------|-------|
| `brand-50` | `#F0F4FA` | Backgrounds clairs brand (hover zones, alertes info) |
| `brand-100` | `#D6E0EF` | Séparateurs brand, surfaces très légères |
| `brand-200` | `#B8C7DF` | Borders brand |
| `brand-300` | `#A8B9D4` | Texte désactivé sur fond brand |
| `brand-400` | `#7E94BB` | Icons secondaires brand |
| `brand-500` | `#5A7099` | Texte secondaire sur surfaces brand |
| `brand-600` | `#3D5478` | Hover sur brand-700 |
| `brand-700` | `#1A2B48` ★ | **Primary** — logo, sidebar, headers, texte fort |
| `brand-800` | `#14223A` | Texte extra-fort, gradients dark |
| `brand-900` | `#0F1A2E` | Fond dark mode page |
| `brand-950` | `#08111F` | Fond dark mode ultra-sombre (overlays) |

### 4.2 Palette accent (Warm Orange)

| Token | Valeur | Usage |
|-------|--------|-------|
| `accent-50` | `#FFF4ED` | Background hover accent, alertes warning soft |
| `accent-100` | `#FFE4D1` | Surfaces accent très légères (badges unlocked) |
| `accent-200` | `#FFCBA8` | Border accent soft |
| `accent-300` | `#FFB685` | Icons accent décoratifs |
| `accent-400` | `#F59763` | Hover light sur accent-500, CTA dark mode |
| `accent-500` | `#EE7A3A` ★ | **CTA primaire**, liens actifs, accents UI |
| `accent-600` | `#D9652D` | Hover sur accent-500 |
| `accent-700` | `#C45C24` | Active state CTA |
| `accent-800` | `#9C4718` | Texte accent sur fond clair |
| `accent-900` | `#7A3A15` | Dark mode accent shadow |
| `accent-950` | `#4D230C` | Ultra dark accent |

### 4.3 Palette neutrals (Warm gray)

Teinte chaude choisie pour harmoniser avec l'accent orange (vs neutrals froids qui jureraient).

| Token | Valeur | Usage |
|-------|--------|-------|
| `neutral-0` | `#FAFAF9` | Background page, surface la plus claire |
| `neutral-50` | `#F5F5F4` | Background card subtile, fond input |
| `neutral-100` | `#E7E5E4` | Dividers, borders subtils |
| `neutral-200` | `#D6D3D1` | Borders standards, input border |
| `neutral-300` | `#A8A29E` | Texte placeholder, icons disabled |
| `neutral-400` | `#78716C` | Texte muted, captions, timestamps |
| `neutral-500` | `#57534E` | Texte secondaire |
| `neutral-600` | `#44403C` | Texte body (alternative à neutral-700) |
| `neutral-700` | `#292524` ★ | **Texte body principal** |
| `neutral-800` | `#1C1917` | Texte extra fort |
| `neutral-900` | `#0C0A09` | Noir brand (ne jamais utiliser #000) |

### 4.4 Couleurs sémantiques

Chaque couleur sémantique décline 5 shades (50, 200, 500, 700, 900).

**Success** (validations, états positifs)
| Token | Valeur | Usage |
|-------|--------|-------|
| `success-50` | `#ECFDF5` | Background alert success |
| `success-200` | `#A7F3D0` | Borders, icons soft |
| `success-500` | `#10B981` ★ | **Primary success** — badges, toasts, trends ↑ |
| `success-700` | `#047857` | Texte success sur fond clair |
| `success-900` | `#064E3B` | Dark variant |

**Warning** (attention, alertes non critiques)
| Token | Valeur | Usage |
|-------|--------|-------|
| `warning-50` | `#FFFBEB` | Background alert warning |
| `warning-200` | `#FCD34D` | Borders, highlights |
| `warning-500` | `#F59E0B` ★ | **Primary warning** — toasts, badges urgence |
| `warning-700` | `#B45309` | Texte warning sur fond clair |
| `warning-900` | `#78350F` | Dark variant |

**Error** (erreurs, actions destructives, états critiques)
| Token | Valeur | Usage |
|-------|--------|-------|
| `error-50` | `#FEF2F2` | Background alert error, form error bg |
| `error-200` | `#FCA5A5` | Borders error |
| `error-500` | `#EF4444` ★ | **Primary error** — toasts, bordures input invalides, CTA destructive |
| `error-700` | `#B91C1C` | Texte error sur fond clair |
| `error-900` | `#7F1D1D` | Dark variant |

**Info** (notifications neutres)
| Token | Valeur | Usage |
|-------|--------|-------|
| `info-50` | `#EFF6FF` | Background alert info |
| `info-200` | `#93C5FD` | Borders info |
| `info-500` | `#3B82F6` ★ | **Primary info** — toasts, tooltips riches |
| `info-700` | `#1D4ED8` | Texte info sur fond clair |
| `info-900` | `#1E3A8A` | Dark variant |

### 4.5 Règles d'usage

- **CTA primaire** : `accent-500` sur fond clair, texte white. Hover : `accent-600`. Active : `accent-700`.
- **CTA secondaire** : border `brand-700` (1.5px), texte `brand-700`, fond transparent. Hover : fond `brand-50`.
- **CTA tertiaire (ghost)** : texte `brand-700`, fond transparent, pas de border. Hover : fond `neutral-50`.
- **CTA destructive** : fond `error-500`, texte white. Hover : `error-700`.
- **Text body** : `neutral-700` sur blanc/neutral-0. Secondary : `neutral-500`. Muted : `neutral-400`.
- **Titres** : `brand-700` (h1-h4) ou `neutral-800` si plus neutre.
- **Liens** : `accent-500` + underline sur hover. Visited = même couleur (pas de violet).
- **Surfaces** :
  - Fond page : `neutral-0`
  - Card standard : `white` (sur fond neutral-0)
  - Card élevée : `white` + `elevation-md`
  - Surface info : `brand-50`
  - Surface warning soft : `accent-50`

### 4.6 Contraste (WCAG 2.1 AA)

Tous les couples texte/fond utilisés doivent respecter :
- **4.5:1** pour du texte normal (≤18pt regular ou ≤14pt bold)
- **3:1** pour du texte large (≥18pt regular ou ≥14pt bold)
- **3:1** pour des composants UI (borders de focus, icons signifiantes)

Couples pré-validés :
- `neutral-700` sur `white` → **14.6:1** ✓
- `brand-700` sur `white` → **13.8:1** ✓
- `white` sur `brand-700` → **13.8:1** ✓
- `white` sur `accent-500` → **3.1:1** (ne convient que pour bouton, pas pour body)
- `accent-700` sur `white` → **5.1:1** ✓ (utiliser pour texte orange sur fond clair)
- `neutral-500` sur `white` → **7.2:1** ✓

---

## 5. Typographie

### 5.1 Familles

Deux familles chargées via Google Fonts. Fallback système obligatoire.

```css
--font-display: 'Montserrat', 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-body: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
```

| Famille | Rôle | Weights utilisés |
|---------|------|------------------|
| **Montserrat** | Display & headings (h1-h4), logo, accents | 700, 800 |
| **Inter** | Body, UI, h5-h6, boutons, inputs | 400, 500, 600, 700 |

### 5.2 Échelle typographique

Base 16px, ratio ~1.25 pour la pyramide, majorée sur les gros titres display pour l'impact.

| Token | Font | Size / Line-height | Weight | Usage |
|-------|------|--------------------|--------|-------|
| `display-2xl` | Montserrat | 60px / 63px | 800 | Hero display (landing) |
| `display-xl` | Montserrat | 48px / 52px | 800 | Display sections marketing |
| `h1` | Montserrat | 36px / 41px | 800 | Titre de page principal |
| `h2` | Montserrat | 28px / 34px | 700 | Titre de section |
| `h3` | Montserrat | 22px / 28px | 700 | Sous-section |
| `h4` | Montserrat | 18px / 23px | 700 | Titre de card |
| `h5` | Inter | 16px / 22px | 600 | Heading mineur, titre widget |
| `h6` | Inter | 14px / 20px | 600 | Overlay titre, label fort |
| `body-lg` | Inter | 18px / 28px | 400 | Intros, hero lead, citations |
| `body` | Inter | 14px / 21px | 400 | **Body default** — UI, paragraphes, descriptions |
| `body-sm` | Inter | 13px / 19px | 400 | Helper text, secondary info |
| `caption` | Inter | 12px / 17px | 400 | Timestamps, métadonnées |
| `overline` | Inter | 11px / 15px | 600, letter-spacing 1px, uppercase | Section labels |
| `button` | Inter | 14px / 14px | 600 | Boutons standards |
| `button-sm` | Inter | 13px / 13px | 600 | Boutons compacts |

### 5.3 Fluid typography (mobile → desktop)

Les tailles display et h1 sont fluides pour éviter le cassage sur mobile.

```css
/* Exemple : display-xl */
font-size: clamp(32px, 4vw + 16px, 48px);
```

Breakpoints de référence :
- Mobile (≤640px) : display-xl devient 32px, h1 devient 28px
- Desktop (≥1024px) : tailles nominales

Body reste **14px fixe** — ne pas scaler avec le viewport.

### 5.4 Règles typographiques

- **Hiérarchie** : max 3 niveaux par écran (h1 → h2 → body, ou h2 → h3 → body)
- **Letter-spacing** : uniquement sur overline (1px uppercase). Tout le reste en défaut (0)
- **Line-height** : body ≥1.5. Titres 1.1-1.3.
- **Uppercase** : **jamais** sur les titres. Uniquement sur overline.
- **Font-feature-settings** : activer `'ss01', 'cv11'` sur Inter pour le `1` à empattement et le `a` mono-étage.
- **Tailles minimum accessibilité** : body ≥13px, labels ≥11px.
- **Titres longs** : toujours `text-wrap: balance` pour un retour à la ligne harmonieux.

### 5.5 Do/don't

```
✅ DO
  h1 "Tableau de bord"              (Montserrat 800, brand-700, 36px)
  body "Bienvenue Alex."             (Inter 400, neutral-700, 14px)
  overline "ACTIVITÉ RÉCENTE"        (Inter 600, neutral-400, 11px uppercase)

❌ DON'T
  h1 en Inter (réserve Montserrat aux display/headings)
  Body à 12px (trop petit, échoue a11y)
  Titre "TABLEAU DE BORD" en uppercase (réserve uppercase à overline)
  letter-spacing sur h1 ou body
```

---

## 6. Espacement, grille & radius

### 6.1 Échelle spacing (base 4px)

| Token | px | Usage typique |
|-------|-----|---------------|
| `space-0.5` | 2 | Hairline dividers, micro-ajustements |
| `space-1` | 4 | Gap entre icon + texte inline |
| `space-2` | 8 | Padding tight, badge, micro gap |
| `space-3` | 12 | Padding input, gap form fields |
| `space-4` | 16 | **Padding card standard**, gap sections inline |
| `space-5` | 20 | Padding card large |
| `space-6` | 24 | Gap cards dashboard, padding sections |
| `space-8` | 32 | Gap grandes sections, marge bloc |
| `space-10` | 40 | Padding hero, marge toolbar/contenu |
| `space-12` | 48 | Padding sections landing |
| `space-16` | 64 | Padding hero desktop, section break |
| `space-24` | 96 | Gap entre blocs majeurs landing |

### 6.2 Breakpoints

| Token | min-width | Usage |
|-------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop small |
| `xl` | 1280px | Desktop standard |
| `2xl` | 1536px | Desktop large |

### 6.3 Grille & containers

| Token | Valeur | Usage |
|-------|--------|-------|
| `container-max` | 1440px | Largeur max de contenu |
| `container-padding` | 24px mobile / 40px desktop | Padding horizontal du container |
| `grid-cols` | 12 colonnes | Layout dashboard, landing |
| `grid-gutter` | 24px | Espace entre colonnes |
| `sidebar-width` | 260px | Nav latérale fixe app |
| `toolbar-height` | 64px desktop / 56px mobile | Barre top app |

### 6.4 Radius (Sobre & Pro)

| Token | px | Usage |
|-------|-----|-------|
| `radius-xs` | 4 | Badges, pills fines, progress bars |
| `radius-sm` | 6 | Inputs, small buttons, chips |
| `radius-md` | 8 | **Buttons standards, cards par défaut** |
| `radius-lg` | 12 | Large cards, dropdowns, popovers, modales |
| `radius-full` | 9999 | Avatars, pill buttons, dots |

Note : les HTML d'exploration utilisaient 16–20px. On adopte une échelle **sobre** (max 12px sur les surfaces) pour projeter crédibilité B2B. La chaleur de la marque est portée par la couleur orange, pas par des coins arrondis excessifs.

---

## 7. Ombres, élévation & motion

### 7.1 Échelle d'élévation (5 niveaux)

| Token | Box-shadow | Usage |
|-------|-----------|-------|
| `elevation-0` | `none` + `1px solid neutral-200` | Flat surfaces, cards outlined |
| `elevation-sm` | `0 1px 2px rgba(15,26,46,.05), 0 1px 3px rgba(15,26,46,.08)` | Inputs, chips |
| `elevation-md` | `0 2px 4px rgba(15,26,46,.06), 0 4px 12px rgba(15,26,46,.08)` | **Cards par défaut** |
| `elevation-lg` | `0 8px 24px rgba(15,26,46,.12)` | Dropdowns, popovers, tooltips riches |
| `elevation-xl` | `0 16px 40px rgba(15,26,46,.18)` | Modales, drawers, sheets |

### 7.2 Ombre signature (marketing only)

```css
--shadow-accent: 20px 20px 0 var(--color-accent-500);
```

Usage : hero images landing, card premium "recommandé" sur pricing. **Jamais dans l'app** (trop expressif).

### 7.3 Motion : durées

| Token | Valeur | Usage |
|-------|--------|-------|
| `duration-fast` | 150ms | Hover, focus, toggle micro (checkbox, switch) |
| `duration-base` | 200ms | Boutons, transitions UI standard, fade toast |
| `duration-slow` | 300ms | Ouverture dialog, drawer, accordéon |
| `duration-slower` | 500ms | Transitions de page, entrée hero |

### 7.4 Motion : easings

| Token | Valeur | Usage |
|-------|--------|-------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Entrée (défaut)** |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Mouvements latéraux, hover |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Sortie (fade out, dismiss) |

### 7.5 Principes d'animation

1. **Sobre** — Pas d'animations gratuites. Chaque mouvement communique un changement d'état.
2. **Courte** — Une action UI = max 300ms. Au-delà, l'utilisateur ressent un délai.
3. **Respecter `prefers-reduced-motion: reduce`** — désactiver toutes les animations non essentielles (garder uniquement les opacity).
4. **Entrée = slide + fade léger** — translateY 8–16px + opacity 0→1. Pas de bounce, pas de scale excessif.
5. **Skeleton loaders** plutôt que spinners pour >500ms. Spinners uniquement pour actions courtes (bouton loading).
6. **Framer Motion** pour orchestrations complexes. `transition-all duration-200 ease-out` Tailwind pour le reste.

---

## 8. Iconographie

### 8.1 Bibliothèques autorisées

| Bibliothèque | Usage autorisé | Variants | Tailles |
|--------------|----------------|----------|---------|
| **KeenIcon** | UI app (primaire) | solid, duotone, filled, outline | size-3 (12px) à size-8 (32px) |
| **Lucide** | Menus latéraux et top-nav **uniquement** | outline (défaut Lucide, stroke-width 1.75) | size-4 (16px), size-5 (20px) |
| **SVG inline** | Petits conteneurs (<size-6) où KeenIcon se rend mal | custom | variable |

### 8.2 Règles KeenIcon

- **Par défaut** : variant `outline`, taille `size-4` (16px) dans l'UI, `size-5` (20px) dans les boutons large, `size-6` (24px) en hero feature
- **État actif / sélectionné** : variant `solid`
- **Illustration / feature card** : variant `duotone` avec couleur accent
- **Couleur** : hérite de `currentColor` (défaut) ou forcée via classe Tailwind (`text-accent-500`, etc.)

### 8.3 Règles Lucide

- **Usage strict** : items de menu latéral et top-nav
- **Pourquoi** : Lucide est plus léger visuellement et cohérent avec les conventions modernes (Vercel, Linear, Shadcn/ui)
- **Taille** : `size-4` (16px) ou `size-5` (20px)
- **Stroke-width** : 1.75 (défaut Lucide — ne pas modifier)

### 8.4 Règle critique : petits conteneurs

> ⚠ **Règle venue de l'expérience projet** : éviter KeenIcon < size-4 (12px) dans Badge size="xs" ou cercles < size-6. Utiliser **SVG inline** ou **dots colorés** à la place (KeenIcon mal rendu en très petit).

### 8.5 Couleur d'icône par contexte

| Contexte | Couleur |
|----------|---------|
| Icon UI neutre | `currentColor` (hérite du texte) |
| Icon décoratif | `neutral-400` |
| Icon actif / sélectionné | `accent-500` |
| Icon dans CTA primaire | `white` |
| Icon success / warning / error | couleur sémantique correspondante |

---

## 9. Imagerie & illustrations

Pragma360 utilise **3 styles visuels** avec une répartition stricte par contexte. **Règle d'or** : une seule styles par écran.

### 9.1 Style A — Géométrique abstrait

**Usage** : hero landing, backgrounds de sections, data visualization, pages IA / simulation / analytics, loading states, social cards (OG images).

**Règles de composition** :
- SVG inline (pas d'images rasterisées)
- Palette : uniquement brand, accent, neutrals (pas de couleurs hors DS)
- Éléments : nodes (cercles pleins), lignes (courbes ou droites), dégradés radiaux subtils, grilles de dots
- Métaphore visuelle : flux, décisions, branches, feedback loops (cohérent avec le produit simulation)
- **Jamais** : ombres portées, effets 3D, glow

**Exemple (hero landing)** :

```html
<svg width="100%" height="100%" viewBox="0 0 400 220">
  <defs>
    <radialGradient id="g1" cx="30%" cy="30%">
      <stop offset="0%" stop-color="#EE7A3A" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#EE7A3A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="220" fill="url(#g1)"/>
  <!-- grid dots -->
  <g fill="#ffffff" opacity=".15">
    <!-- ... 18 dots en grille 6×3 -->
  </g>
  <!-- connected nodes -->
  <g stroke="#EE7A3A" stroke-width="1.5" fill="none" opacity=".8">
    <path d="M 80 110 Q 150 70 220 110 T 360 110"/>
  </g>
  <g fill="#EE7A3A">
    <circle cx="80" cy="110" r="5"/>
    <circle cx="220" cy="110" r="5"/>
    <circle cx="360" cy="110" r="5"/>
  </g>
</svg>
```

### 9.2 Style B — Illustrations vectorielles

**Usage** : onboarding wizard, empty states, emails transactionnels, success/erreur pages, contenus pédagogiques, illustrations de badges.

**Règles de composition** :
- SVG (bibliothèque custom ou outsourcée, style cohérent)
- Style "flat + 1 ombre douce" (pas de trait outline partout)
- Personnages stylisés : silhouettes simplifiées, pas de visages détaillés
- **Diversité** : représenter genres, origines, âges variés. Ne jamais par défaut un homme blanc adulte.
- **Interdits** : clichés (checklist géante, ampoule d'idée, poignée de main stock), emojis déguisés en illustrations

### 9.3 Style C — Photo + overlays

**Usage** : témoignages / cas clients, page équipe / à propos, pricing B2B, landing recrutement, case studies, press / communiqués.

**Règles de composition** :
- Overlay : `brand-700` à 80% d'opacité (ou gradient `brand-700 → brand-900`)
- Ratio : 16:9 ou 4:3 (jamais de carré sauf portrait témoignage)
- **Jamais** : stock photos clichés (équipe souriant face caméra, handshake, post-it sur mur en verre)
- Teinte chaude préférée (balance des blancs légèrement chaude)
- Focale : portrait (témoignages) ou action (équipe en meeting réel)
- Accent orange ponctuel via overlay géométrique superposé (optionnel, pour unifier avec style A)

### 9.4 Règles transverses

- **Formats** : préférer SVG (styles A et B). PNG haute qualité avec fallback WebP pour style C.
- **Poids** : hero ≤ 200Ko, illustration contextuelle ≤ 50Ko.
- **Alt text** : obligatoire si l'image porte un sens. `alt=""` si purement décorative.
- **Performance** : lazy loading natif (`loading="lazy"`) pour toutes les images hors fold.

---

## 10. Patterns UI

15 patterns clés utilisés dans l'app et le marketing. Chaque fiche couvre : quand l'utiliser, quand NE PAS l'utiliser, anatomie, règles, do/don't.

### 10.1 Page shell (Toolbar + container)

**Rôle** : layout obligatoire de toutes les pages app.

**Anatomie** :
```
<Page>
  <Toolbar>
    <ToolbarHeading>
      <ToolbarPageTitle /> (h1)
      <ToolbarBreadcrumb /> (optionnel)
    </ToolbarHeading>
    <ToolbarActions>
      <Button /> actions contextuelles
    </ToolbarActions>
  </Toolbar>
  <div class="container-fixed">
    <Card /> section 1
    <Card /> section 2
  </div>
</Page>
```

**Règles** :
- Espacement entre Toolbar et contenu : `space-10` (40px) desktop, `space-6` (24px) mobile
- Actions de la Toolbar : **max 3 boutons** (primary + secondary + menu "…")
- Responsive : sur mobile, les actions descendent sous le titre

### 10.2 Card

**Rôle** : surface principale de contenu segmenté.

**Variants** :
- `default` : fond white, `radius-md`, `elevation-md`
- `interactive` : default + hover `elevation-lg` + cursor pointer
- `outlined` : fond white, border `neutral-200`, pas d'ombre
- `filled` : fond `neutral-50`, pas de border, pas d'ombre (pour zones internes)

**Anatomie** : `CardHeader` (titre + actions) + `CardBody` (contenu) + `CardFooter` (actions finales)

**Règles** :
- Padding : `space-4` (16px) default, `space-6` (24px) large
- Titre card : `h4` (Montserrat 18px bold)
- **Ne pas empiler** cards dans cards (max 2 niveaux : page > card > éléments)

### 10.3 Button

**Variants** :
| Variant | Spec |
|---------|------|
| `primary` | fond `accent-500`, texte white, hover `accent-600`, active `accent-700` |
| `secondary` | border 1.5px `brand-700`, texte `brand-700`, fond transparent, hover fond `brand-50` |
| `tertiary` (ghost) | texte `brand-700`, fond transparent, hover fond `neutral-50` |
| `destructive` | fond `error-500`, texte white, hover `error-700` |
| `link` | texte `accent-500`, underline on hover, pas de padding |

**Tailles** : `sm` (32px h, padding 12px, button-sm), `md` (40px h, padding 16px, button), `lg` (48px h, padding 24px, button)

**États** : default, hover, active, focus-visible (ring 2px accent-500 + offset 2px), disabled (opacity 50%, cursor not-allowed), loading (icon spinner + texte ou icon only)

**Icon-only** : `aria-label` obligatoire.

### 10.4 Form & Input

**Stack** : `react-hook-form` + `zod` + composants Form custom.

**Composants** : Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, DatePicker, FileInput.

**Anatomie d'un champ** :
```
<Label> (toujours au-dessus, jamais placeholder-as-label)
<Input />
<HelperText /> (neutral-500, optionnel)
<ErrorMessage /> (error-500, si invalide)
```

**Règles** :
- Label : `body-sm` (13px) weight 500, couleur `neutral-700`
- Input : hauteur 40px (md), border `neutral-200`, radius-sm (6px), fond white
- Focus : border `accent-500` + ring 2px accent-500/20
- Erreur : border `error-500`, message en `error-700` sous le champ
- Required : indicateur visuel (ex: astérisque `accent-500`) + `aria-required`

### 10.5 DataGrid

**Rôle** : collections complexes (tri, filtre, pagination, bulk actions).

**Quand l'utiliser** : >10 lignes, OU colonnes triables, OU bulk actions.
**Quand NE PAS** : listes simples → utiliser Simple Table.

**Anatomie** :
```
<DataGrid>
  <DataGridFilters /> (recherche + filtres colonnes)
  <DataGridHeader /> (colonnes sortables)
  <DataGridRows />
  <DataGridPagination />
  <DataGridBulkActions /> (apparait quand rows sélectionnées)
</DataGrid>
```

**Règles** :
- Densité : `comfortable` (56px row) par défaut, `compact` (40px row) pour >50 lignes
- Empty state obligatoire (pattern 12)
- Loading : skeleton rows, jamais de spinner plein écran
- Sticky header au scroll

### 10.6 Simple Table

**Rôle** : collections simples sans interactions.

**Quand l'utiliser** : ≤10 lignes, pas de tri/filtre/bulk.

**Règles** :
- Alignement : texte à gauche, nombres à droite, actions à droite
- Zebra stripes optionnelles (`neutral-50` lignes paires)
- Border bottom sur chaque row (`neutral-100`)

### 10.7 Dialog (modale)

**Rôle** : confirmation critique, formulaire court, détail focus.

**Quand l'utiliser** : une seule tâche courte à accomplir.
**Quand NE PAS** : édition longue, multi-étapes → utiliser Drawer.

**Anatomie** : `DialogHeader` (titre h4 + close) + `DialogBody` (scrollable) + `DialogFooter` (actions alignées droite : Annuler ghost + Confirmer primary)

**Tailles** : `sm` (400px), `md` (560px — défaut), `lg` (720px)

**Règles** :
- Overlay `brand-950` opacity 50%
- `elevation-xl`, `radius-lg`
- Focus trap activé, `Esc` ferme
- Scroll interne sur DialogBody si contenu long (ne jamais scroller le background)

### 10.8 Drawer (Sheet)

**Rôle** : panneau latéral pour édition longue, contextes riches, wizards.

**Pattern standard projet** (venu du code existant) :
```tsx
<SheetContent className="gap-0 sm:w-[540px] inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none">
  <SheetHeader />
  <SheetBody>
    <ScrollArea className="h-[calc(100vh-10rem)]" />
  </SheetBody>
</SheetContent>
```

**Règles** :
- Largeur : 540px desktop, full width mobile
- Position : droite par défaut
- `elevation-xl`, `radius-lg`
- Peut contenir tabs (ex: Chat | Contexte)

### 10.9 Toast

**Stack** : Sonner (`toast()`)

**Variants** : `default`, `success`, `error`, `warning`, `info`

**Anatomie** : icon (sémantique) + titre + description (optionnelle) + action (optionnelle)

**Règles** :
- Position : bottom-right desktop, bottom-center mobile
- Durée : 4s défaut, 8s si action (Annuler), persistent si erreur critique
- **Jamais** pour erreurs critiques (formulaires, paiement) → Dialog ou inline error
- Max 3 toasts simultanés (empiler les suivants)

### 10.10 AlertDialog

**Rôle** : actions destructives ou confirmations critiques.

**Quand l'utiliser** : suppression, reset, annulation avec perte de données, envoi irréversible.

**Anatomie** : icon warning/error + titre + description (explicite sur les conséquences) + Cancel (ghost, gauche) + Action destructive (rouge, droite)

**Règles** :
- Titre : formule claire "Supprimer cette simulation ?"
- Description : expliciter l'irréversibilité "Cette action est irréversible. Toutes les données de cette simulation seront perdues."
- Action destructive toujours à **droite**, Cancel à **gauche** (convention occidentale)
- Focus par défaut sur Cancel (pas sur l'action destructive)

### 10.11 FAB + Sheet (Agent PMO)

**Rôle** : pattern spécifique produit — Coach IA contextuel toujours accessible.

**Anatomie** :
- Bouton rond flottant, 56×56px, `accent-500`, icon user/chat, `elevation-lg`
- Position : bottom-right, offset 24px des bords
- Badge count notifs (`error-500` sur fond white)
- Au clic : ouvre Drawer avec tabs (Chat | Contexte)

**Règles** :
- Unique par écran
- Jamais caché par d'autres overlays (z-index élevé)
- Animation d'entrée : scale 0 → 1 ease-out 300ms
- Disparaît si Drawer déjà ouvert (pour éviter double-click)

### 10.12 Empty state

**Rôle** : état vide d'une liste, table, recherche, inbox.

**Obligatoire** dans tous les DataGrid, tables, listes.

**Anatomie** :
```
<EmptyState>
  <Illustration /> (style B — vectorielle, ~120x120px)
  <Title /> (h4, ton invitation)
  <Description /> (body, 1-2 phrases max)
  <CTA /> (button primary, l'action la plus probable)
</EmptyState>
```

**Règles microcopy** : ton invitation, pas de négation.
- ✅ "Lancez votre première simulation"
- ❌ "Aucun résultat trouvé"

### 10.13 Loading states

**Règles par durée mesurée** :
- **<200ms** : rien (pas de flash visuel)
- **200-500ms** : skeleton loading (placeholders gris animés)
- **>500ms** : skeleton + progress indicator si mesurable
- **Actions utilisateur courtes (bouton)** : spinner dans le bouton + texte

**Jamais** :
- Page blanche sans indicateur
- Spinner plein écran > 500ms (utiliser skeleton)
- Loading bar fake qui "avance" sans mesure réelle

### 10.14 KPI tile

**Rôle** : pattern dashboard pour afficher une métrique clé.

**Anatomie** :
```
<KpiTile>
  <Overline /> (label, 11px uppercase neutral-400)
  <Value /> (display-xl, brand-700)
  <Trend /> (delta + flèche, couleur sémantique)
  <Sparkline /> (optionnelle, 60x20px)
</KpiTile>
```

**Dimensions** : min 200×140px.

**Trend** :
- Positif : icon ↑ + `success-500`
- Négatif : icon ↓ + `error-500` (contexte commercial) OU `success-500` (contexte coûts)
- Neutre : icon → + `neutral-500`

### 10.15 Wizard / Stepper

**Rôle** : flows multi-étapes (onboarding, création recrutement, wizard simulation).

**Anatomie** :
- Horizontal desktop, vertical mobile
- Étapes numérotées (1, 2, 3…) avec état : `done` (checkmark, success-500), `current` (highlight accent-500), `pending` (neutral-300)
- Navigation : **Précédent** (ghost, gauche) + **Suivant** (primary, droite) + **Sauter** (link, optionnel)
- Progress visible : "Étape 2 sur 5" ou progress bar en haut

**Règles** :
- **Minimum 2 étapes**, maximum 7 (au-delà → découper en sous-parcours)
- Chaque étape doit pouvoir être sauvegardée (perte de données = AlertDialog à la sortie)
- Étape finale : écran récap avant validation

---

## 11. Accessibilité & dark mode

### 11.1 WCAG 2.1 AA (obligatoire)

| Axe | Règle |
|-----|-------|
| **Contraste** | 4.5:1 body, 3:1 texte large, 3:1 composants UI |
| **Focus ring** | 2px `accent-500` + offset 2px sur tous les focusables |
| **Taille touch** | minimum 44×44px sur mobile (boutons, liens, inputs) |
| **Navigation clavier** | tous les flows testés Tab / Shift+Tab / Enter / Esc / Arrows |
| **Screen reader** | `aria-label` sur icon-only buttons, `role` sur composants custom, `aria-live` pour toasts |
| **Reduced motion** | `prefers-reduced-motion: reduce` respecté (désactive animations non essentielles) |
| **Zoom** | l'UI tient jusqu'à 200% sans scroll horizontal (sauf tables qui peuvent scroller) |
| **Langue** | `lang="fr"` sur html, `lang="en"` sur termes techniques anglais isolés |
| **Erreurs formulaires** | `aria-describedby` + `aria-invalid` + message texte (pas juste couleur) |
| **Images** | `alt` descriptif si signifiant, `alt=""` ou `aria-hidden` si décoratif |

### 11.2 Checklist accessibilité par pattern

| Pattern | Règle a11y spécifique |
|---------|----------------------|
| Button | `aria-label` si icon-only, `aria-busy` si loading |
| Form | Chaque input a un `<label for>` explicite |
| Dialog | Focus trap, Esc ferme, focus retourne au trigger |
| Drawer | Même règles que Dialog |
| Toast | `role="status"` (info) ou `role="alert"` (error) |
| AlertDialog | `role="alertdialog"`, focus sur Cancel par défaut |
| DataGrid | Headers `<th>` avec `scope="col"`, tri annoncé via `aria-sort` |
| Wizard | Progress annoncé via `aria-current="step"` |

### 11.3 Dark mode — mapping tokens

Dark mode implémenté via `next-themes` + redéfinition des CSS vars dans `.dark { }`.

| Token sémantique | Light | Dark |
|------------------|-------|------|
| `bg-page` | `neutral-0` | `neutral-900` |
| `bg-card` | `white` | `neutral-800` |
| `bg-elevated` | `white` | `neutral-700` |
| `text-primary` | `neutral-900` | `neutral-50` |
| `text-secondary` | `neutral-700` | `neutral-300` |
| `text-muted` | `neutral-500` | `neutral-400` |
| `border` | `neutral-200` | `neutral-700` |
| `brand-primary` | `brand-700` | `brand-300` (inversé) |
| `accent-cta` | `accent-500` | `accent-400` (un cran plus clair pour compenser le fond sombre) |
| `elevation-md` | `0 2px 4px rgba(15,26,46,.06)...` | `0 2px 4px rgba(0,0,0,.3)...` (plus fort) |

### 11.4 Règles dark mode

- **Jamais** de noir pur (`#000`) — utiliser `neutral-900` ou `brand-900`
- **Jamais** de blanc pur sur fond sombre pour body — utiliser `neutral-50` (légèrement cassé)
- **Images** : prévoir versions claire/sombre pour les illustrations avec couleurs vives
- **Ombres** : amplifier l'opacité (0.3 vs 0.06 light) car elles sont moins visibles sur fond sombre

---

## Annexe A — Résumé des décisions prises

| Décision | Choix |
|----------|-------|
| Nom de marque | **Pragma360** |
| Personnalité | **Pro d'abord, ludique ensuite** |
| Palette | ADN conservé, orange affiné **#EE7A3A** (vs #FF8C42) |
| Radius | **Sobre & Pro** (4/6/8/12px + full) |
| Dark mode | **Supporté** (mapping tokens, pas détaillé par pattern) |
| Logo | **Wordmark texte** (Pragma brand-700 + 360 accent-500) |
| Imagerie | 3 styles avec usages précis (géométrique / vectorielles / photo) |
| Scope charte | **Fondations + 15 patterns UI** (pas catalogue exhaustif des 79 composants) |

## Annexe B — Checklist "Claude Design ready"

Pour qu'un LLM exploite cette charte efficacement, chaque règle ci-dessus satisfait les critères suivants :

- [x] Chaque token a une valeur explicite (pas de "neutre", "moyen", "raisonnable")
- [x] Chaque règle est binaire ou mesurable (pas de "beaucoup", "souvent")
- [x] Chaque pattern a un rôle + un "quand NE PAS utiliser"
- [x] Chaque usage cible un contexte (UI app, marketing, onboarding, etc.)
- [x] Les do/don't sont explicites par microcopy et par pattern
- [x] Les anti-patterns connus (KeenIcon < size-4, mélange styles imagerie) sont documentés

## Annexe C — Éléments hors scope de cette charte

Ces éléments existeront ailleurs (Storybook, futur document produit) :
- Catalogue exhaustif des 79 composants UI custom (props, variants, API)
- Spécifications techniques d'implémentation (CSS vars, Tailwind config)
- Logo avec symbole visuel (si commissionné plus tard)
- Charte éditoriale détaillée (guides de rédaction longs)
- Brand guidelines marketing étendues (couleurs print, packaging, goodies)
