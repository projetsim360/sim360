# Redesign premium du Hub Simulation (sous-projet A) — Design

> Branche : `feat/onboarding-redesign`. Suite du redesign Simex pro (onboarding, agent PMO, dashboard apprenant). Palette : Deep Blue (`--brand-700` #1A2B48) + Warm Orange (`--accent-500` #EE7A3A). Réutilise les primitives déjà créées : `PageHeader`, `Progress` (variants), `KpiTile`, `Sparkline`, `lib/motion`.

## Périmètre

Sous-projet **A — Hub Simulation** uniquement. **4 pages** :
- `simulations-list` — la liste/galerie des simulations de l'apprenant.
- `create-simulation` — catalogue + générateur IA + dialog détail scénario.
- `simulation-detail` — **fusionnée avec** `simulation-dashboard` → devient le **Cockpit** (page unique de pilotage).
- `simulation-dashboard` — **supprimée** (route `/simulations/:id/dashboard` redirige vers `/simulations/:id`).

Les sous-projets **B (Décisions)**, **C (Événements)**, **D (Réunions IA)**, **E (Projet : équipe/livrables/timeline/kpi-history)** suivront dans des specs séparés. Hors scope ici.

## Décisions validées

1. **Fusion** `simulation-detail` + `simulation-dashboard` en une seule page **Cockpit** (route `/simulations/:id`).
2. **Layout A — Pilotage classique** pour le Cockpit : header riche → strip phases → 5 jauges KPI → Actions/Timeline 1/1 → barre PMO sombre.
3. **Liste & Création** : pas de refonte structurelle (l'UX actuelle est solide). Reskin palette + accents français + remplacement `Toolbar` (layout-6) → `PageHeader`.
4. Tendances/sparklines des KPI : **non** sur cette itération (les KPI ont une vraie page d'historique `kpi-history-page` qui n'est pas dans le scope A).

## Architecture des fichiers

```
features/simulation/
├── pages/
│   ├── simulations-list.tsx          (reskinné)
│   ├── create-simulation.tsx         (reskinné)
│   ├── simulation-detail.tsx         → réécrit = Cockpit
│   └── simulation-dashboard.tsx      → SUPPRIMÉ
├── config/
│   └── simulation.routes.tsx         (redirige /:id/dashboard → /:id)
└── components/                       (NOUVEAUX)
    ├── kpi-gauge.tsx                 — jauge radiale + valeur + label + trend + sous-ligne
    ├── cockpit-header.tsx            — header projet (titre, statut, phase, actions)
    ├── cockpit-phase-strip.tsx       — 5 segments de phases avec labels
    ├── cockpit-actions-card.tsx      — « X actions prioritaires »
    ├── cockpit-timeline-card.tsx     — flux timeline
    ├── cockpit-pmo-banner.tsx        — bande sombre brand, ouvre le panneau PMO
    └── scenario-card.tsx             — carte scénario (extraite de create-simulation pour réutilisation)
```

Primitives existantes réutilisées : `Progress` (variant brand/accent/success/warning — pour les barres de progression simples), `staggerContainer`/`staggerItem` du `lib/motion`, `useShellState().setPmoOpen` pour ouvrir le panneau PMO du shell. `KpiTile` et `Sparkline` (créés à la T6/T5 du dashboard) ne sont pas réutilisés ici — les jauges du Cockpit et de la liste sont radiales, pas tuiles.

## Données

Pas d'ajout backend nécessaire. L'API existante couvre tout :
- `simulationApi.getSimulation(id)` — payload riche (`Simulation` : `project`, `scenario`, `kpis`, `phases[]`, `decisions[]`, `randomEvents[]`, `meetings[]`).
- `simulationApi.getTimeline(id)` — entries.
- `useKpiSocket(id, onUpdate)` — temps réel KPI.
- `simulationApi.pauseSimulation` / `resumeSimulation` / `advancePhase`.
- `simulationApi.getScenarios`, `getRecommendedScenarios`, `generateScenario`, `createSimulation` pour la création.

> Note : on n'utilise plus `getSimulationDashboard` (l'ancienne route `/simulations/:id/dashboard` payload est redondante avec `getSimulation`). On le retire de l'usage front mais on **garde la méthode** dans `simulation.api.ts` (peut servir à d'autres modules ; ne pas supprimer agressivement).

## Page 1 — Cockpit (`simulation-detail.tsx` réécrite)

### Layout (du haut vers le bas)

1. **`PageHeader`** breadcrumbs `[Tableau de bord → Simulations → {projet}]`, title court (« Cockpit »), subtitle masqué.
2. **`<CockpitHeader>`** — titre projet en gros (font-display 800, 28-30px, `--brand-700`), méta sous le titre :
   - Pills : statut (`Brouillon|Passation|En cours|En pause|Terminée|Abandonnée` — accents complets), phase courante (« Phase N sur 5 · {nom} », ton selon `phaseTone`), badge actions urgentes (« 3 décisions à trancher », warning).
   - Méta texte : « Sprint {N} · démarré il y a {durée} ».
   - À droite : `Button outline` « Mettre en pause » (ou « Reprendre » selon statut), `Button primary` accent « Phase suivante → » — désactivé via `DisabledWithTooltip` si pas de phase suivante OU décisions en attente bloquantes.
3. **`<HandoverBanner>`** — conservé (existant), affiché si statut `ONBOARDING`. Reskinné si besoin (palette tokens).
4. **`<CockpitPhaseStrip>`** — 5 segments + libellés inline :
   - Segment phase `COMPLETED` → barre `--success-500`, label `--success-700` `✓ {nom}`.
   - Segment phase `ACTIVE` → barre `--accent-500`, label `--accent-700` `● {nom}`.
   - Segment future → barre `--brand-100`, label `--neutral-400`.
   - Repose sur les données `sim.phases[]` (n'est pas figé à 5).
5. **5 `<KpiGauge>`** (`<Tooltip>` conservé sur chaque) — grid 5 colonnes (2 cols mobile, 5 cols lg). Chaque jauge :
   - Anneau radial SVG 56px, segment coloré selon valeur (succès≥70 / warning 40-69 / erreur <40), inversé pour `risque`.
   - Valeur centrale en font-display 800, label uppercase 10px `--neutral-400`, sous-ligne courte contextuelle (« 52 k€ restants sur 60 k€ », « 5j de retard », « API en alerte »).
   - Indicateur de tendance optionnel (↑/↓/→ + delta) en haut à droite, ton up/down/neutral. Ce delta n'existe pas dans l'API → omis pour cette itération (l'indicateur de tendance reste un slot caché ; à activer quand backend exposera un delta).
   - Mise à jour live via `useKpiSocket`.
6. **2 colonnes : `<CockpitActionsCard>` + `<CockpitTimelineCard>`** (grid 1/1 sur lg, empilé < lg) :
   - **Actions card** : titre « {N} actions prioritaires », liste agrégée tri par urgence : décisions en attente (icône `?` accent), événements non répondus (icône `flash` warning, pill `severity`), réunions à démarrer (icône `message-text` brand), livrables à soumettre (icône `document` success). Chaque ligne `<Link>` vers la sous-page concernée. Vide → `EmptyState` « Tout est à jour ».
   - **Timeline card** : entries `simulationApi.getTimeline(id)` reskinées (pastilles icônes tonées, métas date courte « Hier · 14:30 », « il y a 3j »). Lien « Filtrer » (non bloquant — peut ouvrir un popover plus tard ; v1 = no-op visuel ou retiré). État vide existant conservé.
7. **`<CockpitPmoBanner>`** — bande pleine largeur sombre `--brand-700`, rond accent + sparkles, texte court (« Votre coach vous accompagne · {message bref si disponible} »), CTA « Ouvrir le coach → » qui appelle `useShellState().setPmoOpen(true)` (réutilisé du dashboard).

### États
- **Loading** : skeletons par section (header + phase strip + 5 jauges + 2 cards).
- **Error** : carte « Impossible de charger cette simulation » + bouton « Réessayer » (palette Simex).
- **Statuts** `COMPLETED`/`ABANDONED` : actions Pause/Phase suivante désactivées ; un lien « Voir le débriefing → » apparaît dans le header (route `/valorisation/{id}/debriefing` existante, hors scope strict mais lien utile).

### Composants détaillés

#### `KpiGauge`
Props :
```ts
{ kpiKey: 'budget'|'schedule'|'quality'|'teamMorale'|'riskLevel';
  label: string; value: number; inverse?: boolean;
  caption?: string;  // sous-ligne contextuelle générée par cockpit
  trend?: { delta: number; tone: 'up'|'down'|'neutral' } | null; // null pour v1
}
```
Couleur du segment radial dérivée de la valeur (`>=70` succès / `40-69` warning / `<40` erreur), `inverse` pour risque. Tooltip d'aide (textes existants `KPI_TOOLTIPS` conservés, accents corrigés). Animation : remplissage du segment au mount via `requestAnimationFrame` (motif du `Progress`).

#### `CockpitHeader`, `CockpitPhaseStrip`, `CockpitActionsCard`, `CockpitTimelineCard`, `CockpitPmoBanner`
Composants self-contained — chacun n'a qu'une responsabilité, props explicites. Tous typés et testés via typecheck. Pas de re-fetch — reçoivent la `Simulation` (ou sous-fragment) en props pour permettre le ré-emploi.

## Page 2 — Liste des simulations (`simulations-list.tsx` reskinnée)

Structure inchangée : tabs (`Toutes | En cours | Terminées`), grille de cartes, état vide.

**Modifications** :
- `Toolbar` → `PageHeader` (breadcrumbs `[Tableau de bord → Simulations]`, title « Mes simulations », action « + Nouvelle simulation »).
- Tabs : palette accent sur l'onglet actif (`border-b-2 border-[var(--accent-500)] text-[var(--accent-700)]`).
- Carte simulation reskinnée :
  - Bordure & hover : `border-border` / `hover:border-[var(--accent-300)]/40`.
  - Statut + dot toné palette Simex (pas `bg-brand-500` ambigu — utiliser `--success-500`/`--accent-500`/`--neutral-400`).
  - Titre `font-display` 700 `--brand-700`, sous-titre scénario `--neutral-500`.
  - Badges méta secteur/difficulté/décisions : pills Simex tokenisés.
  - Strip de phases : on garde des `<div>` segmentés (1 div par phase) — `Progress` est mono-segment et ne s'adapte pas ici. Couleurs tokenisées : `--success-500` (`COMPLETED`), `--accent-500` (`ACTIVE`), `--brand-100` (futur).
  - Mini-jauges KPI compactes : on **garde le `MiniGauge` local** (5 jauges 40px), reskinnées tokens. Pas de refonte du composant.
- Accents français complets : `Terminées`, `Abandonnée`, `Réessayer`, `Non démarré`, `Terminé`, `Débutant`, `Intermédiaire`, `Avancé`, `décision(s)`.
- Animation : entrée stagger des cartes (`staggerContainer` + `staggerItem`).

## Page 3 — Création (`create-simulation.tsx` reskinnée)

Structure inchangée : 2 onglets (`catalog` / `generate`), section « Recommandés pour vous », grille de cartes scénarios, Dialog 820px (détail + bouton Lancer).

**Modifications** :
- `Toolbar` → `PageHeader` (breadcrumbs `[Tableau de bord → Simulations → Nouvelle]`, title « Nouvelle simulation »).
- Onglets stylisés palette accent (cohérent avec la liste).
- **Extraction de `ScenarioCard`** (composant) — la carte est réutilisée à la fois dans « Recommandés » et dans la grille principale ; aujourd'hui dupliquée inline dans le fichier. La sortir réduit la taille (783 lignes → cible < 500).
- Carte scénario : `font-display` titre, palette pills (`--accent-500` pour « Recommandé », couleurs difficulté tokenisées).
- Dialog : titre Montserrat, sections internes en `--brand-700`, bouton « Lancer la simulation » accent, secondaire « Annuler » outline.
- Onglet « Générer IA » : reskin du formulaire (Input/Textarea/Select alignés palette).
- Accents français : `Recommandés pour vous`, `Débutant`, `Intermédiaire`, `Avancé`, `Très bas`, `Très haut`, `Évènement`/`Événement`, etc.

## Routes

Dans `config/simulation.routes.tsx` : ajouter une redirect explicite de `/simulations/:id/dashboard` → `/simulations/:id` (via `<Navigate to="..." replace />`). La méthode API `getSimulationDashboard` reste exposée mais n'a plus de consommateur dans cette feature.

## Animations & UX (réutilise `lib/motion.ts`)
- Cockpit : entrée du header (fade+up), stagger sur les 5 KPI, stagger sur les items des deux cards.
- Jauges : remplissage radial animé au mount, respecte `prefers-reduced-motion` (`motion-reduce:transition-none`).
- Liste : stagger cartes, hover lift léger (`whileHover` `-translate-y-0.5`).
- Dialog création : transition Radix conservée.

## Responsive (mobile-first, obligatoire)
- Cockpit : header empile (actions sous le titre), strip phases scroll horizontal si étroit, KPI passe 5→2 colonnes (mobile) → 5 (lg), Actions/Timeline empilent.
- Liste : grille 1/2/3 colonnes (mobile/md/xl), inchangé.
- Création : Dialog passe en plein écran < md (déjà le cas via Radix).
- Touch targets ≥ 40px, labels tronqués proprement.

## Accessibilité
- Tooltips KPI explicites (existants), repris au nouveau composant.
- Couleur de statut **toujours doublée** par une icône (✓, ●, ⏸, ✕) ou un texte explicite.
- Boutons d'action désactivés annoncés via `DisabledWithTooltip` (existant) avec raison (« Aucune phase suivante » / « 3 décisions à trancher d'abord »).
- Focus visibles ; navigation clavier sur tabs (liste & création) déjà gérée.

## Vérification (pas de runner de tests front ni API)
- `pnpm --filter @sim360/api typecheck` (devrait rester vert — pas de change backend).
- `pnpm --filter @sim360/webapp typecheck` vert.
- Navigateur (Playwright + token injection user `admin@sim360.dev`/`Admin123!`) :
  - `/simulations` → grille reskinée, tabs fonctionnels, accents.
  - `/simulations/new` → catalogue + générer, click sur scénario ouvre Dialog, lancer redirige sur Cockpit.
  - `/simulations/:id` (Cockpit) : header + phase strip + 5 jauges (live update si KPI socket émet) + actions + timeline + bande PMO (clic ouvre le panneau).
  - `/simulations/:id/dashboard` → redirige automatiquement.
  - Responsive mobile + `prefers-reduced-motion`.
  - Pas d'erreur console.

## Hors scope (rappel pour ne pas dériver)
- Pas de redesign : `decisions-list`, `decision-page`, `events-list`, `random-event-page`, `kpi-history-page`, `timeline-page`, `project-detail`, `project-team`, `project-deliverables`, ni les pages `meetings`. Ces pages sont des sous-projets B/C/D/E, ultérieurs.
- Pas d'ajout backend (l'API existante suffit).
- Pas de nouveau composant UI partagé (`Progress`/`KpiTile`/`Sparkline` existent déjà ; on n'en crée pas d'autre dans `components/ui/`).
- Pas de modification de l'agent PMO du shell — seulement on l'ouvre depuis le Cockpit.
