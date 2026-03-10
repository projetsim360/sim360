# ProjectSim360 — Design Epure (Style Agendrix)

> **Version** : 1.0
> **Date** : 2026-03-09
> **Reference visuelle** : Agendrix — SaaS quebecois reconnu pour son design ultra-clean
> **Objectif** : Passer d'un design "enterprise classique" a un design epure, aerien, moderne — ou chaque pixel respire.

---

## Table des matieres

1. [Analyse du style de reference](#1-analyse-du-style-de-reference)
2. [Nouvelle palette — Couleurs sourdes](#2-nouvelle-palette--couleurs-sourdes)
3. [Principes de design](#3-principes-de-design)
4. [Sidebar epuree](#4-sidebar-epuree)
5. [Typographie et espacement](#5-typographie-et-espacement)
6. [Cartes et conteneurs](#6-cartes-et-conteneurs)
7. [Tableaux et listes](#7-tableaux-et-listes)
8. [Boutons et formulaires](#8-boutons-et-formulaires)
9. [Badges et statuts](#9-badges-et-statuts)
10. [Icones](#10-icones)
11. [Pages cles — Redesign](#11-pages-cles--redesign)
12. [Micro-details](#12-micro-details)
13. [Plan d'implementation](#13-plan-dimplementation)
14. [Inventaire des fichiers](#14-inventaire-des-fichiers)

---

## 1. Analyse du style de reference

### Ce qui rend Agendrix exceptionnel

| Aspect | Observation |
|--------|-------------|
| **Couleurs** | Palette extremement sourde — teal desature (#3d8c82 environ) + corail doux (#e8845f). Jamais de couleurs vives. |
| **Fonds** | Blanc pur ou blanc legerement teinte (chaud). Pas de gris froid. |
| **Ombres** | Quasi-inexistantes. Ombres tres douces, a peine visibles (`shadow-xs` ou `shadow-none`). Les cartes "flottent" par la couleur de fond, pas par l'ombre. |
| **Bordures** | Presque aucune bordure visible. Separation par espace blanc ou fond different. |
| **Coins** | Tres arrondis — `rounded-xl` (12px) a `rounded-2xl` (16px) partout. |
| **Typographie** | Legere et aerienne. Titres en `font-medium` (pas bold). Corps en `font-normal`. Gris doux pour le texte secondaire. |
| **Espacement** | Genereux. Tout respire. Padding `p-5` a `p-6`. Gaps `gap-4` a `gap-6`. |
| **Sidebar** | Fond colore DOUX (pas un gradient intense). Icones fines. Texte blanc/clair. Tres epuree — pas de bordures, pas de separateurs lourds. |
| **Tables** | Lignes fines a peine visibles. Hauteur de ligne genereuse. Pas de fond alterne. |
| **Badges** | Petits, en texte colore — pas de badges lourds avec fond plein. Plutot `text-sm font-medium text-[color]` sans fond. |
| **Icones** | Style outline/thin. Jamais lourdes ou remplies. |

### La formule Agendrix

> **Blanc + couleur sourde + espace = elegance**

La beaute vient du VIDE, pas du plein. Moins il y a d'elements visuels, plus chaque element a d'impact.

---

## 2. Nouvelle palette — Couleurs sourdes

### 2.1 Philosophie

Les couleurs originales (#4b2f95 violet vif, #f14f1a orange vif) sont trop intenses pour un design epure. On les **desature et adoucit** pour obtenir des tons sourds, chaleureux, elegants.

### 2.2 Violet sourd — derive de #4b2f95

On desature et eclarcit le violet pour obtenir un ton doux, presque "lavande profond" :

```
Violet sourd principal : #6b5b95   (desature, plus doux)
Violet sourd clair     : #8a7daa   (pour hover, icones actives)
Violet sourd pale      : #b0a5c7   (pour texte secondaire sur fond sombre)
```

Palette complete :

```
violet-50:  #f7f5fa   — Fond subtil (a peine teinte)
violet-100: #eeebf5   — Fond sections
violet-200: #ddd7ea   — Bordures actives
violet-300: #b0a5c7   — Texte light sur fond sombre
violet-400: #8a7daa   — Hover, icones
violet-500: #6b5b95   — PRIMAIRE SOURD — sidebar, badges, liens actifs
violet-600: #5a4c80   — Hover boutons
violet-700: #49406b   — Pressed state
violet-800: #393258   — Fond sombre sidebar
violet-900: #2a2543   — Dark mode surfaces
violet-950: #1c1830   — Dark mode fond
```

### 2.3 Orange sourd — derive de #f14f1a

On desature l'orange vers un **corail/peche chaud** :

```
Corail sourd principal : #d4836a   (peche chaud, doux)
Corail sourd clair     : #e89e85   (hover, accents legers)
Corail sourd pale      : #f4c4b3   (fonds accent)
```

Palette complete :

```
corail-50:  #fdf6f3   — Fond subtil (chaleur a peine perceptible)
corail-100: #faeae3   — Fond accent doux
corail-200: #f4d0c3   — Bordures accent
corail-300: #e89e85   — Icones accent, hover
corail-400: #d4836a   — ACCENT SOURD — CTA, badges urgents
corail-500: #c06e55   — Hover CTA
corail-600: #a85c47   — Pressed CTA
corail-700: #8a4b3a   — Dark accent
```

### 2.4 Les 2 couleurs vives en reserve

Les couleurs vives originales (#4b2f95 et #f14f1a) ne disparaissent pas — elles sont utilisees **uniquement** pour :
- Le gradient du logo/branding
- La landing page (marketing)
- Les CTA de conversion extremement importants (1 par page max)

Dans l'app au quotidien, on utilise les versions sourdes.

### 2.5 Fond et neutres

```
Fond principal : #fafafa  — Blanc tres legerement gris (pas froid)
Fond carte     : #ffffff  — Blanc pur
Fond sidebar   : #6b5b95  — Violet sourd (plein, pas gradient)
Fond dark      : #1c1830  — Violet tres sombre

Texte principal    : #2d2b33  — Presque noir, legerement chaud
Texte secondaire   : #8b8694  — Gris doux, desature
Texte sur sidebar  : rgba(255,255,255,0.85)  — Blanc doux
Bordure            : #eae8ee  — Gris-violet tres pale
Bordure hover      : #ddd7ea  — Violet-200
```

### 2.6 Palette semantique (adoucie aussi)

| Role | Avant | Apres (sourd) | Hex |
|------|-------|---------------|-----|
| Success | emerald-500 (#10b981) | Vert sauge | #5da387 |
| Warning | amber-500 (#f59e0b) | Ambre doux | #d4a04a |
| Destructive | red-500 (#ef4444) | Rouge brique | #c75a5a |
| Info | violet-400 | Violet sourd | #8a7daa |

Les fond light de ces couleurs semantiques :
- Success light : #f0f7f4
- Warning light : #fdf7ec
- Destructive light : #fdf0f0
- Info light : #f7f5fa

### 2.7 Couleurs des charts KPI (sourdes)

| KPI | Couleur | Hex sourd |
|-----|---------|-----------|
| Budget | Violet | #6b5b95 |
| Delai | Corail | #d4836a |
| Qualite | Vert sauge | #5da387 |
| Moral | Ambre doux | #d4a04a |
| Risque | Rouge brique | #c75a5a |

---

## 3. Principes de design

### 3.1 Les 7 regles du design epure

**R1 — L'espace blanc est un element de design**
Chaque section a un padding genereux. On ne cherche pas a remplir l'espace. Un ecran avec 40% d'espace vide est plus elegant qu'un ecran rempli a 90%.

**R2 — Moins de bordures, plus de fond**
Au lieu de `border border-border`, utiliser un changement de couleur de fond : `bg-[#f7f5fa]` sur fond `bg-white`. La difference de 2% de luminosite suffit.

**R3 — Ombres a peine visibles**
`shadow-none` ou `shadow-xs` maximum. Jamais `shadow-md` ou `shadow-lg` (sauf au hover de cartes cliquables, et encore : `shadow-sm` suffit).

**R4 — Coins genereux**
`rounded-xl` (12px) pour les cartes, `rounded-lg` (8px) pour les boutons et inputs, `rounded-full` pour les avatars et badges.

**R5 — Typographie legere**
- Titres : `font-medium` (500), pas `font-bold` (700)
- Sous-titres : `font-normal` (400) + `text-muted-foreground`
- Seules les valeurs numeriques importantes sont en `font-semibold` (600)
- Jamais `font-bold` sauf pour les hero headings

**R6 — Couleur par parcimonie**
Maximum 2 elements colores par section. Tout le reste est en nuances de gris. La couleur attire l'oeil exactement ou il faut.

**R7 — Icones fines**
Style `outline` ou `duotone` fin. Jamais `solid` ou `filled` lourd (sauf pour les etats actifs du menu).

### 3.2 Comparaison avant/apres

| Element | Avant (actuel) | Apres (epure) |
|---------|----------------|---------------|
| Carte | `shadow-xs border rounded-lg` | `rounded-xl shadow-none border-0 bg-white` sur fond #fafafa |
| Titre card | `text-base font-semibold` | `text-base font-medium text-foreground` |
| Badge statut | `Badge variant="primary" appearance="light"` (fond colore) | Texte simple : `text-sm font-medium text-[#6b5b95]` avec dot colore |
| Bouton primaire | `bg-primary shadow-xs` | `bg-[#6b5b95] rounded-lg shadow-none hover:bg-[#5a4c80]` |
| Bordure carte | `border border-border` | `border-0` ou `border border-[#eae8ee]` (a peine visible) |
| Ombre hover | `hover:shadow-lg hover:scale-[1.01]` | `hover:shadow-sm transition-shadow` (subtil) |
| Sidebar | Gradient violet intense | Couleur pleine `bg-[#6b5b95]` (un seul ton, pas de gradient) |
| Input focus | `ring-[3px] ring-primary/30` | `ring-2 ring-[#6b5b95]/20` (plus fin) |

---

## 4. Sidebar epuree

### 4.1 Changements

| Aspect | Actuel | Epure |
|--------|--------|-------|
| Fond | Gradient `from-[#4b2f95] to-[#301d60]` | Couleur pleine `bg-[#6b5b95]` (pas de gradient) |
| Dark mode | `from-[#0f081f] to-[#190e33]` | `bg-[#2a2543]` (un seul ton) |
| Item actif | `bg-white/15 border-l-3 border-[#f14f1a]` | `bg-white/12 rounded-lg` (pas de bordure gauche, juste un fond doux) |
| Item hover | `bg-white/10` | `bg-white/8` (encore plus subtil) |
| Texte | `text-white/80` | `text-white/75` (un chouia plus doux) |
| Section titles | `text-white/40 uppercase tracking-wider text-[0.65rem] font-semibold` | `text-white/35 uppercase tracking-widest text-[0.6rem] font-medium` |
| Badges compteur | `bg-[#f14f1a] text-white` | `bg-[#d4836a] text-white` (corail sourd) |
| Separateurs | `border-white/10` | Retirer les separateurs — utiliser l'espace pour separer |
| Logo area | `bg-white/5` | `bg-white/5` (garder, c'est subtil) |
| Collapse button | Visible | Plus petit, discret |

### 4.2 Espacement

- Augmenter le padding vertical entre les items : `py-2` → `py-2.5`
- Augmenter l'espace entre les sections : `mt-4` → `mt-6`
- L'ensemble doit respirer davantage

---

## 5. Typographie et espacement

### 5.1 Poids des fontes

| Element | Actuel | Epure |
|---------|--------|-------|
| Page title (ToolbarHeading) | `font-semibold` (600) | `font-medium` (500) |
| Card title (CardTitle) | `font-semibold` | `font-medium` |
| Section heading dans card | `font-semibold` | `font-medium` |
| Stat value | `font-bold` | `font-semibold` |
| Body text | `font-normal` | `font-normal` (inchange) |
| Label/caption | `text-sm` | `text-sm font-normal` |

**Important** : Ne modifier le composant CardTitle QUE dans `card.tsx` pour impacter toute l'app.

### 5.2 Espacement global

| Element | Actuel | Epure |
|---------|--------|-------|
| Card padding (CardContent) | `p-5` (20px) | `p-6` (24px) |
| Gap entre cards | `gap-4` a `gap-5` | `gap-5` a `gap-6` |
| Toolbar height | `min-h-14` | `min-h-16` (plus d'air dans le header) |
| Page container padding | `p-5` | `p-6 lg:p-8` |

### 5.3 Couleur du texte

| Usage | Actuel | Epure |
|-------|--------|-------|
| Texte principal | `text-foreground` (#111827 slate-900) | `text-foreground` (#2d2b33 — noir chaud) |
| Texte secondaire | `text-muted-foreground` (#6b7280 slate-500) | `text-muted-foreground` (#8b8694 — gris doux) |
| Bordures | `border-border` (#e2e8f0 slate-200) | `border-border` (#eae8ee — gris-violet) |

---

## 6. Cartes et conteneurs

### 6.1 Card component

Modifier le composant `card.tsx` :

```
Actuel :  rounded-lg border shadow-xs
Epure  :  rounded-xl border-0 shadow-none
```

Sur un fond `bg-[#fafafa]`, les cartes blanches se distinguent naturellement sans bordure ni ombre. Si une bordure est necessaire (en cas de fond blanc sur blanc), utiliser `border border-[#eae8ee]` — une bordure a peine visible.

### 6.2 CardHeader

```
Actuel :  min-h-14 border-b px-5
Epure  :  min-h-14 px-6 border-0
```

Retirer la bordure inferieure du header. Utiliser l'espace pour separer visuellement header et contenu.

### 6.3 Cards cliquables (hover)

```
Actuel :  hover:shadow-md hover:scale-[1.01]
Epure  :  hover:shadow-sm hover:border-[#ddd7ea] transition-all duration-200
```

Le hover est SUBTIL — un micro-shadow et un leger changement de bordure. Pas de scale.

---

## 7. Tableaux et listes

### 7.1 Style des tables

Les tables dans le style Agendrix :
- Pas de bordure externe
- Lignes separees par un trait ultra-fin (`border-b border-[#eae8ee]`)
- Pas de fond alterne (`striped` off)
- Hauteur de ligne genereuse : `h-14` minimum
- Header : texte `text-xs font-medium text-muted-foreground uppercase tracking-wider`
- Cellules : `text-sm font-normal text-foreground`

### 7.2 Listes de cartes

Pour les listes en grille (simulations, campagnes, livrables) :
- `gap-5` entre les cartes
- Cartes sans bordure sur fond #fafafa
- Hover : `shadow-sm` subtil
- Pas de scale transform

---

## 8. Boutons et formulaires

### 8.1 Boutons

| Variant | Actuel | Epure |
|---------|--------|-------|
| Primary | `bg-[#4b2f95] shadow-xs rounded-md` | `bg-[#6b5b95] shadow-none rounded-lg hover:bg-[#5a4c80]` |
| Accent | `bg-[#f14f1a] shadow-xs` | `bg-[#d4836a] shadow-none rounded-lg hover:bg-[#c06e55]` |
| Gradient | `from-[#4b2f95] to-[#f14f1a] shadow-md` | **Retirer** — le gradient n'a pas sa place dans un design epure. Remplacer par `primary`. |
| Secondary | `bg-slate-100` | `bg-[#f7f5fa] text-[#6b5b95] rounded-lg border-0 hover:bg-[#eeebf5]` |
| Ghost | transparent | `text-[#6b5b95] hover:bg-[#f7f5fa] rounded-lg` |
| Outline | `border border-input` | `border border-[#eae8ee] rounded-lg hover:border-[#ddd7ea] hover:bg-[#f7f5fa]` |

**Tailles** : augmenter la hauteur des boutons de 2px pour plus de confort :
- `lg`: h-10 → h-11
- `md`: h-8.5 → h-9
- `sm`: h-7 → h-7.5

**Rayon** : tous les boutons en `rounded-lg` (8px) au lieu de `rounded-md` (6px).

### 8.2 Inputs

| Aspect | Actuel | Epure |
|--------|--------|-------|
| Bordure | `border-input shadow-xs` | `border-[#eae8ee] shadow-none` |
| Focus | `ring-[3px] ring-primary/30` | `ring-2 ring-[#6b5b95]/15 border-[#6b5b95]/40` |
| Rayon | `rounded-md` | `rounded-lg` |
| Fond | `bg-background` | `bg-white` |
| Taille | h-8.5 | h-9 (un chouia plus grand) |

---

## 9. Badges et statuts

### 9.1 Approche Agendrix

Agendrix n'utilise presque pas de badges avec fond. Les statuts sont affiches comme du **texte colore** avec un petit **dot** rond devant.

### 9.2 Nouveau pattern de statut

Au lieu de :
```tsx
<Badge variant="primary" appearance="light" size="sm">En cours</Badge>
```

Proposer un pattern plus epure :
```tsx
<span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b5b95]">
  <span className="w-1.5 h-1.5 rounded-full bg-[#6b5b95]" />
  En cours
</span>
```

### 9.3 Creer un composant StatusDot

```typescript
// apps/webapp/src/components/ui/status-dot.tsx (NOUVEAU)
interface StatusDotProps {
  status: string;
  label: string;
  size?: 'sm' | 'md';
}

// Mapping interne
const STATUS_COLORS = {
  DRAFT: '#8b8694',       // Gris doux
  IN_PROGRESS: '#6b5b95', // Violet sourd
  ACTIVE: '#6b5b95',
  COMPLETED: '#5da387',    // Vert sauge
  PAUSED: '#d4a04a',       // Ambre doux
  ABANDONED: '#c75a5a',    // Rouge brique
  PENDING: '#d4a04a',
  SUBMITTED: '#8a7daa',
  EVALUATED: '#6b5b95',
  VALIDATED: '#5da387',
  REJECTED: '#c75a5a',
  CLOSED: '#8b8694',
  ARCHIVED: '#8b8694',
};
```

Usage : Remplacer les `<Badge>` de statut dans les listes par `<StatusDot>`. Garder les `<Badge>` pour les compteurs et les categories (pas les statuts).

---

## 10. Icones

### 10.1 Style epure

| Actuel | Epure |
|--------|-------|
| `style="duotone"` partout | `style="outline"` par defaut |
| `style="solid"` pour actions | `style="duotone"` pour actions importantes |
| `style="filled"` pour alertes | `style="outline"` avec couleur d'alerte |

**Hierarchie d'icones epuree** :
- **Navigation sidebar** : `outline` (fins, legers)
- **En-tetes de section** : `outline` (discret)
- **Boutons d'action** : `duotone` (un peu plus de poids)
- **Indicateurs de statut** : `outline` + couleur
- **Decoratif (empty states)** : `duotone` (plus expressif)

### 10.2 Taille et couleur

- Icones sidebar : `size-[18px]` (entre 4 et 5) — ni trop petit, ni trop gros
- Icones dans les cartes : `size-4` (16px)
- Couleur par defaut : `text-muted-foreground` (pas text-foreground — trop lourd)
- Couleur active : `text-[#6b5b95]`

---

## 11. Pages cles — Redesign

### 11.1 Dashboard

```
┌───────────────────────────────────────────────────────────────┐
│                                                                │
│  Bonjour Marie                               [btn: + Simulation]│
│  Voici votre espace de gestion de projet.                      │
│                                                                │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │  2              │ │  5              │ │  74%            │     │
│  │  En cours       │ │  Terminees      │ │  Score moyen    │     │
│  │  (petit icone)  │ │  (petit icone)  │ │  (petit icone)  │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                │
│  Prochaine etape                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ● 2 decisions en attente dans Projet Alpha              │  │
│  │  [Prendre les decisions →]                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Simulations actives                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Projet Alpha · Phase 3: Execution                        │  │
│  │  Budget 72%  Delai 65%  Qualite 80%    [Reprendre →]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

**Points cles** :
- Pas de hero avec gradient — juste un titre et un sous-titre avec de l'espace
- Stat cards : valeur en `text-2xl font-semibold`, label en `text-sm text-muted-foreground`
- Pas de bordure sur les stat cards — fond blanc sur #fafafa suffit
- Next Step : fond `bg-[#f7f5fa]` (violet-50), pas de bordure
- Simulation active : barre de KPI inline en texte, pas de barres graphiques lourdes
- Icones dans les stats : `size-4 text-muted-foreground` dans un cercle `bg-[#f7f5fa]`

### 11.2 Simulation detail

```
┌───────────────────────────────────────────────────────────────┐
│  Projet Alpha                                                  │
│  Phase 3: Execution              [btn: Phase suivante →]       │
│                                                                │
│  Initiation ── Planning ── Execution ── Monitoring ── Cloture  │
│      ✓            ✓           ●              ○           ○     │
│                                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │ 72%     │ │ 65%     │ │ 80%     │ │ 60%     │ │ 45%     ││
│  │ Budget  │ │ Delai   │ │ Qualite │ │ Moral   │ │ Risque  ││
│  │ ━━━━░░  │ │ ━━━░░░  │ │ ━━━━━░  │ │ ━━░░░░  │ │ ━░░░░░  ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│                                                                │
│  Decisions en attente    Evenements    Reunions                 │
│  ┌──────────────────┐    (aucun)       (aucune)                │
│  │ Decision 1        │                                         │
│  │ Choisir le...    │                                         │
│  └──────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

**Points cles** :
- KPI cards : valeur grande + label petit + barre fine. Fond blanc, pas de fond colore.
- Phase stepper : cercles fins, `check` discret, point plein pour actif. Pas de couleurs vives.
- Sections en onglets ou en vertical scroll, pas en grille dense

### 11.3 Sidebar

```
┌──────────────────┐
│                  │
│  PS360           │  ← Logo discret
│                  │
│  ○ Dashboard     │  ← Icone outline, texte blanc/75
│                  │
│  SIMULATION      │  ← Label section, blanc/35
│  ○ Simulations   │
│  ○ Rapports      │
│                  │
│  RECRUTEMENT     │
│  ○ Campagnes     │
│                  │
│  ADMIN           │
│  ○ Templates     │
│  ○ Documents     │
│                  │
│  ──────────────  │  ← Pas de trait, juste espace
│                  │
│  ○ Mon Profil    │
│  ○ Parametres    │
│                  │
└──────────────────┘
```

Fond : `#6b5b95` (violet sourd uni, PAS de gradient)
Item actif : `bg-white/12 rounded-lg` (fond doux, pas de bordure gauche)
Espace : genereux entre chaque section

---

## 12. Micro-details

### 12.1 Selection text

```css
::selection {
  background-color: rgba(107, 91, 149, 0.15);  /* violet sourd, plus subtil */
}
```

### 12.2 Scrollbar

```css
::-webkit-scrollbar-thumb {
  background-color: rgba(107, 91, 149, 0.2);  /* a peine visible */
  border-radius: 10px;
}
```

### 12.3 Focus ring

```css
--ring: rgba(107, 91, 149, 0.3);  /* Plus doux */
```

Focus visible : `ring-2` (pas ring-[3px]) avec couleur a 20% opacite.

### 12.4 Animations

- Hover cards : `transition-shadow duration-200` (pas transition-all)
- Pas de scale transform — trop "in your face" pour un design epure
- Page transitions : garder le fade-in mais reduire le mouvement y : `y: 4px` au lieu de `y: 8px`
- Duree des transitions : 200ms max, `ease-out`

### 12.5 Fond de l'application

```
Layout background : #fafafa  (blanc gris chaud)
Dark mode         : #1c1830  (violet tres sombre)
```

Ce fond tres legerement teinte fait ressortir les cartes blanches sans avoir besoin de bordures ou d'ombres.

---

## 13. Plan d'implementation

### Vague 1 — Fondation (CSS + composants core)

| # | Tache | Fichier | Detail |
|---|-------|---------|--------|
| 1.1 | Migrer palette vers couleurs sourdes | `globals.css` | Remplacer #4b2f95→#6b5b95, #f14f1a→#d4836a, neutres, semantiques |
| 1.2 | Fond application #fafafa | `globals.css` | --background: #fafafa |
| 1.3 | Texte #2d2b33, muted #8b8694 | `globals.css` | --foreground, --muted-foreground |
| 1.4 | Bordures #eae8ee | `globals.css` | --border, --input |
| 1.5 | Dark mode violet sombre | `globals.css` | --background: #1c1830, etc. |
| 1.6 | Card : rounded-xl, border-0, shadow-none | `card.tsx` | Retirer shadow-xs, border, augmenter radius |
| 1.7 | Card header : retirer border-b | `card.tsx` | Retirer la bordure inferieure |
| 1.8 | Boutons : rounded-lg, shadow-none, hauteur+2px | `button.tsx` | Modifier radius, shadow, sizes |
| 1.9 | Boutons primaire/accent/secondary couleurs sourdes | `button.tsx` | Mettre a jour les couleurs des variants |
| 1.10 | Badge accent couleur sourde | `badge.tsx` | Mettre a jour corail |
| 1.11 | Input : rounded-lg, border-sourd, focus doux | `input.tsx` | Modifier border, focus ring |
| 1.12 | CardContent padding p-6 | `card.tsx` | p-5 → p-6 |
| 1.13 | CardTitle font-medium | `card.tsx` | font-semibold → font-medium |

### Vague 2 — Sidebar + StatusDot

| # | Tache | Fichier | Detail |
|---|-------|---------|--------|
| 2.1 | Sidebar : fond uni #6b5b95 (pas gradient) | `sidebar.tsx` | Retirer gradient, couleur pleine |
| 2.2 | Sidebar items : item actif bg-white/12 rounded-lg | `sidebar-menu-primary.tsx` | Retirer border-l, ajouter rounded |
| 2.3 | Sidebar badges : corail sourd | `sidebar-menu-primary.tsx` | #f14f1a → #d4836a |
| 2.4 | Sidebar header/footer : harmoniser | header, footer | Ajuster couleurs |
| 2.5 | Creer StatusDot composant | `components/ui/status-dot.tsx` (NEW) | Dot + texte colore |
| 2.6 | Context bar : harmoniser | `simulation-context-bar.tsx` | Couleurs sourdes |

### Vague 3 — Pages et details

| # | Tache | Fichier | Detail |
|---|-------|---------|--------|
| 3.1 | Dashboard : hero simplifie (titre + sous-titre) | `dashboard.tsx` | Retirer Card gradient, garder texte simple |
| 3.2 | Dashboard : stat cards epurees | `dashboard.tsx` | Fond blanc, valeur grande, label petit |
| 3.3 | Dashboard : Getting Started + Next Step couleurs sourdes | composants | Fond violet-50, pas de gradient border |
| 3.4 | Simulation detail : KPI cards epurees | `simulation-detail.tsx` | Fond blanc, pas fond colore, barre fine |
| 3.5 | Simulation detail : phase stepper epure | `simulation-detail.tsx` | Cercles fins, couleurs sourdes |
| 3.6 | Simulations list : hover subtil | `simulations-list.tsx` | shadow-sm, pas scale |
| 3.7 | Deliverables list : hover subtil | `deliverables-list-page.tsx` | shadow-sm, pas scale |
| 3.8 | Join campaign : couleurs sourdes | `join-campaign.tsx` | CTA corail, fond sourd |
| 3.9 | Landing page : couleurs sourdes (garder gradients vifs pour marketing) | `landing-page.tsx` | Marketing peut rester plus vif |
| 3.10 | Workflow stepper : couleurs sourdes | `workflow-stepper.tsx` | Violet/corail sourds |
| 3.11 | Icones : passer en outline par defaut dans sidebar | sidebar menus | outline au lieu de duotone |
| 3.12 | Page transitions : reduire mouvement | `main.tsx` | y: 8→4, duration: 0.2→0.15 |

---

## 14. Inventaire des fichiers

### Fichiers CSS (1)
| Fichier | Modifications |
|---------|---------------|
| `src/styles/globals.css` | Palette sourde complete, fond #fafafa, texte #2d2b33, bordures #eae8ee, dark mode, selection, scrollbar, focus ring |

### Fichiers composants UI (5)
| Fichier | Modifications |
|---------|---------------|
| `src/components/ui/card.tsx` | rounded-xl, border-0, shadow-none, p-6, font-medium, retirer border-b header |
| `src/components/ui/button.tsx` | rounded-lg, shadow-none, couleurs sourdes, hauteur+2px, retirer variant gradient |
| `src/components/ui/badge.tsx` | Couleurs sourdes pour accent |
| `src/components/ui/input.tsx` | rounded-lg, border sourd, focus doux |
| `src/components/ui/status-dot.tsx` | NOUVEAU — dot + texte colore pour statuts |

### Fichiers layout (5)
| Fichier | Modifications |
|---------|---------------|
| `layout-6/components/sidebar.tsx` | Fond uni #6b5b95, pas gradient |
| `layout-6/components/sidebar-menu-primary.tsx` | Item actif rounded-lg, badges corail, espacement |
| `layout-6/components/sidebar-header.tsx` | Harmoniser couleurs sourdes |
| `layout-6/components/sidebar-footer.tsx` | Harmoniser couleurs sourdes |
| `layout-6/components/simulation-context-bar.tsx` | Couleurs sourdes |

### Fichiers pages (10+)
| Fichier | Modifications |
|---------|---------------|
| `dashboard/pages/dashboard.tsx` | Hero simplifie, stats epurees |
| `dashboard/components/getting-started-card.tsx` | Fond sourd, retirer gradient border |
| `dashboard/components/next-step-card.tsx` | Fond sourd, retirer gradient border |
| `simulation/pages/simulation-detail.tsx` | KPIs epures, phase stepper sourd |
| `simulation/pages/simulations-list.tsx` | Hover subtil |
| `deliverables/pages/deliverables-list-page.tsx` | Hover subtil |
| `recruitment/pages/join-campaign.tsx` | CTA corail, fond sourd |
| `recruitment/pages/campaign-detail.tsx` | Stats couleurs sourdes |
| `landing-page.tsx` | Couleurs sourdes (marketing reste vif) |
| `layout-6/components/main.tsx` | Transitions reduites |

---

## Resume

| Dimension | Avant | Apres |
|-----------|-------|-------|
| Couleur primaire | #4b2f95 (violet vif) | #6b5b95 (violet sourd) |
| Couleur accent | #f14f1a (orange vif) | #d4836a (corail doux) |
| Fond app | #f8fafc (slate-50 froid) | #fafafa (blanc gris chaud) |
| Texte principal | #111827 (noir froid) | #2d2b33 (noir chaud) |
| Ombres | shadow-xs partout | shadow-none (fond suffit) |
| Bordures | border-slate-200 | border-0 ou #eae8ee a peine visible |
| Coins | rounded-lg (8px) | rounded-xl (12px) cards, rounded-lg (8px) boutons |
| Typographie | font-semibold/font-bold | font-medium (plus leger) |
| Sidebar | Gradient violet intense | Violet sourd uni |
| Badges statut | Badge avec fond colore | Dot + texte colore |
| Hover | shadow-lg + scale | shadow-sm (subtil) |
| Sensation | Enterprise classique | Aerien, epure, premium |

---

> **Estimation** : 2-3 jours
> **Philosophie** : "L'elegance, c'est l'elimination." — Cristobal Balenciaga
