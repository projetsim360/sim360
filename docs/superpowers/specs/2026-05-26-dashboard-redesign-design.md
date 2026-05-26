# Redesign premium du Dashboard — Design

> Branche : `feat/simex-foundation`. Continue le travail de redesign (onboarding, agent PMO) à la palette Simex pro (Deep Blue `--brand-700` #1A2B48 + Warm Orange `--accent-500` #EE7A3A).

## Objectif

Transformer le tableau de bord apprenant en un **centre de commande premium** : d'un regard, l'apprenant voit ses chiffres clés (avec tendance), ses simulations en cours, ses actions prioritaires et son coach PMO. La page s'adapte au profil (nouvel utilisateur vs habitué). Le dashboard formateur est aligné sur les mêmes primitives, en phase 2.

Source de vérité visuelle : `design/project/ui_kits/app/Dashboard.jsx` + `design/project/preview/kpi-tiles.html`.

## Périmètre

- **Phase 1 (cœur du spec)** : refonte de `apps/webapp/src/features/dashboard/pages/dashboard.tsx` (dashboard apprenant) + ses composants.
- **Phase 2 (section dédiée plus bas)** : alignement du dashboard formateur `trainer-dashboard.tsx` sur les mêmes primitives (PageHeader, KpiTile, style de carte). Plus léger.
- **Backend** : ajouts additifs au endpoint `GET /dashboard/summary` (tendances + équipes), sans rien casser.

## Décisions validées (brainstorming)

1. **Layout A — Centre de commande** : bandeau d'accueil → 4 KPI tiles → corps 2/3+1/3 (Simulations en cours | Actions prioritaires + carte PMO) → bas (Évolution du score | Activité récente).
2. **Périmètre** : apprenant **et** formateur (apprenant prioritaire).
3. **Données** : front complet sur données réelles ; ajout de champs backend là où nécessaire pour le rendu premium.
4. **KPI** (4 tuiles) : Simulations actives · Score moyen · Simulations terminées · Actions en attente.
5. **Tendances + sparklines** sur les 4 tuiles → **petit champ backend** (`trends`, séries hebdomadaires + delta).
6. **Carte latérale haut** : « Actions prioritaires » (condensé cliquable de `pendingActions`), pas un faux inbox.
7. **Carte PMO** : conservée (sombre brand + accent), ouvre le panneau coach du shell.
8. **Barres de progression** : **réutiliser le composant `Progress`** (`components/ui/progress.tsx`) — déjà animé — en lui ajoutant un prop **`variant`** (couleur de l'indicateur selon la tonalité de phase). Pas de `div` coloré maison.
9. **Adaptatif** : bandeau + blocs s'adaptent (habitué → résumé + prochaine action ; nouveau → « premiers pas » + états vides engageants).

## Architecture

Le dashboard apprenant reste une page lazy-loadée sous le `simex-shell`, utilisant `PageHeader` (déjà au nouveau design). On remplace **le corps** (tout ce qui est sous `PageHeader`) et on purge le violet hérité.

```
dashboard.tsx (orchestration : data + état adaptatif + assemblage)
├── components/dashboard-hero.tsx        (bandeau d'accueil adaptatif)
├── components/kpi-tile.tsx              (tuile KPI : overline + valeur + delta + sparkline)
├── components/sparkline.tsx             (mini-courbe SVG réutilisable)
├── components/active-simulations-card.tsx (liste simulations : badge, phase, Progress, avatars)
├── components/priority-actions-card.tsx  (condensé pendingActions)
├── components/pmo-coach-card.tsx         (carte sombre → ouvre PMO du shell)
├── components/score-evolution-card.tsx   (graphe Recharts, palette accent)
├── components/recent-activity-card.tsx   (flux recentActivity)
└── components/getting-started-card.tsx   (réécrit à la palette Simex — existant, à dé-violetter)
```

Composants partagés touchés :
- `components/ui/progress.tsx` — **ajout du prop `variant`** (réutilisé dans `active-simulations-card`).
- `components/ui/avatar.tsx` / `avatar-group.tsx` — réutilisés tels quels pour les équipes.

## Données

### Existant (`DashboardSummary`, inchangé)
`user`, `stats {activeSimulations, completedSimulations, totalSimulations, averageScore}`, `gettingStarted`, `nextStep`, `activeSimulations[]`, `pendingActions {decisions, events, meetings, emails, deliverables}`, `recentActivity[]`, `scoreEvolution[]`.

### Ajouts backend (additifs, non cassants)

**1. `trends` — séries hebdomadaires + delta par KPI**

```ts
interface KpiTrend {
  series: number[];      // 6 points (6 dernières semaines), du plus ancien au plus récent
  delta: number | null;  // variation période courante vs précédente (null si non calculable)
}
interface DashboardTrends {
  activeSimulations: KpiTrend;
  averageScore: KpiTrend;
  completedSimulations: KpiTrend;
  pendingActions: KpiTrend;
}
// Ajouté à DashboardSummary : trends: DashboardTrends;
```

Règles de calcul (dans `dashboard.service.ts`, fenêtre = 6 semaines glissantes, scoping `userId` + `tenantId`) :
- **completedSimulations** : pour chaque semaine, cumul des simulations `COMPLETED` dont `completedAt <= fin de semaine`. `delta` = terminées cette semaine.
- **averageScore** : série = score moyen des sims terminées par fenêtre (réutilise la pondération KPI existante). `delta` = score moyen courant − score moyen 30 jours avant (arrondi). Si < 2 points, `delta = null`.
- **activeSimulations** : pour chaque fin de semaine, nombre de sims avec `createdAt <= finSemaine` ET (`completedAt` nul OU `completedAt > finSemaine`). `delta` = actives maintenant − actives il y a 7 jours.
- **pendingActions** : série best-effort = nombre d'items actuellement en attente groupés par `createdAt` par semaine ; `delta = null` (l'historique de « en attente » n'est pas fiable). Le front affiche alors un libellé secondaire factuel (ex. « 3 urgentes ») plutôt qu'une flèche de tendance.

> Le contrat est honnête : quand `delta` est `null`, le front n'invente pas de tendance.

**2. `activeSimulations[].teamMembers` — initiales d'équipe (pour les avatars)**

```ts
interface ActiveSimulationSummary {
  // ... champs existants ...
  teamMembers: { name: string; initials: string }[]; // max 4, le reste agrégé « +N » côté front
}
```
Source : `Project.teamMembers` (participants). Si vide, le front masque le groupe d'avatars (dégradation propre).

### Dérivé côté front (zéro backend)
- **Progression d'une simulation** : `progressPercent = Math.round((currentPhase / TOTAL_PHASES) * 100)` avec `TOTAL_PHASES = 5` (Initiation → Clôture). C'est une progression « par phase », alimentant le `Progress`.
- **Tonalité de phase** (variant Progress + badge) :
  - Phases 1 → `brand`, 2-3 → `accent`, 4-5 → `success`. (Mapping simple, ajustable.)

## Composants — directives

### `components/ui/progress.tsx` — ajout du prop `variant`

Réutilisation demandée explicitement. Ajouter un prop `variant` qui choisit la couleur de l'indicateur (l'animation de remplissage existante reste inchangée) :

```tsx
const PROGRESS_VARIANTS = {
  default: 'bg-primary',
  brand:   'bg-[var(--brand-500)]',
  accent:  'bg-[var(--accent-500)]',
  success: 'bg-[var(--success-500)]',
  warning: 'bg-[var(--warning-500)]',
} as const;

function Progress({ className, indicatorClassName, value, variant = 'default', ...props }:
  React.ComponentProps<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    variant?: keyof typeof PROGRESS_VARIANTS;
  }) {
  // ... état `display` animé inchangé ...
  return (
    <ProgressPrimitive.Root /* ... */>
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-transform duration-700 ease-out motion-reduce:transition-none',
          PROGRESS_VARIANTS[variant],
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - display}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
```
Rétro-compat : `variant` par défaut `default` = `bg-primary` (comportement actuel). Les usages existants ne changent pas. `indicatorClassName` continue de surcharger si fourni.

### `components/sparkline.tsx` (nouveau)
- Props : `data: number[]`, `tone: 'up' | 'down' | 'neutral'`, `height?` (def. 26).
- Rendu : `<svg>` path lissé, `stroke` = `var(--success-500)` (up), `var(--error-500)` (down), `var(--neutral-300)` (neutral). `fill="none"`, `strokeWidth=1.5`.
- Normalise `data` sur la hauteur ; si `data.length < 2`, ne rien rendre.
- Respecte `prefers-reduced-motion` : pas d'animation de tracé (rendu statique).

### `components/kpi-tile.tsx` (nouveau)
- Props : `label`, `value: string`, `suffix?`, `delta?: number | null`, `deltaLabel?: string`, `tone: 'up'|'down'|'neutral'`, `series?: number[]`, `index?` (stagger).
- Visuel (cf. `kpi-tiles.html`) : carte blanche, `rounded-lg`, `shadow` douce, `min-h-[128px]`, flex col.
  - Overline : 11px, 600, `tracking`, uppercase, `--neutral-400`.
  - Valeur : `font-display` 800, ~34px, `--brand-700`, suffixe plus petit `--neutral-300`.
  - Delta : 12px 600 ; up=`--success-700`, down=`--error-700`, neutral=`--neutral-400`, avec flèche (↑/↓/→). Si `delta == null`, afficher `deltaLabel` (ton neutral) sans flèche.
  - `Sparkline` collé en bas (`mt-auto`).
- Entrée animée : `motion` stagger (réutiliser `lib/motion.ts` : `staggerItem`).

### `components/dashboard-hero.tsx` (nouveau, adaptatif)
- Bandeau pleine largeur, fond `linear-gradient(120deg, var(--brand-700), var(--brand-600))`, texte blanc, `rounded-xl`.
- **Mode habitué** (`hasData`) : overline « Tableau de bord », `h2` « Bonjour {firstName} 👋 », sous-titre résumé (ex. « {active} simulations en cours · score {avg}/100 »). À droite, encart « Prochaine action » (depuis `nextStep`) + bouton accent « Continuer → » (vers `nextStep.link`). Si `nextStep` absent/all-clear : encart « Tout est à jour ✓ ».
- **Mode nouveau** (`!profileCompleted` ou `totalSimulations === 0`) : `h2` « Lancez votre première simulation », sous-titre d'accueil, bouton accent « Démarrer → » (`/simulations/new`).
- Responsive : empile verticalement < md.

### `components/active-simulations-card.tsx` (réécrit)
- En-tête : overline « Simulations » + titre « En cours » + lien accent « Voir tout → » (`/simulations`).
- Lignes (depuis `activeSimulations`) : grid `1fr auto`.
  - Gauche : titre `font-display` 700 `--brand-700` + `Badge` phase (dot) toné ; sous-ligne `phaseName` (`--neutral-500`) ; `Progress` (variant toné, `value=progressPercent`).
  - Droite : `AvatarGroup` (initiales `teamMembers`, max 4 + « +N »). Masqué si vide.
  - Ligne entière = `Link` vers `/simulations/{id}`, hover subtil + « Reprendre → » apparaissant.
- **État vide** : `EmptyState` engageant (icône `rocket`, « Aucune simulation en cours », CTA « Démarrer une simulation »).
- Entrées animées en stagger.

### `components/priority-actions-card.tsx` (nouveau, remplace l'ancienne PendingActionsCard)
- Carte : overline « À traiter » + titre « {total} actions prioritaires ».
- Items (filtrés `count > 0`) depuis `pendingActions` : Décisions (`/simulations`), Événements, Réunions, Emails (`/emails`), Livrables (`/deliverables`). Chaque ligne : pastille icône tonée + libellé + compteur (pill) → `Link`.
- **État vide** (`total === 0`) : pastille succès + « Tout est à jour ».

### `components/pmo-coach-card.tsx` (nouveau)
- Carte sombre `--brand-700`, `rounded-xl`. Rond accent + icône `KeenIcon` (sparkles/abstract) + overline « Agent PMO » (`--brand-200`).
- Titre + message court. **Données réelles** : si feedback PMO récent disponible (réutiliser l'état/hook du panneau PMO du shell si exposé), afficher l'accroche ; sinon message d'accueil générique (« Votre coach vous accompagne à chaque décision »).
- Action : ouvre le panneau PMO du shell via `useShellState().setPmoOpen(true)` (le `shell-state-provider` expose `pmoOpen` / `setPmoOpen` / `togglePmo`), pas une navigation. Curseur pointer, hover léger.

### `components/score-evolution-card.tsx` (extrait + reskin)
- Graphe Recharts `AreaChart` existant, **repalettisé** : `stroke`/`fill` = `var(--accent-500)` (au lieu de `--primary`), grille/axes en neutres. Tooltip à la charte. Conserver l'état vide (`< 2` points).

### `components/recent-activity-card.tsx` (extrait + reskin)
- Flux `recentActivity` existant, pastilles icône tonées (palette Simex), titres `--brand-700`, métas `--neutral-400/500`. État vide conservé.

### `components/getting-started-card.tsx` (dé-violetter)
- **Purge des couleurs héritées** : remplacer tous les `#4b2f95` / `brand-50…900` ambigus par des tokens Simex (`--brand-*`, `--accent-*`, `--success-*`). Conserver structure (stepper horizontal desktop / liste mobile + `CircularProgress`). Le `CircularProgress` passe en `--brand-600` (piste `--neutral-200`), l'étape « suivante » mise en avant en `--accent-500`, les étapes faites en `--success-500`.

## Assemblage `dashboard.tsx`

```
<PageHeader title="Tableau de bord" ... />   // inchangé (déjà au nouveau design)
<container>
  <DashboardHero hasData={...} ... />
  {gettingStarted.completionPercent < 100 && <div data-tour="getting-started"><GettingStartedCard/></div>}
  <div data-tour="stats"> <KpiTile x4 (grid 2/4 cols)/> </div>
  <div grid 2fr/1fr>
    <ActiveSimulationsCard/>
    <div col> <PriorityActionsCard data-tour="next-step"/> <PmoCoachCard/> </div>
  </div>
  <div grid 2fr/1fr>
    <ScoreEvolutionCard/>
    <RecentActivityCard/>
  </div>
</container>
```

- **GuidedTour** : conserver les attributs `data-tour="getting-started"`, `data-tour="next-step"`, `data-tour="stats"` et le sélecteur `a[href="/simulations/new"]` (présent dans le hero/CTA) pour ne pas casser le tour existant.
- **Fallback `LegacyDashboard`** (l. 565+) : **supprimé**. La gestion d'erreur du `summary` se réduit à un état d'erreur simple (carte « Impossible de charger le tableau de bord » + bouton réessayer). Le legacy violet n'a plus de raison d'être.

## Adaptatif & états

| Cas | Hero | KPI | Simulations | Actions | Score/Activité |
|-----|------|-----|-------------|---------|----------------|
| Nouveau (0 sim) | « Première simulation » + Démarrer | valeurs à 0, pas de sparkline | EmptyState + CTA | « Tout est à jour » | états vides |
| Habitué | Bonjour + prochaine action | valeurs + tendances | liste riche | condensé | graphe + flux |
| Erreur summary | — | — | — | — | carte d'erreur + réessayer |

## Animations (réutiliser `lib/motion.ts`)
- KPI tiles : `staggerContainer`/`staggerItem` (entrée échelonnée).
- Lignes simulations & actions : stagger léger.
- `Progress` : remplissage animé (déjà intégré).
- Sparkline : statique (pas d'anim de tracé) ; respect `prefers-reduced-motion` partout (`useReducedMotion` + `motion-reduce:`).

## Responsive (obligatoire, mobile-first)
- KPI : `grid-cols-2` mobile → `lg:grid-cols-4`.
- Corps 2fr/1fr : empilé < lg (Simulations puis Actions/PMO).
- Hero : encart « prochaine action » passe sous le titre < md.
- Avatars/labels tronqués proprement ; cibles tactiles ≥ 40px.

## Accessibilité
- Contrastes : texte sur dégradé brand vérifié (blanc/`--brand-100`). Delta : ne pas reposer sur la seule couleur → flèche + signe.
- Sparkline décorative : `aria-hidden`, la valeur/delta portent l'info.
- `Link` avec libellés explicites ; focus visibles.

## Phase 2 — Dashboard formateur (`trainer-dashboard.tsx`)
Alignement plus léger, **réutilisant les primitives** de la phase 1 :
- Remplacer `layout-6` `Toolbar` par `PageHeader` (titre « Suivi des apprenants », sous-titre dynamique, action export éventuelle).
- Bandeau de stats agrégées via **`KpiTile`** (apprenants actifs, score moyen cohorte, alertes, simulations totales) + `trends` si pertinent.
- Table des apprenants conservée (`Table`) mais reskinnée à la charte (badges statut tonés, lignes hover, avatars initiales). Filtres (`Input`/`Select`) au style courant.
- Pas de nouveau composant : on consomme `KpiTile`, `Sparkline`, le style de carte et la palette.

## Hors périmètre
- Pas de messagerie d'équipe (l'« Inbox » devient « Actions prioritaires »).
- Pas de décomposition du score par compétence ni « temps décisionnel » (non disponibles ; écartés des KPI).
- Pas de nouveau layout ni de framework UI tiers.
- `token-usage.tsx` (analytics tokens) hors scope.

## Vérification (pas de runner de tests front)
- `pnpm --filter @sim360/webapp typecheck` vert.
- `pnpm --filter @sim360/api build` + typecheck (changements backend).
- Navigateur (Playwright + injection token, user seed `admin@sim360.dev`) :
  - habitué : hero résumé, 4 KPI avec tendance, simulations avec Progress toné + avatars, actions prioritaires, carte PMO ouvre le panneau, graphe accent, activité.
  - nouveau / 0 sim : hero « première simulation », premiers pas, états vides.
  - responsive mobile/desktop ; `prefers-reduced-motion`.
  - GuidedTour : cibles `data-tour` toujours présentes.
- Backend : `GET /dashboard/summary` renvoie `trends` et `teamMembers` ; `delta=null` géré ; scoping `tenantId` respecté.
