# Pragma360 — Design System

> **Version** : 1.0 — 2026-04-19
> **Statut** : Design spec (pré-implémentation)
> **Source de vérité** : la charte graphique `01-charte-graphique-pragma360.md` dans le briefing interne.

---

## 1. Ce qu'est Pragma360

**Pragma360** est un SaaS de simulation de gestion de projet et de recrutement. Les apprenants vivent des projets réels avec des interlocuteurs IA (meetings, décisions, imprévus) et reçoivent un feedback pédagogique de qualité senior. La plateforme sert également les recruteurs B2B qui évaluent des candidats sur mise en situation scénarisée.

**Publics servis**
- **Apprenants B2C** — étudiants, futurs Product / Project Managers
- **Entreprises B2B** — DRH, cabinets RH, équipes L&D, pour évaluer et former

**Surfaces produit** (10 epics implémentées)
- App web apprenant : profiling, Agent PMO (chat), simulations, meetings, livrables, inbox emails simulés, portfolio valorisé
- App web recruteur : création de scénarios d'évaluation, suivi candidats, rapport 360
- Back-office admin
- Marketing / landing

**Stack technique cible** : React 19 + Radix UI + CVA + Tailwind v4 + react-hook-form + zod + Sonner + Framer Motion + next-themes.

---

## 2. Sources exploitées

Ce design system a été construit à partir des ressources suivantes (références — ne pas supposer que le lecteur y a accès) :

| Source | Type | Chemin / URL |
|---|---|---|
| Briefing Claude Design | Markdown | `pragma360-claude-design-brief/00-README.md` |
| Charte graphique Pragma360 v1.0 | Markdown — **source de vérité** | `pragma360-claude-design-brief/01-charte-graphique-pragma360.md` |
| Composants actuels (à migrer) | React + CVA + Tailwind v4 | `pragma360-claude-design-brief/patterns-reference/{button,card,input,form,dialog,sheet}.tsx` |

> ⚠ Les `patterns-reference/*.tsx` utilisent l'ancienne palette violette (#4B2F95 + coral) qui sera **remplacée** par la palette Deep Blue + Warm Orange définie ici. Les fichiers ne servent qu'à fixer la **stack** et la **forme d'API** (CVA, Radix, `cn()`).

---

## 3. Content fundamentals (voice & tone)

**Personnalité** : expert, direct, humain. Un senior manager qui mentore un junior — **précis, bienveillant, orienté résultat**. Jamais condescendant, jamais infantilisant. Crédible comme Linear, Stripe, Notion. Jamais Duolingo.

### 3.1 Règles de rédaction

- **Langue** : français d'abord. Anglicismes tolérés s'ils sont standards dans la discipline (KPI, roadmap, sprint, feedback, stakeholder, brief).
- **Forme** : **vous par défaut**. `tu` accepté uniquement en onboarding apprenant B2C et feedback IA coach.
- **Phrases** : courtes, max 20 mots. Une idée par phrase.
- **Verbes** : verbes d'action (*Lancez*, *Analysez*, *Décidez*, *Soumettez*). **Jamais** "Cliquez ici".
- **Emojis** : **jamais dans l'UI produit**. Exceptions tolérées : badges gamification (un seul), messages coach IA (un seul contextuel).
- **Interjections** : **jamais** "oups !", "oh non", "zut", "aïe". On reste pro.
- **Casing** : Sentence case partout dans l'UI (boutons, titres, labels). Uppercase **uniquement** sur overline (11px, letter-spacing 1px).

### 3.2 Tonalité par contexte

| Contexte | Ton | Exemple |
|---|---|---|
| Onboarding apprenant | Chaleureux, encourageant | "Bienvenue Alex. Commençons par cerner ton profil." |
| Feedback IA coach | Analytique, constructif | "Votre score de communication a baissé de 12%. Tentez la communication non-violente." |
| Erreur système | Factuel, solution immédiate | "Connexion perdue. Vos données sont sauvegardées." |
| Confirmation destructive | Clair, conséquence explicite | "Cette simulation sera définitivement supprimée. Cette action est irréversible." |
| Marketing B2C | Engageant, ambition | "La gestion de projet n'est pas une théorie. Vivez-la." |
| Marketing B2B recrutement | Crédible, ROI | "Évaluez vos candidats sur mise en situation réelle. Mesurez leur leadership, pas leur CV." |
| Admin / paramètres | Neutre, précis | "Rôle administrateur. Toute modification est auditée." |
| Empty state | Invitation à l'action | "Lancez votre première simulation." |

### 3.3 Microcopy — do / don't

| ✅ À écrire | ❌ À ne pas écrire |
|---|---|
| Lancer la simulation | Cliquez ici pour lancer |
| Connexion perdue. Vos données sont sauvegardées. | Oups ! Quelque chose s'est mal passé |
| Simulation démarrée. | Super ! 🎉 |
| Lancez votre première simulation. | Aucun résultat trouvé |
| Format recommandé : PDF, DOCX. Max 10 Mo. | Svp choisissez un fichier |

### 3.4 Vibe

« Pro d'abord, ludique ensuite ». La gamification existe en sous-couche visuelle (progression, jalons, scores) mais jamais en confettis, trophées animés, ou vocabulaire enfantin. La chaleur de la marque passe par la **couleur orange accent** et par le **feedback immédiat**, pas par des coins arrondis excessifs ni des illustrations mignonnes.

---

## 4. Visual foundations

### 4.1 Colors

**Palette de marque** — deux couleurs signature, neutre warm gray, quatre sémantiques.

- **Brand primary** — Deep Blue `#1A2B48` (brand-700). Identité, sidebar, headers, texte fort, wordmark.
- **Accent CTA** — Warm Orange `#EE7A3A` (accent-500). CTA primaire, liens actifs, jalons, gamification discrète.
- **Neutrals** — warm gray (teinte chaude pour s'harmoniser avec l'orange). Bases : `#FAFAF9` → `#0C0A09`.
- **Semantics** — success `#10B981`, warning `#F59E0B`, error `#EF4444`, info `#3B82F6` (chacune déclinée 50/200/500/700/900).

> Échelle complète : voir `colors_and_type.css`, ou cartes `preview/colors-*.html`.

**Règles** : jamais de `#000` pur. Jamais de `#fff` pur sur fond sombre pour du body (utiliser `neutral-50`). Liens = `accent-500` sans variante "visited". CTA destructive = `error-500`.

### 4.2 Typography

- **Display / headings** : **Montserrat** 700/800 (h1–h4, logo, accents marketing)
- **Body / UI** : **Inter** 400/500/600/700 (body, h5–h6, boutons, inputs)
- **Font-feature-settings** activés sur Inter : `ss01` (1 à empattement) + `cv11` (a mono-étage)
- **Tailles minimum a11y** : body ≥13px, labels ≥11px
- **Uppercase** : uniquement sur overline (11px, letter-spacing 1px)
- **Text-wrap: balance** sur tous les titres longs

Échelle complète dans `colors_and_type.css`.

### 4.3 Spacing & layout

- **Base 4px** — échelle `space-0.5` (2px) à `space-24` (96px)
- **Grille** 12 colonnes, gutter 24px, container max 1440px
- **Sidebar** app : 260px fixe. **Toolbar** : 64px desktop / 56px mobile
- **Padding card** : 16px default, 24px large
- **Container padding** : 24px mobile, 40px desktop

### 4.4 Radius — **sobre & pro**

`4 / 6 / 8 / 12 / full`. **Pas** de 16–20px. La chaleur est portée par la couleur, pas par des coins excessifs. Boutons et cards par défaut = `radius-md` (8px). Modales et popovers = `radius-lg` (12px).

### 4.5 Backgrounds

- **Page** : `neutral-0` (`#FAFAF9`) — jamais blanc pur
- **Card standard** : `white` sur fond `neutral-0`, avec elevation-md
- **Surface info** : `brand-50` — pour bandeaux contextuels
- **Hero marketing** : fond `brand-700` ou `brand-800` avec **SVG géométrique abstrait** (nodes + courbes + gradient radial accent-500)
- **Pas de gradients mesh, pas de bluish-purple, pas de textures grain**

### 4.6 Borders

- **Default** : 1px `neutral-200`
- **Input focus** : 1.5px `accent-500` + ring 2px `accent-500` à 20% opacity
- **Button secondary** : 1.5px `brand-700`
- **Dividers** : 1px `neutral-100`

### 4.7 Shadow & elevation system

Cinq niveaux (`elevation-0` flat, `-sm`, `-md` cards default, `-lg` popovers, `-xl` modales). Teinte d'ombre : `rgba(15, 26, 46, …)` — c'est un bleu brand sombre, pas un noir. **Shadow signature** `20px 20px 0 accent-500` réservée au **marketing** (hero, pricing premium) — jamais dans l'app.

### 4.8 Motion

- **Durations** : 150 / 200 / 300 / 500ms
- **Easings** : `ease-out` entrée (défaut), `ease-in-out` latéral, `ease-in` sortie
- **Principes** : sobre, court (max 300ms pour une action UI). Entrée = translateY 8–16px + fade. **Pas de bounce**, pas de scale excessif, pas de confettis.
- **`prefers-reduced-motion: reduce`** respecté — seuls les fades subsistent.
- **Loading** : skeleton pour >500ms, spinner uniquement dans les boutons pour actions courtes.

### 4.9 Hover / press / focus

- **Hover CTA primary** : `accent-500` → `accent-600`
- **Hover CTA secondary** : fond transparent → `brand-50`
- **Hover ghost** : fond transparent → `neutral-50`
- **Hover card interactive** : elevation-md → elevation-lg (pas de translate)
- **Press** : `accent-500` → `accent-700`. Pas de shrink / scale.
- **Focus-visible** : ring 2px `accent-500` + offset 2px (sur tous les focusables)
- **Disabled** : opacity 50% + cursor not-allowed

### 4.10 Transparency & blur

- **Overlay modale** : `brand-950` à 50% opacity (pas de blur — trop expressif pour B2B)
- **Glassmorphism** : **interdit** dans l'app
- **Overlay photo témoignages** (marketing) : `brand-700` 80% ou gradient `brand-700 → brand-900`

### 4.11 Imagery — 3 styles avec usages stricts

- **A. Géométrique abstrait** — hero landing, backgrounds, data-viz. SVG inline. Palette brand + accent + neutrals. Nodes, courbes, gradients radiaux subtils, grilles de dots. Métaphore : flux, décisions, feedback loops. Jamais d'ombres portées ni de 3D.
- **B. Illustrations vectorielles** — onboarding, empty states, emails, success/erreur, badges. SVG flat + 1 ombre douce. Silhouettes stylisées, pas de visages détaillés. Diversité explicite.
- **C. Photo + overlay** — témoignages, équipe, pricing B2B, case studies. Overlay `brand-700/80` ou gradient `brand-700 → brand-900`. Teinte chaude, focale portrait ou action réelle. Interdit : stock-photos clichés (handshake, post-it, équipe souriant face caméra).

**Règle d'or** : **un seul style par écran**.

### 4.12 Cards

- **Default** : fond `white`, `radius-md` (8px), `elevation-md`, padding 16px
- **Interactive** : default + hover `elevation-lg` + cursor pointer
- **Outlined** : `white` + border `neutral-200`, pas d'ombre
- **Filled** : `neutral-50`, pas de border, pas d'ombre (zones internes)
- **Titre card** : h4 (Montserrat 18px 700)
- **Empilement max** : page > card > éléments. Pas de cards-dans-cards.

### 4.13 Layout rules — éléments fixes

- **Sidebar** apprenant/recruteur : 260px, fixed left, scroll interne
- **Toolbar** top : 64px desktop, sticky
- **FAB Agent PMO** : 56×56 bottom-right, offset 24px, z-index élevé — unique par écran
- **Toast stack** : bottom-right desktop, bottom-center mobile, max 3 simultanés

---

## 5. Iconography

### 5.1 Librairies autorisées

| Librairie | Usage autorisé | Variants | Tailles |
|---|---|---|---|
| **KeenIcon** | UI app (primaire) | solid, duotone, filled, **outline** | 12px → 32px |
| **Lucide** | Menus latéraux + top-nav **uniquement** | outline stroke 1.75 | 16px, 20px |
| **SVG inline** | Petits conteneurs (<size-6) où KeenIcon se rend mal | custom | variable |

### 5.2 Règles

- **Outline** par défaut. **Solid** pour état actif / sélectionné. **Duotone** pour illustration / feature card (avec couleur accent).
- **Couleur** : hérite de `currentColor` — pas de couleur figée sauf sémantique.
- **CTA primaire** : icon `white`. **Actif / sélectionné** : `accent-500`. **Décoratif** : `neutral-400`.
- ⚠ **Règle critique** : éviter KeenIcon < size-4 (12px) dans Badge `size="xs"` ou cercles < size-6. Utiliser SVG inline ou dots colorés.

### 5.3 Approche ce design system

- **Lucide** chargé depuis CDN (`https://unpkg.com/lucide@latest`) dans les UI kits et slides. C'est cohérent avec l'usage (menus, navigation).
- **KeenIcon** : pas de CDN public stable ni de font disponible dans ce briefing. Pour les cartes preview et les UI kits, on utilise **Lucide en stand-in** pour toutes les positions KeenIcon, en précisant le choix dans chaque composant. ⚠ **À remplacer par KeenIcon lors de l'implémentation** (solid/duotone/filled/outline).
- **Emoji** : **jamais dans l'UI produit**. Tolérés uniquement en badges gamification (un par badge) et en messages coach IA.
- **Unicode chars comme icônes** : à éviter. Préférer une icône vectorielle.

### 5.4 Assets fournis

- `assets/logo-pragma360-wordmark.svg` — wordmark bicolor standard (fond clair)
- `assets/logo-pragma360-wordmark-reverse.svg` — reverse (fond sombre)
- `assets/logo-pragma360-mono-dark.svg` — mono brand-700
- `assets/logo-pragma360-mono-light.svg` — mono white
- `assets/favicon.svg` — P + 360 empilés (format carré)
- `assets/hero-geometric.svg` — exemple style A (hero landing)
- `assets/empty-state-simulation.svg` — exemple style B (illustration vectorielle)

---

## 6. Index (manifest)

Fichiers au **root** :

| Fichier | Rôle |
|---|---|
| `README.md` | Ce fichier |
| `SKILL.md` | Agent-skill compatible — comment utiliser ce design system |
| `colors_and_type.css` | Tokens CSS (couleurs, typo, spacing, radius, elevation, motion) |
| `assets/` | Logos, favicon, illustrations fournies (SVG) |
| `preview/` | Cartes HTML (~700×*) pour l'onglet Design System |
| `ui_kits/app/` | UI kit Pragma360 — écrans apprenant + recruteur |

**UI kits** :
- [`ui_kits/app/`](ui_kits/app/index.html) — App web Pragma360 (dashboard, Agent PMO drawer, simulation meeting, livrables, recrutement 360)

**Preview cards** (Design System tab) :
- Type : type-scale, font-families
- Colors : brand, accent, neutrals, semantics, surfaces, combinations
- Spacing : spacing-scale, radius-scale, elevation-scale, motion
- Components : buttons, inputs, cards, badges, kpi-tile, empty-state, toast, wizard, avatar
- Brand : logos, wordmark-usage, voice-tone, imagery-styles, iconography

---

## 7. Caveats & to-do

- **KeenIcon n'est pas accessible** dans cet environnement. Les UI kits utilisent **Lucide en stand-in** partout. Action requise : substituer KeenIcon au moment de l'implémentation réelle.
- **Polices** :
  - **Montserrat** — **self-hostée** depuis `fonts/` (18 fichiers TTF, Thin → Black + italics). Tous les poids 100 → 900 sont câblés dans `colors_and_type.css` via `@font-face`. La charte n'utilise que 700 & 800, mais tout est disponible.
  - **Inter** — chargée depuis **Google Fonts CDN** (400, 500, 600, 700). Aucun fichier TTF n'a été fourni. Si tu veux self-hoster, récupère Inter depuis [google-webfonts-helper](https://gwfh.mranftl.com/fonts) et ajoute les blocs `@font-face` correspondants au début de `colors_and_type.css`.
- **Favicon, logos, illustrations** : générés ici pour respecter la charte (wordmark Montserrat 800 bicolor + 360 accent-500). Remplacer par les assets finaux dès production.
- **Dark mode** : les tokens sont mappés dans `colors_and_type.css` (`.dark { … }`) mais les UI kits sont affichés en **light par défaut**. Un toggle est disponible.
