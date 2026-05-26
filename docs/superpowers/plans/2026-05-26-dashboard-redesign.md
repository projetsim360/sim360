# Redesign premium du Dashboard — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer le dashboard apprenant en centre de commande premium (palette Simex), avec tendances/sparklines réelles, et aligner le dashboard formateur.

**Architecture:** Backend additif (`getSummary` → `trends` + `teamMembers`), composant `Progress` enrichi d'un prop `variant`, nouveaux composants front (KpiTile, Sparkline, hero, cartes), réassemblage de `dashboard.tsx`, suppression du `LegacyDashboard`. Phase 2 = reskin du `trainer-dashboard`.

**Tech Stack:** NestJS 10 + Prisma (backend, Jest), React 19 + Tailwind v4 + framer-motion + Recharts (front). Spec : `docs/superpowers/specs/2026-05-26-dashboard-redesign-design.md`.

**Convention de vérification :** le webapp n'a **pas** de runner de tests. Pour les tâches front, l'étape « test » = `pnpm --filter @sim360/webapp typecheck` (vert), et vérification navigateur à la Task 14. Le backend utilise Jest (logique pure isolée pour testabilité sans mock Prisma).

**Branche :** `feat/onboarding-redesign`. Commits en anglais. UI en français (diacritiques complets). Ne jamais committer `docs/superpowers/**/2026-05-03-auth-flow-redesign*`.

---

## File Structure

**Backend**
- Create `apps/api/src/modules/dashboard/dashboard.trends.ts` — fonction pure `buildKpiTrends` (testable).
- Create `apps/api/src/modules/dashboard/dashboard.trends.spec.ts` — tests unitaires.
- Modify `apps/api/src/modules/dashboard/dashboard.service.ts` — wiring `teamMembers` + `trends` dans `getSummary`.

**Front — types & primitives partagées**
- Modify `apps/webapp/src/features/dashboard/types/dashboard.types.ts` — `KpiTrend`, `DashboardTrends`, `teamMembers`.
- Modify `apps/webapp/src/components/ui/progress.tsx` — prop `variant`.
- Create `apps/webapp/src/features/dashboard/components/sparkline.tsx`.
- Create `apps/webapp/src/features/dashboard/components/kpi-tile.tsx`.

**Front — composants feature**
- Create `apps/webapp/src/features/dashboard/components/dashboard-hero.tsx`.
- Rewrite `apps/webapp/src/features/dashboard/components/active-simulations-card.tsx`.
- Create `apps/webapp/src/features/dashboard/components/priority-actions-card.tsx`.
- Create `apps/webapp/src/features/dashboard/components/pmo-coach-card.tsx`.
- Create `apps/webapp/src/features/dashboard/components/score-evolution-card.tsx`.
- Create `apps/webapp/src/features/dashboard/components/recent-activity-card.tsx`.
- Modify `apps/webapp/src/features/dashboard/components/getting-started-card.tsx` — purge violet.
- Rewrite `apps/webapp/src/features/dashboard/pages/dashboard.tsx` — assemblage, suppression `LegacyDashboard`.

**Phase 2**
- Modify `apps/webapp/src/features/dashboard/pages/trainer-dashboard.tsx` — PageHeader + KpiTile + reskin table.

---

## Task 1: Backend — `teamMembers` dans les simulations actives

**Files:**
- Modify: `apps/api/src/modules/dashboard/dashboard.service.ts:168-198`

- [ ] **Step 1: Inclure les membres d'équipe dans la requête `activeSims`**

Dans `getSummary`, remplacer le `include` de la requête `activeSims` (l. 168-178) pour charger les participants du projet :

```ts
const activeSims = await this.prisma.simulation.findMany({
  where: { userId, tenantId, status: 'IN_PROGRESS' },
  include: {
    project: {
      select: {
        name: true,
        teamMembers: { select: { name: true }, take: 6 },
      },
    },
    scenario: { select: { title: true } },
    kpis: true,
    phases: { orderBy: { order: 'asc' }, select: { order: true, name: true, status: true } },
  },
  orderBy: { updatedAt: 'desc' },
  take: 5,
});
```

- [ ] **Step 2: Mapper les initiales dans `activeSimulationsList`**

Remplacer le `.map` (l. 180-198) pour ajouter `teamMembers` (initiales dérivées du nom) :

```ts
const toInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const activeSimulationsList = activeSims.map((sim) => {
  const currentPhase = sim.phases.find((p) => p.status === 'ACTIVE');
  return {
    id: sim.id,
    projectName: sim.project.name,
    scenarioTitle: sim.scenario.title,
    currentPhase: sim.currentPhaseOrder,
    phaseName: currentPhase?.name ?? 'Inconnue',
    teamMembers: sim.project.teamMembers.map((m) => ({
      name: m.name,
      initials: toInitials(m.name),
    })),
    kpis: sim.kpis
      ? {
          budget: Math.round(sim.kpis.budget),
          schedule: Math.round(sim.kpis.schedule),
          quality: Math.round(sim.kpis.quality),
          morale: Math.round(sim.kpis.teamMorale),
          risk: Math.round(sim.kpis.riskLevel),
        }
      : null,
  };
});
```

- [ ] **Step 3: Vérifier la compilation**

Run: `pnpm --filter @sim360/api typecheck`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/modules/dashboard/dashboard.service.ts
git commit -m "feat(dashboard): expose team member initials on active simulations"
```

---

## Task 2: Backend — calcul des tendances KPI (`trends`)

**Files:**
- Create: `apps/api/src/modules/dashboard/dashboard.trends.ts`
- Create: `apps/api/src/modules/dashboard/dashboard.trends.spec.ts`
- Modify: `apps/api/src/modules/dashboard/dashboard.service.ts` (getSummary)

- [ ] **Step 1: Écrire le test qui échoue**

Create `apps/api/src/modules/dashboard/dashboard.trends.spec.ts`:

```ts
import { buildKpiTrends } from './dashboard.trends';

const WEEK = 7 * 24 * 60 * 60 * 1000;

describe('buildKpiTrends', () => {
  const now = new Date('2026-05-26T12:00:00.000Z');

  it('produces 6-point series for active and completed simulations', () => {
    const sims = [
      { createdAt: new Date(now.getTime() - 5 * WEEK), completedAt: null },
      { createdAt: new Date(now.getTime() - 4 * WEEK), completedAt: new Date(now.getTime() - 1 * WEEK) },
      { createdAt: new Date(now.getTime() - 1 * WEEK), completedAt: null },
    ];
    const result = buildKpiTrends({ now, sims, completedScores: [], pendingTotal: 0 });

    expect(result.activeSimulations.series).toHaveLength(6);
    expect(result.completedSimulations.series).toHaveLength(6);
    // 2 sims active now (the never-completed ones)
    expect(result.activeSimulations.series[5]).toBe(2);
    // 1 sim completed in total now
    expect(result.completedSimulations.series[5]).toBe(1);
  });

  it('computes averageScore delta as null when fewer than 2 completions', () => {
    const result = buildKpiTrends({
      now,
      sims: [],
      completedScores: [{ completedAt: new Date(now.getTime() - 1 * WEEK), score: 80 }],
      pendingTotal: 3,
    });
    expect(result.averageScore.delta).toBeNull();
  });

  it('returns empty series and null delta for pending actions', () => {
    const result = buildKpiTrends({ now, sims: [], completedScores: [], pendingTotal: 5 });
    expect(result.pendingActions.series).toEqual([]);
    expect(result.pendingActions.delta).toBeNull();
  });

  it('computes completed delta as completions in the last 7 days', () => {
    const sims = [
      { createdAt: new Date(now.getTime() - 3 * WEEK), completedAt: new Date(now.getTime() - 2 * WEEK) },
      { createdAt: new Date(now.getTime() - 2 * WEEK), completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    ];
    const result = buildKpiTrends({ now, sims, completedScores: [], pendingTotal: 0 });
    expect(result.completedSimulations.delta).toBe(1);
  });
});
```

- [ ] **Step 2: Lancer le test → échec**

Run: `pnpm --filter @sim360/api test -- --testPathPattern=dashboard.trends`
Expected: FAIL — `Cannot find module './dashboard.trends'`.

- [ ] **Step 3: Implémenter la fonction pure**

Create `apps/api/src/modules/dashboard/dashboard.trends.ts`:

```ts
export interface KpiTrend {
  series: number[];
  delta: number | null;
}

export interface DashboardTrends {
  activeSimulations: KpiTrend;
  averageScore: KpiTrend;
  completedSimulations: KpiTrend;
  pendingActions: KpiTrend;
}

interface TrendInput {
  now: Date;
  sims: { createdAt: Date; completedAt: Date | null }[];
  completedScores: { completedAt: Date; score: number }[];
  pendingTotal: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const POINTS = 6;

/** End-of-week boundaries, oldest first, ending at `now`. */
function weekBoundaries(now: Date): number[] {
  const end = now.getTime();
  const boundaries: number[] = [];
  for (let i = POINTS - 1; i >= 0; i--) {
    boundaries.push(end - i * WEEK_MS);
  }
  return boundaries;
}

export function buildKpiTrends(input: TrendInput): DashboardTrends {
  // `pendingTotal` is accepted for API symmetry but pending history is not
  // reliably reconstructable, so it does not feed a series (see return).
  const { now, sims, completedScores } = input;
  const boundaries = weekBoundaries(now);

  // Active at each boundary: created on/before boundary and not yet completed by then.
  const activeSeries = boundaries.map(
    (b) =>
      sims.filter(
        (s) => s.createdAt.getTime() <= b && (s.completedAt === null || s.completedAt.getTime() > b),
      ).length,
  );

  // Cumulative completed at each boundary.
  const completedSeries = boundaries.map(
    (b) => sims.filter((s) => s.completedAt !== null && s.completedAt.getTime() <= b).length,
  );

  // Running average score of completions up to each boundary.
  const scoreSeries = boundaries.map((b) => {
    const upTo = completedScores.filter((c) => c.completedAt.getTime() <= b);
    if (upTo.length === 0) return 0;
    return Math.round((upTo.reduce((sum, c) => sum + c.score, 0) / upTo.length) * 10) / 10;
  });

  // Deltas.
  const oneWeekAgo = now.getTime() - WEEK_MS;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const activeNow = activeSeries[POINTS - 1];
  const activeWeekAgo = sims.filter(
    (s) => s.createdAt.getTime() <= oneWeekAgo && (s.completedAt === null || s.completedAt.getTime() > oneWeekAgo),
  ).length;

  const completedLast7d = sims.filter(
    (s) => s.completedAt !== null && s.completedAt.getTime() > oneWeekAgo,
  ).length;

  let scoreDelta: number | null = null;
  if (completedScores.length >= 2) {
    const current = scoreSeries[POINTS - 1];
    const past = completedScores.filter((c) => c.completedAt.getTime() <= thirtyDaysAgo);
    if (past.length > 0) {
      const pastAvg = Math.round((past.reduce((s, c) => s + c.score, 0) / past.length) * 10) / 10;
      scoreDelta = Math.round((current - pastAvg) * 10) / 10;
    }
  }

  return {
    activeSimulations: { series: activeSeries, delta: activeNow - activeWeekAgo },
    averageScore: { series: scoreSeries, delta: scoreDelta },
    completedSimulations: { series: completedSeries, delta: completedLast7d },
    // Pending history is not reliably reconstructable — honest empty contract.
    pendingActions: { series: [], delta: null },
  };
}
```

> Note : `pendingTotal` est dans l'entrée pour cohérence future ; il n'alimente pas de série (contrat honnête `series: []`, `delta: null`).

- [ ] **Step 4: Lancer le test → succès**

Run: `pnpm --filter @sim360/api test -- --testPathPattern=dashboard.trends`
Expected: PASS (4 tests).

- [ ] **Step 5: Câbler `trends` dans `getSummary`**

Dans `dashboard.service.ts` : importer le helper en tête de fichier :

```ts
import { buildKpiTrends } from './dashboard.trends';
```

Après le bloc `scoreEvolution` (vers l. 243) et avant le `return`, ajouter la requête des timestamps + le calcul :

```ts
// 9b. KPI trends (weekly series + deltas)
const allSimsForTrends = await this.prisma.simulation.findMany({
  where: { userId, tenantId },
  select: { createdAt: true, completedAt: true },
});
const trends = buildKpiTrends({
  now: new Date(),
  sims: allSimsForTrends.map((s) => ({ createdAt: s.createdAt, completedAt: s.completedAt })),
  completedScores: scoreEvolution
    .filter((s) => s.completedAt != null)
    .map((s) => ({ completedAt: new Date(s.completedAt as Date), score: s.score })),
  pendingTotal:
    pendingActions.decisions +
    pendingActions.events +
    pendingActions.meetings +
    pendingActions.emails +
    pendingActions.deliverables,
});
```

Puis ajouter `trends` à l'objet retourné (après `scoreEvolution,`) :

```ts
      scoreEvolution,
      trends,
    };
```

- [ ] **Step 6: Vérifier build + typecheck API**

Run: `pnpm --filter @sim360/api typecheck`
Expected: aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/dashboard/dashboard.trends.ts apps/api/src/modules/dashboard/dashboard.trends.spec.ts apps/api/src/modules/dashboard/dashboard.service.ts
git commit -m "feat(dashboard): compute weekly KPI trend series and deltas"
```

---

## Task 3: Front — types `trends` + `teamMembers`

**Files:**
- Modify: `apps/webapp/src/features/dashboard/types/dashboard.types.ts:118-160`

- [ ] **Step 1: Ajouter les types de tendance et les membres d'équipe**

Dans `dashboard.types.ts`, ajouter avant `DashboardSummary` :

```ts
export interface KpiTrend {
  series: number[];
  delta: number | null;
}

export interface DashboardTrends {
  activeSimulations: KpiTrend;
  averageScore: KpiTrend;
  completedSimulations: KpiTrend;
  pendingActions: KpiTrend;
}
```

Ajouter `teamMembers` à `ActiveSimulationSummary` (après `phaseName`) :

```ts
export interface ActiveSimulationSummary {
  id: string;
  projectName: string;
  scenarioTitle: string;
  currentPhase: number;
  phaseName: string;
  teamMembers: { name: string; initials: string }[];
  kpis: {
    budget: number;
    schedule: number;
    quality: number;
    morale: number;
    risk: number;
  };
}
```

Ajouter `trends` à `DashboardSummary` (après `scoreEvolution`) :

```ts
  scoreEvolution: ScoreEvolutionItem[];
  trends: DashboardTrends;
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur (les composants ne consomment pas encore `trends`).

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/types/dashboard.types.ts
git commit -m "feat(dashboard): add trend and team member types"
```

---

## Task 4: Front — prop `variant` sur `Progress`

**Files:**
- Modify: `apps/webapp/src/components/ui/progress.tsx:7-40`

- [ ] **Step 1: Ajouter la table de variantes + le prop**

Remplacer la fonction `Progress` (l. 7-40) par :

```tsx
const PROGRESS_VARIANTS = {
  default: 'bg-primary',
  brand: 'bg-[var(--brand-500)]',
  accent: 'bg-[var(--accent-500)]',
  success: 'bg-[var(--success-500)]',
  warning: 'bg-[var(--warning-500)]',
} as const;

function Progress({
  className,
  indicatorClassName,
  value,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
  variant?: keyof typeof PROGRESS_VARIANTS;
}) {
  // Start at 0 and animate to `value` after mount so the fill is animated
  // everywhere the component is used. Reduced motion users get it instantly.
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setDisplay(value || 0));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
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

> Rétro-compat : `variant` par défaut `default` (= `bg-primary`, comportement actuel). `indicatorClassName` surcharge toujours.

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/components/ui/progress.tsx
git commit -m "feat(ui): add color variant prop to Progress"
```

---

## Task 5: Front — composant `Sparkline`

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/sparkline.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/sparkline.tsx`:

```tsx
import { cn } from '@/lib/utils';

export type SparkTone = 'up' | 'down' | 'neutral';

const TONE_STROKE: Record<SparkTone, string> = {
  up: 'var(--success-500)',
  down: 'var(--error-500)',
  neutral: 'var(--neutral-300)',
};

interface SparklineProps {
  data: number[];
  tone: SparkTone;
  height?: number;
  className?: string;
}

export function Sparkline({ data, tone, height = 26, className }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const w = 120;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 4) - 2; // 2px padding top/bottom
    return `${x},${Math.round(y * 100) / 100}`;
  });

  const d = `M ${points.join(' L ')}`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
    >
      <path d={d} stroke={TONE_STROKE[tone]} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/sparkline.tsx
git commit -m "feat(dashboard): add Sparkline component"
```

---

## Task 6: Front — composant `KpiTile`

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/kpi-tile.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/kpi-tile.tsx`:

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';
import { Sparkline, type SparkTone } from './sparkline';

interface KpiTileProps {
  label: string;
  value: string;
  suffix?: string;
  delta?: number | null;
  deltaLabel?: string;
  tone?: SparkTone;
  series?: number[];
  index?: number;
}

const TONE_TEXT: Record<SparkTone, string> = {
  up: 'text-[var(--success-700)]',
  down: 'text-[var(--error-700)]',
  neutral: 'text-[var(--neutral-400)]',
};

const TONE_ARROW: Record<SparkTone, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function KpiTile({
  label,
  value,
  suffix,
  delta,
  deltaLabel,
  tone = 'neutral',
  series,
  index = 0,
}: KpiTileProps) {
  const reduce = useReducedMotion();

  // Build the delta caption: prefer a real delta, otherwise the factual label.
  let caption: string | null = null;
  if (delta != null && delta !== 0) {
    caption = `${TONE_ARROW[tone]} ${Math.abs(delta)}`;
  } else if (deltaLabel) {
    caption = deltaLabel;
  } else if (delta === 0) {
    caption = '→ stable';
  }

  return (
    <motion.div
      variants={reduce ? undefined : staggerItem}
      custom={index}
      className="flex min-h-[128px] flex-col rounded-lg bg-white p-4 shadow-[0_2px_4px_rgba(15,26,46,0.06),0_4px_12px_rgba(15,26,46,0.08)]"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
        {label}
      </span>
      <span className="mt-1.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] text-[var(--brand-700)]">
        {value}
        {suffix && <span className="text-[18px] text-[var(--neutral-300)]">{suffix}</span>}
      </span>
      {caption && (
        <span className={cn('mt-2 text-xs font-semibold', TONE_TEXT[tone])}>{caption}</span>
      )}
      {series && series.length >= 2 && (
        <div className="mt-auto pt-2">
          <Sparkline data={series} tone={tone} />
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/kpi-tile.tsx
git commit -m "feat(dashboard): add KpiTile component"
```

---

## Task 7: Front — bandeau d'accueil `DashboardHero`

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/dashboard-hero.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/dashboard-hero.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { KeenIcon } from '@/components/keenicons';
import type { NextStep } from '../types/dashboard.types';

interface DashboardHeroProps {
  firstName: string;
  isNewUser: boolean;
  activeCount: number;
  averageScore: number | null;
  nextStep: NextStep | null;
}

export function DashboardHero({ firstName, isNewUser, activeCount, averageScore, nextStep }: DashboardHeroProps) {
  const reduce = useReducedMotion();
  const isAllClear = !nextStep || nextStep.type === 'all_clear';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 rounded-xl p-6 text-white md:flex-row md:items-center md:justify-between"
      style={{ background: 'linear-gradient(120deg, var(--brand-700), var(--brand-600))' }}
    >
      {isNewUser ? (
        <>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
              Bienvenue sur Simex
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              Lancez votre première simulation
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              Suivez les étapes ci-dessous pour démarrer votre parcours.
            </p>
          </div>
          <Link
            to="/simulations/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--accent-500)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
          >
            Démarrer
            <KeenIcon icon="right" style="duotone" className="text-xs" />
          </Link>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
              Tableau de bord
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              Bonjour {firstName} 👋
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              {activeCount} simulation{activeCount > 1 ? 's' : ''} en cours
              {averageScore != null ? ` · score moyen ${averageScore}/100` : ''}.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
                {isAllClear ? 'Statut' : 'Prochaine action'}
              </span>
              <p className="mt-0.5 truncate text-sm font-bold text-white">
                {isAllClear ? 'Tout est à jour' : nextStep!.simulationName || 'Action à traiter'}
              </p>
            </div>
            {!isAllClear && (
              <Link
                to={nextStep!.link}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-500)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
              >
                Continuer
                <KeenIcon icon="right" style="duotone" className="text-xs" />
              </Link>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/dashboard-hero.tsx
git commit -m "feat(dashboard): add adaptive DashboardHero"
```

---

## Task 8: Front — `ActiveSimulationsCard` (réécrit)

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/active-simulations-card.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/active-simulations-card.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import type { ActiveSimulationSummary } from '../types/dashboard.types';

const TOTAL_PHASES = 5;

type PhaseTone = 'brand' | 'accent' | 'success';

function phaseTone(phase: number): PhaseTone {
  if (phase <= 1) return 'brand';
  if (phase <= 3) return 'accent';
  return 'success';
}

const BADGE_TONE: Record<PhaseTone, string> = {
  brand: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  accent: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
  success: 'bg-[var(--success-50)] text-[var(--success-700)]',
};

const AVATAR_BG = ['#1A2B48', '#EE7A3A', '#3D5478', '#78716C'];

function TeamAvatars({ members }: { members: ActiveSimulationSummary['teamMembers'] }) {
  if (!members || members.length === 0) return null;
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <span
          key={`${m.initials}-${i}`}
          title={m.name}
          className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
          style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
        >
          {m.initials}
        </span>
      ))}
      {extra > 0 && (
        <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[var(--neutral-300)] text-[10px] font-bold text-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

export function ActiveSimulationsCard({
  simulations,
  loading,
}: {
  simulations: ActiveSimulationSummary[];
  loading: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
              Simulations
            </span>
            <h3 className="font-display text-[19px] font-bold text-[var(--brand-700)]">En cours</h3>
          </div>
          <Link to="/simulations" className="text-[13px] font-semibold text-[var(--accent-600)]">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : simulations.length === 0 ? (
          <EmptyState
            icon="rocket"
            title="Aucune simulation en cours"
            description="Lancez votre première simulation pour commencer votre apprentissage."
            action={{ label: 'Démarrer une simulation', href: '/simulations/new' }}
          />
        ) : (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            {simulations.map((sim) => {
              const tone = phaseTone(sim.currentPhase);
              const progress = Math.round((sim.currentPhase / TOTAL_PHASES) * 100);
              return (
                <motion.div key={sim.id} variants={reduce ? undefined : staggerItem}>
                  <Link
                    to={`/simulations/${sim.id}`}
                    className="group grid grid-cols-[1fr_auto] items-center gap-4 border-t border-border py-3.5 first:border-t-0 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-display text-[15px] font-bold text-[var(--brand-700)]">
                          {sim.projectName}
                        </h4>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                            BADGE_TONE[tone],
                          )}
                        >
                          Phase {sim.currentPhase}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-[var(--neutral-500)]">{sim.phaseName}</p>
                      <Progress value={progress} variant={tone} className="mt-2 h-1.5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <TeamAvatars members={sim.teamMembers} />
                      <span className="hidden items-center gap-0.5 text-xs font-semibold text-[var(--accent-600)] opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                        Reprendre
                        <KeenIcon icon="right" style="duotone" className="text-[10px]" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/active-simulations-card.tsx
git commit -m "feat(dashboard): rebuild active simulations card with phased Progress and team avatars"
```

---

## Task 9: Front — `PriorityActionsCard`

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/priority-actions-card.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/priority-actions-card.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { PendingActions } from '../types/dashboard.types';

interface ActionItem {
  key: keyof PendingActions;
  icon: string;
  label: string;
  link: string;
  iconClass: string;
}

const ITEMS: ActionItem[] = [
  { key: 'decisions', icon: 'question-2', label: 'Décisions', link: '/simulations', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]' },
  { key: 'events', icon: 'flash', label: 'Événements', link: '/simulations', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
  { key: 'meetings', icon: 'message-text', label: 'Réunions', link: '/simulations', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  { key: 'emails', icon: 'sms', label: 'Emails non lus', link: '/emails', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-600)]' },
  { key: 'deliverables', icon: 'document', label: 'Livrables', link: '/deliverables', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]' },
];

export function PriorityActionsCard({
  actions,
  loading,
}: {
  actions: PendingActions | null;
  loading: boolean;
}) {
  const visible = actions ? ITEMS.filter((it) => actions[it.key] > 0) : [];
  const total = actions ? ITEMS.reduce((sum, it) => sum + actions[it.key], 0) : 0;

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          À traiter
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">
          {total} action{total > 1 ? 's' : ''} prioritaire{total > 1 ? 's' : ''}
        </h4>

        {loading ? (
          <div className="space-y-2 pt-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 rounded-lg" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[var(--success-50)]">
              <KeenIcon icon="check-circle" style="duotone" className="text-lg text-[var(--success-700)]" />
            </div>
            <p className="text-sm font-medium text-[var(--brand-700)]">Tout est à jour</p>
          </div>
        ) : (
          <div>
            {visible.map((it) => (
              <Link
                key={it.key}
                to={it.link}
                className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 hover:bg-muted/30"
              >
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', it.iconClass)}>
                  <KeenIcon icon={it.icon} style="duotone" className="text-sm" />
                </span>
                <span className="flex-1 text-[13px] font-semibold text-[var(--brand-700)]">{it.label}</span>
                <span className="rounded-full bg-[var(--brand-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--brand-600)]">
                  {actions![it.key]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/priority-actions-card.tsx
git commit -m "feat(dashboard): add PriorityActionsCard"
```

---

## Task 10: Front — `PmoCoachCard`

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/pmo-coach-card.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/pmo-coach-card.tsx`:

```tsx
import { useShellState } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { KeenIcon } from '@/components/keenicons';

export function PmoCoachCard() {
  const { setPmoOpen } = useShellState();

  return (
    <button
      type="button"
      onClick={() => setPmoOpen(true)}
      className="block w-full rounded-xl p-4 text-left text-white transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
      style={{ background: 'var(--brand-700)' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-[var(--accent-500)]">
          <KeenIcon icon="abstract-26" style="duotone" className="text-sm text-white" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
          Agent PMO
        </span>
      </div>
      <h4 className="font-display text-[15px] font-bold text-white">Votre coach vous accompagne</h4>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--brand-100)]">
        Il analyse vos décisions et vous propose des pistes à chaque étape.
      </p>
      <span className="mt-2.5 inline-block text-[13px] font-semibold text-[var(--accent-300)]">
        Ouvrir le coach →
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/pmo-coach-card.tsx
git commit -m "feat(dashboard): add PmoCoachCard opening the shell PMO panel"
```

---

## Task 11: Front — `ScoreEvolutionCard` (extrait + repalette)

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/score-evolution-card.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/score-evolution-card.tsx`:

```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScoreEvolutionItem } from '../types/dashboard.types';

export function ScoreEvolutionCard({
  data,
  loading,
}: {
  data: ScoreEvolutionItem[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Performance
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">Évolution du score</h4>

        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : data.length < 2 ? (
          <EmptyState
            icon="graph-up"
            title="Pas encore de données"
            description="Terminez au moins deux simulations pour visualiser l'évolution de votre score."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data.map((p) => ({
                name: p.projectName,
                date: new Date(p.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                score: p.score,
              }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--neutral-200)',
                  backgroundColor: '#fff',
                  color: 'var(--brand-700)',
                }}
                formatter={(value: number) => [`${value}%`, 'Score']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent-500)"
                fill="var(--accent-500)"
                fillOpacity={0.12}
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--accent-500)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/score-evolution-card.tsx
git commit -m "feat(dashboard): extract ScoreEvolutionCard with accent palette"
```

---

## Task 12: Front — `RecentActivityCard` (extrait + repalette)

**Files:**
- Create: `apps/webapp/src/features/dashboard/components/recent-activity-card.tsx`

- [ ] **Step 1: Créer le composant**

Create `apps/webapp/src/features/dashboard/components/recent-activity-card.tsx`:

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { RecentActivityItem } from '../types/dashboard.types';

const EVENT_CONFIG: Record<string, { icon: string; label: string; iconClass: string }> = {
  decision: { icon: 'question-2', label: 'Décision', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]' },
  meeting: { icon: 'message-text', label: 'Réunion', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  event: { icon: 'flash', label: 'Événement', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
  deliverable: { icon: 'document', label: 'Livrable', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]' },
  simulation: { icon: 'rocket', label: 'Simulation', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  email: { icon: 'sms', label: 'Email', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-600)]' },
};

export function RecentActivityCard({
  activities,
  loading,
}: {
  activities: RecentActivityItem[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Historique
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">Activité récente</h4>

        {loading ? (
          <div className="space-y-2 pt-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon="time"
            title="Aucune activité récente"
            description="Votre historique d'activité apparaîtra ici."
          />
        ) : (
          <div className="max-h-[280px] space-y-1 overflow-y-auto">
            {activities.map((activity) => {
              const config = EVENT_CONFIG[activity.eventType] ?? EVENT_CONFIG.simulation;
              const data = activity.data as Record<string, string>;
              return (
                <div key={activity.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', config.iconClass)}>
                    <KeenIcon icon={config.icon} style="duotone" className="text-sm" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--brand-700)]">
                      {data?.title ?? config.label}
                    </p>
                    <p className="text-[10px] text-[var(--neutral-400)]">{data?.projectName ?? ''}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[var(--neutral-400)]">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

> Note : `RecentActivityItem` a `eventType`, `data`, `createdAt` (cf. types existants). Conserver ce contrat.

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/recent-activity-card.tsx
git commit -m "feat(dashboard): extract RecentActivityCard with Simex palette"
```

---

## Task 13: Front — `GettingStartedCard` dé-violetté

**Files:**
- Modify: `apps/webapp/src/features/dashboard/components/getting-started-card.tsx`

- [ ] **Step 1: Remplacer les couleurs héritées par des tokens Simex**

Dans `getting-started-card.tsx`, appliquer ces remplacements (display only, structure inchangée) :

- `CircularProgress` : `className="text-border dark:text-white/10"` (piste) → `className="text-[var(--neutral-200)]"` ; l'arc `className="text-[#4b2f95] dark:text-brand-400 ..."` → `className="text-[var(--brand-600)] transition-all duration-700 ease-out"` ; le label `text-[#4b2f95] dark:text-brand-400` → `text-[var(--brand-700)]`.
- Bloc « tout exploré » et header : `bg-brand-50 dark:bg-brand-800/30` → `bg-[var(--brand-50)]` ; icônes `text-[#4b2f95] dark:text-brand-400` → `text-[var(--brand-600)]`.
- `StepNode` (desktop) & liste mobile : étape complétée `bg-brand-500 dark:bg-brand-400` → `bg-[var(--success-500)]` (coche blanche conservée) ; étape « suivante » `bg-brand-50 ... ring-[#4b2f95]/20` → `bg-[var(--accent-50)] ring-1 ring-[var(--accent-200)]` et icône `text-[#4b2f95] dark:text-brand-400` → `text-[var(--accent-600)]` ; libellé « suivante » `text-foreground font-semibold` conservé.
- Connecteurs : `bg-[#4b2f95]/30 dark:bg-brand-400/40` (complété) → `bg-[var(--success-200)]` ; non complété `bg-border dark:bg-white/10` → `bg-[var(--neutral-200)]`.

Remplacer toutes les occurrences de `#4b2f95` et des classes `brand-400/500/800` ambiguës par les tokens ci-dessus. Aucune logique modifiée.

- [ ] **Step 2: Vérifier l'absence de couleurs héritées**

Run: `grep -n "4b2f95\|dark:bg-brand-400\|dark:text-brand-400" apps/webapp/src/features/dashboard/components/getting-started-card.tsx`
Expected: aucune correspondance.

- [ ] **Step 3: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/features/dashboard/components/getting-started-card.tsx
git commit -m "refactor(dashboard): repaint getting-started card to Simex palette"
```

---

## Task 14: Front — assemblage `dashboard.tsx` + suppression `LegacyDashboard`

**Files:**
- Rewrite: `apps/webapp/src/features/dashboard/pages/dashboard.tsx`

- [ ] **Step 1: Réécrire la page**

Remplacer **tout** le contenu de `apps/webapp/src/features/dashboard/pages/dashboard.tsx` par :

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { GuidedTour } from '@/components/ui/guided-tour';
import type { TourStep } from '@/components/ui/guided-tour';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useDashboardSummary } from '../api/dashboard.api';
import { DashboardHero } from '../components/dashboard-hero';
import { GettingStartedCard } from '../components/getting-started-card';
import { KpiTile } from '../components/kpi-tile';
import { ActiveSimulationsCard } from '../components/active-simulations-card';
import { PriorityActionsCard } from '../components/priority-actions-card';
import { PmoCoachCard } from '../components/pmo-coach-card';
import { ScoreEvolutionCard } from '../components/score-evolution-card';
import { RecentActivityCard } from '../components/recent-activity-card';
import type { SparkTone } from '../components/sparkline';

const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-slot="toolbar-heading"]',
    title: 'Voici votre tableau de bord',
    description: "C'est votre QG. Retrouvez vos simulations en cours, vos actions en attente et votre progression.",
  },
  {
    target: 'a[href="/simulations/new"]',
    title: 'Lancez votre première simulation',
    description: 'Choisissez un scénario et immergez-vous dans un projet fictif.',
  },
  {
    target: '[data-tour="getting-started"]',
    title: 'Suivez votre progression',
    description: 'Cette checklist vous guide pas à pas dans la découverte de la plateforme.',
  },
  {
    target: '[data-tour="next-step"]',
    title: 'Actions recommandées',
    description: 'La plateforme vous recommande toujours la prochaine action la plus pertinente.',
  },
  {
    target: '[data-tour="stats"]',
    title: 'Valorisez vos compétences',
    description: 'Après chaque simulation, consultez votre débriefing et partagez vos badges.',
  },
];

function toneFromDelta(delta: number | null | undefined): SparkTone {
  if (delta == null || delta === 0) return 'neutral';
  return delta > 0 ? 'up' : 'down';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const { data: summary, isLoading, isError } = useDashboardSummary();

  if (isError) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord' }]} title="Tableau de bord" />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-[var(--neutral-400)]" />
              <p className="text-sm font-medium text-[var(--brand-700)]">Impossible de charger le tableau de bord</p>
              <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const loading = isLoading || !summary;
  const stats = summary?.stats;
  const trends = summary?.trends;
  const isNewUser = !loading && (!summary!.user.profileCompleted || stats!.totalSimulations === 0);

  const pendingTotal = summary
    ? summary.pendingActions.decisions +
      summary.pendingActions.events +
      summary.pendingActions.meetings +
      summary.pendingActions.emails +
      summary.pendingActions.deliverables
    : 0;

  const kpis = summary
    ? [
        {
          label: 'Simulations actives',
          value: String(stats!.activeSimulations),
          series: trends!.activeSimulations.series,
          delta: trends!.activeSimulations.delta,
          tone: toneFromDelta(trends!.activeSimulations.delta),
        },
        {
          label: 'Score moyen',
          value: stats!.averageScore != null ? String(stats!.averageScore) : '—',
          suffix: stats!.averageScore != null ? '/100' : undefined,
          series: trends!.averageScore.series,
          delta: trends!.averageScore.delta,
          deltaLabel: trends!.averageScore.delta == null ? 'Nouveau' : undefined,
          tone: toneFromDelta(trends!.averageScore.delta),
        },
        {
          label: 'Simulations terminées',
          value: String(stats!.completedSimulations),
          series: trends!.completedSimulations.series,
          delta: trends!.completedSimulations.delta,
          tone: toneFromDelta(trends!.completedSimulations.delta),
        },
        {
          label: 'Actions en attente',
          value: String(pendingTotal),
          deltaLabel:
            summary.pendingActions.decisions > 0
              ? `${summary.pendingActions.decisions} décision${summary.pendingActions.decisions > 1 ? 's' : ''}`
              : pendingTotal === 0
                ? 'Tout est à jour'
                : undefined,
          tone: pendingTotal > 0 ? ('down' as SparkTone) : ('neutral' as SparkTone),
        },
      ]
    : [];

  return (
    <>
      <GuidedTour steps={ONBOARDING_TOUR_STEPS} storageKey="onboarding_tour_completed" />

      <PageHeader
        breadcrumbs={[{ label: 'Tableau de bord' }]}
        title="Tableau de bord"
        subtitle="Suivi de vos simulations en cours et progression globale."
        actions={
          <Button variant="primary" size="sm" asChild>
            <Link to="/simulations/new">
              <KeenIcon icon="plus" style="duotone" className="text-xs" />
              Nouvelle simulation
            </Link>
          </Button>
        }
      />

      <div className="px-6 pb-8">
        <div className="grid gap-5 lg:gap-6">
          {summary && (
            <DashboardHero
              firstName={summary.user.firstName || (user?.firstName ?? '')}
              isNewUser={isNewUser}
              activeCount={stats!.activeSimulations}
              averageScore={stats!.averageScore}
              nextStep={summary.nextStep}
            />
          )}

          {summary && summary.gettingStarted.completionPercent < 100 && (
            <div data-tour="getting-started">
              <GettingStartedCard data={summary.gettingStarted} />
            </div>
          )}

          <motion.div
            data-tour="stats"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
          >
            {loading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="min-h-[128px] animate-pulse rounded-lg bg-[var(--neutral-100)]" />
                ))
              : kpis.map((k, i) => (
                  <KpiTile key={k.label} {...k} index={i} />
                ))}
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <ActiveSimulationsCard simulations={summary?.activeSimulations ?? []} loading={loading} />
            </div>
            <div className="flex flex-col gap-5" data-tour="next-step">
              <PriorityActionsCard actions={summary?.pendingActions ?? null} loading={loading} />
              <PmoCoachCard />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <ScoreEvolutionCard data={summary?.scoreEvolution ?? []} loading={loading} />
            </div>
            <div>
              <RecentActivityCard activities={summary?.recentActivity ?? []} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

> Le `LegacyDashboard`, `MiniKpis`, `StatCard` et l'ancien fallback sont supprimés (le fichier ne contient plus que ce qui précède). `dashboardApi.getGlobalDashboard` reste disponible dans l'API client mais n'est plus utilisé ici.

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Build front**

Run: `pnpm --filter @sim360/webapp build`
Expected: build réussi.

- [ ] **Step 4: Vérification navigateur (Playwright + injection token)**

Démarrer l'API (`pnpm --filter @sim360/api dev`, core déjà buildé) et le webapp (`pnpm --filter @sim360/webapp dev`). Se connecter via `POST http://localhost:3001/api/v1/auth/login` `{email:'admin@sim360.dev', password:'Admin123!'}`, injecter `sim360_access_token` / `sim360_refresh_token` dans `localStorage` (`addInitScript`), puis ouvrir `http://localhost:5173/` (dashboard).

Vérifier visuellement :
- Hero (résumé habitué OU « première simulation » selon le compte), 4 KPI (valeurs + sparkline sur Score au minimum), bloc Simulations avec `Progress` toné + avatars, Actions prioritaires, carte PMO qui **ouvre le panneau** au clic, graphe accent, activité récente.
- Responsive : passer en viewport mobile (375px) → empilement correct, KPI en 2 colonnes.
- `prefers-reduced-motion` activé → pas d'animation, rendu instantané.
- Cibles `GuidedTour` présentes : `[data-tour="getting-started"]`, `[data-tour="next-step"]`, `[data-tour="stats"]`, `a[href="/simulations/new"]`.

Expected: tous les blocs s'affichent sans erreur console ; la carte PMO ouvre le drawer.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/dashboard/pages/dashboard.tsx
git commit -m "feat(dashboard): assemble premium command-center layout, drop legacy fallback"
```

---

## Task 15 (Phase 2): Dashboard formateur aligné

**Files:**
- Modify: `apps/webapp/src/features/dashboard/pages/trainer-dashboard.tsx`

- [ ] **Step 1: Remplacer le `Toolbar` layout-6 par `PageHeader`**

En tête de `trainer-dashboard.tsx`, remplacer l'import et l'usage du `Toolbar` de `layout-6` par le `PageHeader` partagé :

```tsx
import { PageHeader } from '@/components/page-header';
```

Et dans le `return`, remplacer le bloc `<Toolbar>…</Toolbar>` (et le wrapper `container` racine si besoin) par :

```tsx
<PageHeader
  breadcrumbs={[{ label: 'Suivi des apprenants' }]}
  title="Suivi des apprenants"
  subtitle={`${learners.length} apprenant${learners.length > 1 ? 's' : ''} · ${totalAlerts} alerte${totalAlerts > 1 ? 's' : ''}`}
/>
```

Conserver le reste de la page (filtres + table) dans un wrapper `<div className="px-6 pb-8">`.

- [ ] **Step 2: Ajouter une rangée de `KpiTile` agrégés**

Juste après le `PageHeader`, avant les filtres, insérer une rangée de KPI (sans sparkline — pas de série côté formateur) :

```tsx
<div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
  <KpiTile label="Apprenants" value={String(learners.length)} index={0} />
  <KpiTile
    label="Apprenants actifs"
    value={String(learners.filter((l) => l.activeSimulations > 0).length)}
    index={1}
  />
  <KpiTile
    label="Score moyen cohorte"
    value={
      learners.length
        ? String(Math.round(learners.reduce((s, l) => s + l.avgScore, 0) / learners.length))
        : '—'
    }
    suffix={learners.length ? '/100' : undefined}
    index={2}
  />
  <KpiTile
    label="Alertes"
    value={String(totalAlerts)}
    deltaLabel={totalAlerts > 0 ? 'à surveiller' : 'aucune'}
    tone={totalAlerts > 0 ? 'down' : 'neutral'}
    index={3}
  />
</div>
```

Ajouter l'import : `import { KpiTile } from '../components/kpi-tile';`

- [ ] **Step 3: Reskin léger de la table**

Appliquer la charte aux statuts et lignes : conserver `STATUS_VARIANT` mais s'assurer que les `Badge` utilisent `appearance="light"` ; titres de colonnes en `text-[var(--neutral-500)]` ; lignes `hover:bg-muted/40`. Pas de changement de logique de données.

- [ ] **Step 4: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 5: Vérification navigateur**

Ouvrir `http://localhost:5173/dashboard/trainer` (ou la route formateur enregistrée). Vérifier : PageHeader au nouveau design, rangée KPI agrégée, table reskinnée, filtres fonctionnels.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/features/dashboard/pages/trainer-dashboard.tsx
git commit -m "feat(dashboard): align trainer dashboard with PageHeader and KPI tiles"
```

---

## Self-Review (auteur du plan)

**Spec coverage :**
- Layout A (hero → KPI → 2/3+1/3 → bas) → Tasks 7-14. ✓
- Progress `variant` réutilisé → Task 4 + usage Task 8. ✓
- Backend `trends` (séries + delta, delta null honnête) → Task 2. ✓
- Backend `teamMembers` → Task 1. ✓
- KpiTile + Sparkline → Tasks 5-6. ✓
- Carte « Actions prioritaires » (remplace inbox) → Task 9. ✓
- Carte PMO (ouvre panneau shell via setPmoOpen) → Task 10. ✓
- Score evolution repaletté + Recent activity → Tasks 11-12. ✓
- Getting-started dé-violetté → Task 13. ✓
- Suppression LegacyDashboard + état d'erreur → Task 14. ✓
- Conservation cibles GuidedTour → Task 14 (vérif Step 4). ✓
- Adaptatif nouveau/habitué → Task 7 + logique Task 14. ✓
- Dérivation progress phase (currentPhase/5) → Task 8. ✓
- Phase 2 formateur → Task 15. ✓
- Responsive + reduced-motion → intégrés dans chaque composant + vérif Task 14. ✓

**Placeholder scan :** aucun TBD/TODO ; chaque étape de code montre le code complet.

**Type consistency :** `KpiTrend`/`DashboardTrends` identiques backend (Task 2) et front (Task 3). `teamMembers: { name; initials }[]` cohérent Task 1 ↔ Task 3 ↔ Task 8. `SparkTone` ('up'|'down'|'neutral') cohérent Tasks 5,6,14. Props `KpiTile` (label, value, suffix?, delta?, deltaLabel?, tone?, series?, index?) cohérentes Tasks 6,14,15. `Progress` `variant` ∈ {default,brand,accent,success,warning} cohérent Tasks 4,8.
