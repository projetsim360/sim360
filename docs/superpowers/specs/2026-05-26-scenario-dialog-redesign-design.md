# Redesign premium du Dialog scénario — Design

> Branche : `feat/onboarding-redesign`. Suite du Hub Simulation redesign déjà mergé sur la branche. Palette Simex (Deep Blue `--brand-700` + Warm Orange `--accent-500`).

## Objectif

Réorganiser de façon **premium** la quantité d'information contenue dans le **Dialog de détail scénario** ouvert depuis `/simulations/new` (clic sur une `ScenarioCard`). Aujourd'hui : tout est sur un long scroll plat, palette ad-hoc (jaune amber, bleu, destructive…). Demain : hiérarchie claire avec **rangée stats premium**, sections cards distinctes, et un **bandeau brownfield sombre brand-700** (façon PMO du Cockpit) pour les scénarios « Reprise en cours ».

## Périmètre

- **1 seul fichier** : `apps/webapp/src/features/simulation/pages/create-simulation.tsx` — le bloc `<Dialog>...</Dialog>` (env. lignes 180-415 dans la version courante).
- Hors scope : le reste de la page (catalogue, génération IA, hero PageHeader, ScenarioCard) — déjà reskinné à la Simex en T11 du précédent plan.
- Pas de changement de logique, de handlers, de fetch, ni de l'API. Pas de change backend.

## Décisions validées

1. **Layout A** : Hero compact (pills, titre, description) → **rangée 4 stats premium** (Phases, Durée, Objectifs, Compétences) → **2 colonnes** (Objectifs + Compétences) → **phase strip horizontal** → **bandeau brownfield sombre** (conditionnel).
2. **Bandeau brownfield = variante 2 (sombre brand-700)** : reprend le langage de la bande PMO du Cockpit (fond `--brand-700`, KPI tiles internes en `rgba(255,255,255,.07)`, accents orange pour les chiffres critiques). Pas de jaune.
3. **Nouveau composant `ScenarioPhaseStrip`** (et **pas** de réutilisation de `CockpitPhaseStrip`) — voir « Architecture des composants » : les scenario phases n'ont pas de `status`, le statut est dérivé de `scenarioType` + `startingPhaseOrder`. On garde le même **langage visuel** (segments tonés) mais composant séparé.

## Architecture des composants

Plutôt que conserver un seul JSX géant inline (le Dialog actuel fait 230 lignes), on **extrait** la moitié haute en un composant dédié pour clarifier :

```
features/simulation/components/
├── scenario-dialog-content.tsx    (NOUVEAU — tout le contenu du Dialog : hero + stats + sections + brownfield + footer)
└── scenario-brownfield-banner.tsx (NOUVEAU — le bandeau sombre brownfield, isolé pour testabilité visuelle)
```

Le wrapper `<Dialog>` (open state, onOpenChange) reste dans `create-simulation.tsx` ; il consomme `<ScenarioDialogContent scenario={...} isGenerated={...} creating={...} onLaunch={...} onClose={...} />`. Ça permet d'isoler le contenu lourd et de réduire `create-simulation.tsx`.

> **Note** : `CockpitPhaseStrip` (créé en T3 du Hub plan) attend des `SimulationPhase` avec `status: 'LOCKED'|'ACTIVE'|'COMPLETED'`. Or les **scenario phases** sont `{ id, name, type, order }` sans statut. On crée donc un nouveau composant `ScenarioPhaseStrip` côté scénario (et non on réutilise CockpitPhaseStrip). Ce strip dérive le statut depuis `scenarioType` + `startingPhaseOrder` (BROWNFIELD : phases avant `startingPhaseOrder` = COMPLETED, phase = startingPhaseOrder = ACTIVE/Départ, après = LOCKED ; GREENFIELD : toutes futures sauf la première = ACTIVE).

Donc en fait :

```
features/simulation/components/
├── scenario-dialog-content.tsx
├── scenario-brownfield-banner.tsx
└── scenario-phase-strip.tsx        (NOUVEAU — proche du CockpitPhaseStrip mais piloté par les données scénario)
```

3 nouveaux composants, tous dans `features/simulation/components/`.

## Données utilisées

Tout vient du type `Scenario` (déjà importé dans `create-simulation.tsx`) :

```ts
{
  id, title, description, sector,
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  scenarioType: 'GREENFIELD' | 'BROWNFIELD',
  startingPhaseOrder: number,
  estimatedDurationHours: number,
  objectives: string[],
  competencies: string[],
  phases: { id, name, type, order }[],
  brownfieldContext: BrownfieldContext | null,
  isPublished?: boolean,
  _count?: { simulations: number },
}
```

`BrownfieldContext` : `previousPmNotes`, `accumulatedDelays`, `budgetUsed`, `knownRisks[]`, `teamMorale` (5 valeurs : very_low/low/neutral/high/very_high → labels Très bas / Bas / Neutre / Haut / Très haut).

État local du parent (préservé) : `isGenerated: boolean`, `creating: boolean`. Reçus comme props.

## Composants — directives

### `ScenarioDialogContent` (le contenu complet)

**Props** :
```ts
{
  scenario: Scenario;
  isGenerated: boolean;
  creating: boolean;
  onLaunch: () => void;
  onClose: () => void;
}
```

**Layout** (du haut vers le bas, scrollable au milieu, footer sticky) :

1. **Hero** (px-6 pt-6 pb-4, fond `linear-gradient(135deg, var(--brand-50), #fff)`, border-bottom `--line`) :
   - Pills row : difficulté (palette tokenisée), type scénario (greenfield brand / brownfield warning), « Généré IA » (brand pill) si `isGenerated`.
   - **DialogTitle** : `font-display text-lg font-extrabold text-[var(--brand-700)] leading-snug`.
   - Description : `text-sm text-[var(--neutral-500)] leading-relaxed`.
   - Tags meta (secteur + count simulations si > 0) en pills `bg-white border border-border text-[var(--neutral-500)]`.

2. **Rangée 4 stats premium** (px-6 py-3, border-bottom `--line`) :
   - Grid 2 cols mobile / 4 cols sm+, `gap-2`.
   - Chaque stat = carte `bg-white border border-border rounded-lg p-3` avec :
     - `lab` : font-bold uppercase 10px `--neutral-400` (« Phases », « Durée », « Objectifs », « Compétences »).
     - `num` : Montserrat 800 18px `--brand-700` (`phases.length`, `estimatedDurationHours` avec suffixe `h` plus petit, `objectives.length`, `competencies.length`).

3. **Body scrollable** (`flex-1 overflow-y-auto`, padding `p-6 space-y-5`) :

   **3a. Section 2 cols** (`grid grid-cols-1 md:grid-cols-2 gap-5`) :
   - **Objectifs** (si `length > 0`) :
     - Overline `Objectifs du scénario`.
     - Items : flex row avec pastille numéro (size-6 rounded-full `bg-[var(--accent-100)] text-[var(--accent-700)]` font-bold 11px) + texte 13px `--brand-700`.
   - **Compétences travaillées** (si `length > 0`) :
     - Overline `Compétences travaillées`.
     - Pills `bg-[var(--brand-50)] text-[var(--brand-700)] border border-[var(--brand-100)] rounded-full px-3 py-1 text-xs font-semibold`.
   - Bloc « Généré par l'IA » si `isGenerated` : sous Compétences, encart fond `--brand-50` border `--brand-100` rounded-lg p-3, texte 12px `--brand-700` (pas de blue ad-hoc).

   **3b. Section phases** (`<ScenarioPhaseStrip />`, voir composant dédié plus bas).

   **3c. Section brownfield** (si `scenarioType === 'BROWNFIELD'` et `brownfieldContext`) : `<ScenarioBrownfieldBanner ctx={brownfieldContext} />`.

4. **Footer sticky** (px-6 py-4, `bg-[var(--bg)]` ou `bg-[var(--neutral-50)]`, border-top `--line`) :
   - `Annuler` (Button outline md) à gauche.
   - `Lancer la simulation` ou `Lancement…` si `creating` (Button primary md accent) à droite.

### `ScenarioPhaseStrip`

**Props** :
```ts
{
  phases: { id: string; name: string; order: number }[];
  scenarioType: 'GREENFIELD' | 'BROWNFIELD';
  startingPhaseOrder: number;
}
```

**Layout** :
- Overline : `Déroulement du projet` ; si `BROWNFIELD`, suffixe accent `— vous démarrez à la phase {startingPhaseOrder + 1}`.
- Strip horizontal (gap-3, items-center) répliquant le langage `CockpitPhaseStrip` : par phase, segment `h-2 w-12 rounded-full` + label phase (text-[11px] font-semibold).
- **Couleurs (palette Simex uniquement)** :
  - Phases BROWNFIELD `order < startingPhaseOrder` (déjà jouées) : segment `--success-500`, label `--success-700` préfixe `✓`.
  - Phase `order === startingPhaseOrder` (départ BROWNFIELD) OU 1ère phase GREENFIELD : segment `--accent-500`, label `--accent-700` préfixe `●` puis « Départ » badge optionnel inline.
  - Phases futures : segment `--brand-100`, label `--neutral-400`.
- Overflow horizontal scroll si étroit (`overflow-x-auto`).

### `ScenarioBrownfieldBanner` (le bandeau sombre — variante 2 validée)

**Props** :
```ts
{ ctx: BrownfieldContext; }
```

**Layout** (rounded-xl, padding 16-18px, fond `--brand-700`, texte blanc) :

1. **Header** : pastille rond size-6 `bg-[var(--accent-500)]` avec icône `KeenIcon` (« arrows-circle » ou équivalent) + colonne avec overline `Contexte de reprise` (text-[10px] font-bold uppercase tracking-[0.8px] `--brand-200`) et titre `Vous reprenez ce projet en cours` (font-display font-bold 14px white).

2. **Citation** (si `previousPmNotes`) : `<p>` italique 13px `--brand-100`, `border-left-2 border-[var(--brand-500)] pl-3`, « `«` {notes} `»` ».

3. **4 KPI tiles** (grid 2 cols mobile / 4 cols sm+, gap-2.5) — chaque tile :
   - `bg-white/10 border border-white/15 rounded-lg p-3`.
   - Valeur Montserrat 800 18-20px :
     - Retard accumulé : `{ctx.accumulatedDelays}j` en `text-[var(--accent-300)]`.
     - Budget consommé : `{Math.round(ctx.budgetUsed * 100)}%` en `text-[var(--accent-300)]`.
     - Risques actifs : `{count active}` en blanc (rouge si >= 3 : `text-[#FCA5A5]` une variante accessible sur sombre).
     - Moral équipe : label localisé via `MORALE_LABELS` (déjà défini en haut de `create-simulation.tsx` : `very_low: 'Très bas'`, etc.) en blanc 14px. **Le composant `ScenarioBrownfieldBanner` redéfinit son propre map local** (`MORALE_LABELS`) pour rester autonome.
   - Label sous la valeur : 9px font-bold uppercase `--brand-200`.

4. **Risques identifiés** (si `knownRisks.length > 0`) :
   - Overline « Risques identifiés » 10px `--brand-200`.
   - Liste : par risque, ligne `bg-white/10 border border-white/15 rounded-md py-1.5 px-2.5` avec :
     - Dot 6px coloré par sévérité (CRITICAL `--error-500`, HIGH `--accent-500`, MEDIUM `--warning-500`, LOW `--brand-300`).
     - Titre 12px text-white flex-1.
     - Pill statut (ACTIVE `bg-white/15 text-white` font-bold 10px ; RESOLVED `bg-white/10 text-[var(--brand-200)]`).

## Animations
- Entrée du contenu : déjà gérée par Radix Dialog (fade + scale). On n'ajoute pas de stagger interne — le Dialog est déjà animé.
- Hover micro-interactions : aucune sur le contenu du Dialog (statique).
- Respect `prefers-reduced-motion` automatique (Radix).

## Responsive (mobile-first)
- Hero pills row peut wrap.
- Rangée stats : 2 colonnes < sm, 4 colonnes sm+.
- Section 2 cols (Objectifs/Compétences) : 1 col < md, 2 cols md+.
- Phase strip : `overflow-x-auto` (déjà prévu).
- Brownfield tiles : 2 cols < sm, 4 cols sm+.
- Dialog : `sm:max-w-[820px]` conservé ; full-bleed < sm via Radix.

## Accessibilité
- `DialogTitle` reste le titre principal (Radix le pointe via `aria-labelledby`).
- Description : on conserve si dispo (peut servir de `aria-describedby` automatique).
- Contrastes sur fond sombre brand-700 vérifiés : `--brand-200` (#B8C7DF) sur `--brand-700` (#1A2B48) > 7:1, `--accent-300` (#FFB685) > 4.5:1.
- Dots de sévérité **doublés** par le statut texte (pill « Actif »/« Résolu »).
- Focus visibles préservés sur boutons et Tabs (aucun changement).

## Hors scope
- Pas de modification du wrapper Dialog (sm:max-w, scroll behaviour, gap, padding root).
- Pas de modification de `ScenarioCard`.
- Pas de modification du flux génération IA.
- Pas de nouveau type/champ backend.

## Vérification (pas de runner de tests front)
- `pnpm --filter @sim360/webapp typecheck` vert.
- Navigateur (Playwright + injection token user `admin@sim360.dev`) :
  - `/simulations/new` → clic sur une carte scénario GREENFIELD → Dialog avec hero, 4 stats, objectifs, compétences, phase strip (1ère active), footer.
  - Clic sur une carte BROWNFIELD → en plus du précédent, **bandeau sombre brand-700** en bas avec citation, 4 KPI tiles, liste de risques.
  - Cliquer Lancer la simulation → navigation vers le Cockpit.
  - Cliquer Annuler → ferme.
  - Responsive 375px + desktop ; pas d'erreur console.
