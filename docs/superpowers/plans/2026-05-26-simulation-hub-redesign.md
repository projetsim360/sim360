# Simulation Hub Redesign — Implementation Plan (sub-project A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre 4 pages du Hub Simulation (`simulations-list`, `create-simulation`, `simulation-detail` → Cockpit, `simulation-dashboard` supprimée) en réutilisant les primitives du redesign dashboard (palette Simex, `PageHeader`, `Progress` variants, `lib/motion`).

**Architecture:** Page Cockpit unique (fusion detail+dashboard) composée de 6 sous-composants self-contained. Liste & création conservent leur UX, on reskin seulement (PageHeader, palette, accents, extraction `ScenarioCard`).

**Tech Stack:** React 19 + Tailwind v4 + framer-motion + Radix UI. Pas de change backend (l'API `simulationApi` existante couvre tout). Spec : `docs/superpowers/specs/2026-05-26-simulation-hub-redesign-design.md`.

**Convention de vérification :** webapp **et** API n'ont **pas** de runner de tests (voir `MEMORY.md → frontend-verification`). Étape « test » par tâche = `pnpm --filter @sim360/webapp typecheck`. Vérification navigateur à la fin (Task 11, Playwright + token injection user `admin@sim360.dev`/`Admin123!`).

**Branche :** `feat/onboarding-redesign`. Commits en anglais. UI en français (diacritiques complets). NE PAS committer les 2 fichiers `docs/superpowers/**/2026-05-03-auth-flow-redesign*` pré-existants. Toujours append `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` au commit.

---

## File Structure

**Nouveaux composants (7 fichiers) :**
- Create `apps/webapp/src/features/simulation/components/kpi-gauge.tsx`
- Create `apps/webapp/src/features/simulation/components/cockpit-header.tsx`
- Create `apps/webapp/src/features/simulation/components/cockpit-phase-strip.tsx`
- Create `apps/webapp/src/features/simulation/components/cockpit-actions-card.tsx`
- Create `apps/webapp/src/features/simulation/components/cockpit-timeline-card.tsx`
- Create `apps/webapp/src/features/simulation/components/cockpit-pmo-banner.tsx`
- Create `apps/webapp/src/features/simulation/components/scenario-card.tsx`

**Pages réécrites / modifiées (4 fichiers) :**
- Rewrite `apps/webapp/src/features/simulation/pages/simulation-detail.tsx` (devient le Cockpit)
- Delete `apps/webapp/src/features/simulation/pages/simulation-dashboard.tsx`
- Modify `apps/webapp/src/features/simulation/config/simulation.routes.tsx` (redirect)
- Rewrite `apps/webapp/src/features/simulation/pages/simulations-list.tsx` (reskin)
- Modify `apps/webapp/src/features/simulation/pages/create-simulation.tsx` (reskin chirurgical + consommer `ScenarioCard`)

---

## Task 1: Composant `KpiGauge`

**Files:** Create `apps/webapp/src/features/simulation/components/kpi-gauge.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type KpiKey = 'budget' | 'schedule' | 'quality' | 'teamMorale' | 'riskLevel';

interface KpiGaugeProps {
  kpiKey: KpiKey;
  label: string;
  value: number;
  caption?: string;
  tooltip?: string;
  /** When true, the gauge color logic is inverted (high = bad). Used for `riskLevel`. */
  inverse?: boolean;
}

const STROKE_LEN = 151; // 2 * PI * 24

function toneFor(value: number, inverse: boolean): 'success' | 'warning' | 'error' {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'success';
  if (v >= 40) return 'warning';
  return 'error';
}

const TONE_STROKE: Record<'success' | 'warning' | 'error', string> = {
  success: 'var(--success-500)',
  warning: 'var(--warning-500)',
  error: 'var(--error-500)',
};

export function KpiGauge({ kpiKey: _kpiKey, label, value, caption, tooltip, inverse = false }: KpiGaugeProps) {
  // Animate from 0 to value on mount, like the shared Progress does.
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setDisplay(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const tone = toneFor(value, inverse);
  const stroke = TONE_STROKE[tone];
  const dash = (display / 100) * STROKE_LEN;

  const gaugeNode = (
    <div className="flex min-h-[104px] flex-col gap-2 rounded-lg bg-white p-3.5 shadow-[0_2px_4px_rgba(15,26,46,0.06),0_4px_12px_rgba(15,26,46,0.08)]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
        {label}
      </span>
      <div className="flex items-end gap-2.5">
        <div className="relative flex size-14 items-center justify-center">
          <svg className="absolute inset-0" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--brand-50)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={stroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${STROKE_LEN}`}
              transform="rotate(-90 28 28)"
              className="transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
            />
          </svg>
          <span className="font-display text-[14px] font-extrabold text-[var(--brand-700)]">
            {Math.round(value)}
          </span>
        </div>
        {caption && (
          <span className="text-[10px] leading-tight text-[var(--neutral-500)]">{caption}</span>
        )}
      </div>
    </div>
  );

  if (!tooltip) return gaugeNode;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('cursor-help')}>{gaugeNode}</div>
      </TooltipTrigger>
      <TooltipContent variant="light" className="max-w-[260px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/kpi-gauge.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add KpiGauge radial component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Composant `CockpitHeader`

**Files:** Create `apps/webapp/src/features/simulation/components/cockpit-header.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { Simulation } from '../types/simulation.types';

const STATUS_LABEL: Record<Simulation['status'], string> = {
  DRAFT: 'Brouillon',
  ONBOARDING: 'Passation',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminée',
  ABANDONED: 'Abandonnée',
};

const STATUS_TONE: Record<Simulation['status'], string> = {
  DRAFT: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  ONBOARDING: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  IN_PROGRESS: 'bg-[#D1FAE5] text-[var(--success-700)]',
  PAUSED: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  COMPLETED: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  ABANDONED: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const STATUS_DOT: Record<Simulation['status'], string> = {
  DRAFT: 'bg-[var(--neutral-400)]',
  ONBOARDING: 'bg-[var(--brand-500)]',
  IN_PROGRESS: 'bg-[var(--success-500)]',
  PAUSED: 'bg-[var(--warning-500)]',
  COMPLETED: 'bg-[var(--brand-500)]',
  ABANDONED: 'bg-[var(--error-500)]',
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'non démarré';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "démarré aujourd'hui";
  if (days === 1) return 'démarré hier';
  if (days < 7) return `démarré il y a ${days} jours`;
  if (days < 30) return `démarré il y a ${Math.floor(days / 7)} sem.`;
  return `démarré le ${new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

interface CockpitHeaderProps {
  sim: Simulation;
  pendingDecisions: number;
  actionLoading: boolean;
  onPauseResume: () => void;
  onAdvancePhase: () => void;
}

export function CockpitHeader({
  sim,
  pendingDecisions,
  actionLoading,
  onPauseResume,
  onAdvancePhase,
}: CockpitHeaderProps) {
  const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
  const totalPhases = sim.phases?.length ?? 0;
  const isRunning = sim.status === 'IN_PROGRESS';
  const isPaused = sim.status === 'PAUSED';
  const isFinished = sim.status === 'COMPLETED' || sim.status === 'ABANDONED';
  const lastPhase = activePhase?.order === totalPhases;
  const canAdvance = isRunning && !!activePhase && !lastPhase && pendingDecisions === 0;
  const advanceReason = !activePhase
    ? 'Aucune phase active.'
    : lastPhase
      ? 'Vous êtes dans la dernière phase.'
      : pendingDecisions > 0
        ? `${pendingDecisions} décision${pendingDecisions > 1 ? 's' : ''} à trancher avant d'avancer.`
        : !isRunning
          ? 'Reprenez la simulation pour avancer.'
          : '';

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Simulation
        </span>
        <h2 className="mt-1 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--brand-700)] sm:text-[30px]">
          {sim.project?.name ?? 'Projet'}
        </h2>
        <p className="mt-1 truncate text-[13px] text-[var(--neutral-500)]">
          {sim.scenario?.title ?? ''}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
              STATUS_TONE[sim.status],
            )}
          >
            <span className={cn('size-1.5 rounded-full', STATUS_DOT[sim.status])} />
            {STATUS_LABEL[sim.status]}
          </span>
          {activePhase && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-100)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-700)]">
              <span className="size-1.5 rounded-full bg-[var(--accent-500)]" />
              Phase {activePhase.order} sur {totalPhases} · {activePhase.name}
            </span>
          )}
          {pendingDecisions > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-50)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--warning-700)]">
              <span className="size-1.5 rounded-full bg-[var(--warning-500)]" />
              {pendingDecisions} décision{pendingDecisions > 1 ? 's' : ''} à trancher
            </span>
          )}
          <span className="text-xs text-[var(--neutral-400)]">{timeAgo(sim.startedAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isFinished ? (
          <Button variant="primary" size="sm" asChild>
            <Link to={`/valorisation/${sim.id}/debriefing`}>
              Voir le débriefing
              <KeenIcon icon="right" style="duotone" className="ms-1 text-xs" />
            </Link>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseResume}
              disabled={actionLoading || (!isRunning && !isPaused)}
            >
              {isPaused ? (
                <>
                  <KeenIcon icon="play" style="duotone" className="text-xs" /> Reprendre
                </>
              ) : (
                <>
                  <KeenIcon icon="pause" style="duotone" className="text-xs" /> Mettre en pause
                </>
              )}
            </Button>
            <DisabledWithTooltip disabled={!canAdvance} reason={advanceReason}>
              <Button
                variant="primary"
                size="sm"
                onClick={onAdvancePhase}
                disabled={!canAdvance || actionLoading}
              >
                Phase suivante
                <KeenIcon icon="right" style="duotone" className="ms-1 text-xs" />
              </Button>
            </DisabledWithTooltip>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/cockpit-header.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add CockpitHeader with status pills and phase actions

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Composant `CockpitPhaseStrip`

**Files:** Create `apps/webapp/src/features/simulation/components/cockpit-phase-strip.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { cn } from '@/lib/utils';
import type { SimulationPhase } from '../types/simulation.types';

interface CockpitPhaseStripProps {
  phases: SimulationPhase[];
}

export function CockpitPhaseStrip({ phases }: CockpitPhaseStripProps) {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-lg border border-border bg-white px-3 py-2.5">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
        Phases
      </span>
      {phases.map((phase) => {
        const done = phase.status === 'COMPLETED';
        const active = phase.status === 'ACTIVE';
        return (
          <div key={phase.order} className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                'h-1.5 w-10 rounded-full transition-colors',
                done
                  ? 'bg-[var(--success-500)]'
                  : active
                    ? 'bg-[var(--accent-500)]'
                    : 'bg-[var(--brand-100)]',
              )}
            />
            <span
              className={cn(
                'whitespace-nowrap text-[11px] font-semibold',
                done
                  ? 'text-[var(--success-700)]'
                  : active
                    ? 'text-[var(--accent-700)]'
                    : 'text-[var(--neutral-400)]',
              )}
            >
              {done ? '✓ ' : active ? '● ' : ''}
              {phase.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/cockpit-phase-strip.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add CockpitPhaseStrip

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Composant `CockpitActionsCard`

**Files:** Create `apps/webapp/src/features/simulation/components/cockpit-actions-card.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import type { Decision, RandomEvent, SimulationMeeting } from '../types/simulation.types';

const SEVERITY_TONE: Record<RandomEvent['severity'], string> = {
  LOW: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  MEDIUM: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  HIGH: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  CRITICAL: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

interface ActionItem {
  key: string;
  href: string;
  icon: string;
  iconClass: string;
  label: string;
  meta?: string;
  metaPillClass?: string;
}

interface CockpitActionsCardProps {
  simulationId: string;
  decisions: Decision[];
  events: RandomEvent[];
  meetings: SimulationMeeting[];
}

export function CockpitActionsCard({ simulationId, decisions, events, meetings }: CockpitActionsCardProps) {
  const reduce = useReducedMotion();

  const items: ActionItem[] = [];

  decisions
    .filter((d) => d.selectedOption === null)
    .forEach((d) =>
      items.push({
        key: `d-${d.id}`,
        href: `/simulations/${simulationId}/decisions/${d.id}`,
        icon: 'question-2',
        iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
        label: d.title,
        meta: 'Décision',
      }),
    );

  events
    .filter((e) => e.selectedOption === null)
    .forEach((e) =>
      items.push({
        key: `e-${e.id}`,
        href: `/simulations/${simulationId}/events/${e.id}`,
        icon: 'flash',
        iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
        label: e.title,
        meta: e.severity,
        metaPillClass: SEVERITY_TONE[e.severity],
      }),
    );

  meetings
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS')
    .forEach((m) =>
      items.push({
        key: `m-${m.id}`,
        href: `/meetings/${m.id}`,
        icon: 'message-text',
        iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
        label: m.title,
        meta: m.status === 'IN_PROGRESS' ? 'En cours' : 'Réunion',
      }),
    );

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
              À traiter
            </span>
            <h3 className="font-display text-[17px] font-bold text-[var(--brand-700)]">
              {items.length} action{items.length > 1 ? 's' : ''} prioritaire{items.length > 1 ? 's' : ''}
            </h3>
          </div>
          <Link to={`/simulations/${simulationId}/decisions`} className="text-[12px] font-semibold text-[var(--accent-600)]">
            Tout voir →
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="Tout est à jour"
            description="Aucune action en attente pour cette simulation."
          />
        ) : (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            {items.map((it) => (
              <motion.div key={it.key} variants={reduce ? undefined : staggerItem}>
                <Link
                  to={it.href}
                  className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 hover:bg-muted/30"
                >
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', it.iconClass)}>
                    <KeenIcon icon={it.icon} style="duotone" className="text-sm" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--brand-700)]">
                    {it.label}
                  </span>
                  {it.meta && (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        it.metaPillClass ?? 'bg-[var(--brand-100)] text-[var(--brand-600)]',
                      )}
                    >
                      {it.meta}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/cockpit-actions-card.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add CockpitActionsCard aggregating pending decisions, events and meetings

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Composant `CockpitTimelineCard`

**Files:** Create `apps/webapp/src/features/simulation/components/cockpit-timeline-card.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '../types/simulation.types';

const ENTRY_CONFIG: Record<string, { icon: string; iconClass: string; label: string }> = {
  decision: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'Décision' },
  decision_made: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'Décision' },
  event: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'Événement' },
  event_triggered: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'Événement' },
  meeting: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Réunion' },
  meeting_completed: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Réunion' },
  deliverable: { icon: 'document', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Livrable' },
  phase: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Phase' },
  phase_completed: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Phase' },
  simulation: { icon: 'rocket', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Simulation' },
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (days === 0) return `Aujourd'hui · ${hh}:${mm}`;
  if (days === 1) return `Hier · ${hh}:${mm}`;
  if (days < 7) return `il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface CockpitTimelineCardProps {
  entries: TimelineEntry[];
}

export function CockpitTimelineCard({ entries }: CockpitTimelineCardProps) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
            Historique
          </span>
          <h3 className="font-display text-[17px] font-bold text-[var(--brand-700)]">Timeline du projet</h3>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon="time"
            title="Aucune activité"
            description="L'historique apparaîtra ici au fur et à mesure de la simulation."
          />
        ) : (
          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {entries.map((e, i) => {
              const config = ENTRY_CONFIG[e.type] ?? ENTRY_CONFIG.simulation;
              return (
                <div key={`${e.type}-${e.date}-${i}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', config.iconClass)}>
                    <KeenIcon icon={config.icon} style="duotone" className="text-sm" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--brand-700)]">
                    {e.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--neutral-400)]">{shortDate(e.date)}</span>
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

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/cockpit-timeline-card.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add CockpitTimelineCard

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Composant `CockpitPmoBanner`

**Files:** Create `apps/webapp/src/features/simulation/components/cockpit-pmo-banner.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { useShellState } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { KeenIcon } from '@/components/keenicons';

export function CockpitPmoBanner() {
  const { setPmoOpen } = useShellState();

  return (
    <button
      type="button"
      onClick={() => setPmoOpen(true)}
      className="flex w-full items-center justify-between gap-4 rounded-xl p-4 text-left text-white transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
      style={{ background: 'var(--brand-700)' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)]">
          <KeenIcon icon="abstract-26" style="duotone" className="text-base text-white" />
        </span>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
            Agent PMO
          </span>
          <p className="text-[13px] font-semibold text-white">
            Votre coach vous accompagne à chaque décision de cette simulation.
          </p>
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-semibold text-[var(--accent-300)]">Ouvrir le coach →</span>
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/cockpit-pmo-banner.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add CockpitPmoBanner opening the shell PMO panel

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Réécriture du Cockpit (`simulation-detail.tsx`)

**Files:**
- Rewrite: `apps/webapp/src/features/simulation/pages/simulation-detail.tsx`

- [ ] **Step 1: Remplacer entièrement le contenu du fichier**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { simulationApi } from '../api/simulation.api';
import { HandoverBanner } from '../components/handover-banner';
import { CockpitHeader } from '../components/cockpit-header';
import { CockpitPhaseStrip } from '../components/cockpit-phase-strip';
import { CockpitActionsCard } from '../components/cockpit-actions-card';
import { CockpitTimelineCard } from '../components/cockpit-timeline-card';
import { CockpitPmoBanner } from '../components/cockpit-pmo-banner';
import { KpiGauge, type KpiKey } from '../components/kpi-gauge';
import { useKpiSocket } from '../hooks/use-kpi-socket';
import type { Simulation, TimelineEntry, KpiValues } from '../types/simulation.types';

const KPI_TOOLTIPS: Record<KpiKey, string> = {
  budget: 'Pourcentage du budget restant. En dessous de 40 %, le projet est en danger financier.',
  schedule: "Respect du calendrier. En dessous de 40 %, le projet risque de dépasser les échéances.",
  quality: 'Indice de qualité des livrables et du travail produit.',
  teamMorale: "Moral de l'équipe. Un moral bas réduit la productivité.",
  riskLevel: "Exposition aux risques. Plus c'est bas, plus la situation est critique.",
};

const KPI_LABELS: Record<KpiKey, string> = {
  budget: 'Budget',
  schedule: 'Délai',
  quality: 'Qualité',
  teamMorale: 'Moral équipe',
  riskLevel: 'Risque',
};

function captionFor(kpiKey: KpiKey, kpis: KpiValues, project: Simulation['project']): string | undefined {
  if (kpiKey === 'budget' && project) {
    const remaining = Math.round((kpis.budget / 100) * project.initialBudget);
    return `${remaining.toLocaleString('fr-FR')} € restants sur ${project.initialBudget.toLocaleString('fr-FR')} €`;
  }
  if (kpiKey === 'schedule') {
    if (kpis.schedule >= 90) return 'Dans les temps';
    if (kpis.schedule >= 60) return 'Glissement léger';
    return 'En retard';
  }
  if (kpiKey === 'quality') {
    if (kpis.quality >= 70) return 'Livrables conformes';
    if (kpis.quality >= 40) return 'À surveiller';
    return 'Qualité dégradée';
  }
  if (kpiKey === 'teamMorale') {
    if (kpis.teamMorale >= 70) return 'Équipe motivée';
    if (kpis.teamMorale >= 40) return 'Tensions légères';
    return 'Démotivation';
  }
  if (kpiKey === 'riskLevel') {
    if (kpis.riskLevel <= 30) return 'Sous contrôle';
    if (kpis.riskLevel <= 60) return 'Vigilance';
    return 'Risque élevé';
  }
  return undefined;
}

export default function SimulationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reduce = useReducedMotion();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [simData, timelineData] = await Promise.all([
        simulationApi.getSimulation(id),
        simulationApi.getTimeline(id).catch(() => []),
      ]);
      setSim(simData);
      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleKpiUpdate = useCallback((kpis: KpiValues) => {
    setSim((prev) => {
      if (!prev) return prev;
      const updatedProject = prev.project
        ? {
            ...prev.project,
            currentBudget: Math.round(
              (prev.project.initialBudget * (kpis.budget ?? prev.kpis?.budget ?? 100)) / 100,
            ),
          }
        : prev.project;
      return { ...prev, kpis: { ...prev.kpis!, ...kpis }, project: updatedProject };
    });
  }, []);
  useKpiSocket(id ?? '', handleKpiUpdate);

  async function handlePauseResume() {
    if (!sim || !id) return;
    setActionLoading(true);
    try {
      if (sim.status === 'IN_PROGRESS') await simulationApi.pauseSimulation(id);
      else if (sim.status === 'PAUSED') await simulationApi.resumeSimulation(id);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdvancePhase() {
    if (!id) return;
    setActionLoading(true);
    try {
      await simulationApi.advancePhase(id);
      await loadData();
      toast.success('Phase suivante démarrée — de nouvelles actions sont disponibles.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du passage de phase.');
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations', to: '/simulations' }, { label: 'Cockpit' }]} title="Cockpit" />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-[var(--neutral-400)]" />
              <p className="text-sm font-medium text-[var(--brand-700)]">Impossible de charger cette simulation</p>
              <p className="max-w-md text-xs text-[var(--neutral-500)]">{error}</p>
              <Button variant="primary" size="sm" onClick={() => { setError(null); setLoading(true); loadData(); }}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading || !sim) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations', to: '/simulations' }, { label: 'Cockpit' }]} title="Cockpit" />
        <div className="px-6 pb-8">
          <div className="grid gap-5">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[104px] rounded-lg" />)}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-lg" />
              <Skeleton className="h-72 rounded-lg" />
            </div>
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  const pendingDecisions = sim.decisions?.filter((d) => d.selectedOption === null).length ?? 0;
  const kpis = sim.kpis;

  const breadcrumbs = [
    { label: 'Tableau de bord', to: '/dashboard' },
    { label: 'Simulations', to: '/simulations' },
    { label: sim.project?.name ?? 'Cockpit' },
  ];

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title="Cockpit" />

      <div className="px-6 pb-8">
        <div className="grid gap-5">
          {sim.status === 'ONBOARDING' && (
            <HandoverBanner simulationId={sim.id} onHandoverComplete={loadData} />
          )}

          <CockpitHeader
            sim={sim}
            pendingDecisions={pendingDecisions}
            actionLoading={actionLoading}
            onPauseResume={handlePauseResume}
            onAdvancePhase={handleAdvancePhase}
          />

          <CockpitPhaseStrip phases={sim.phases ?? []} />

          {kpis && (
            <motion.div
              variants={reduce ? undefined : staggerContainer}
              initial={reduce ? undefined : 'hidden'}
              animate={reduce ? undefined : 'show'}
              className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4"
            >
              {(['budget', 'schedule', 'quality', 'teamMorale', 'riskLevel'] as KpiKey[]).map((k) => (
                <motion.div key={k} variants={reduce ? undefined : staggerItem}>
                  <KpiGauge
                    kpiKey={k}
                    label={KPI_LABELS[k]}
                    value={kpis[k]}
                    inverse={k === 'riskLevel'}
                    caption={captionFor(k, kpis, sim.project)}
                    tooltip={KPI_TOOLTIPS[k]}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <CockpitActionsCard
              simulationId={sim.id}
              decisions={sim.decisions ?? []}
              events={sim.randomEvents ?? []}
              meetings={sim.meetings ?? []}
            />
            <CockpitTimelineCard entries={timeline} />
          </div>

          <CockpitPmoBanner />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/pages/simulation-detail.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): rewrite simulation-detail as premium Cockpit page

Merges the old detail and dashboard pages into a single command-center
view: rich header with status/phase pills, phase strip, 5 radial KPI
gauges with contextual captions, pending actions card, project
timeline, and a sombre PMO call-to-action banner. Reuses the new
Cockpit* components.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Redirect `/simulations/:id/dashboard` + suppression de la page

**Files:**
- Modify: `apps/webapp/src/features/simulation/config/simulation.routes.tsx`
- Delete: `apps/webapp/src/features/simulation/pages/simulation-dashboard.tsx`

- [ ] **Step 1: Remplacer le contenu de `simulation.routes.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router';

const SimulationsListPage = lazy(() => import('../pages/simulations-list'));
const CreateSimulationPage = lazy(() => import('../pages/create-simulation'));
const SimulationDetailPage = lazy(() => import('../pages/simulation-detail'));
const DecisionsListPage = lazy(() => import('../pages/decisions-list-page'));
const DecisionPage = lazy(() => import('../pages/decision-page'));
const EventsListPage = lazy(() => import('../pages/events-list-page'));
const TimelinePage = lazy(() => import('../pages/timeline-page'));
const RandomEventPage = lazy(() => import('../pages/random-event-page'));
const KpiHistoryPage = lazy(() => import('../pages/kpi-history-page'));
const ProjectsListPage = lazy(() => import('../pages/projects-list'));
const ProjectDetailPage = lazy(() => import('../pages/project-detail'));
const ProjectTeamPage = lazy(() => import('../pages/project-team'));
const ProjectDeliverablesPage = lazy(() => import('../pages/project-deliverables'));

function DashboardRedirect() {
  // Redirect the legacy /simulations/:id/dashboard route to the merged Cockpit page.
  // We need to read :id from the URL to rebuild the target.
  const m = window.location.pathname.match(/^\/simulations\/([^/]+)\/dashboard\/?$/);
  const id = m?.[1];
  if (!id) return <Navigate to="/simulations" replace />;
  return <Navigate to={`/simulations/${id}`} replace />;
}

export const simulationRoutes = (
  <>
    <Route path="/simulations" element={<Suspense><SimulationsListPage /></Suspense>} />
    <Route path="/simulations/new" element={<Suspense><CreateSimulationPage /></Suspense>} />
    <Route path="/simulations/:id" element={<Suspense><SimulationDetailPage /></Suspense>} />
    <Route path="/simulations/:id/dashboard" element={<DashboardRedirect />} />
    <Route path="/simulations/:id/decisions" element={<Suspense><DecisionsListPage /></Suspense>} />
    <Route path="/simulations/:id/decisions/:decId" element={<Suspense><DecisionPage /></Suspense>} />
    <Route path="/simulations/:id/events" element={<Suspense><EventsListPage /></Suspense>} />
    <Route path="/simulations/:id/events/:evtId" element={<Suspense><RandomEventPage /></Suspense>} />
    <Route path="/simulations/:id/kpis" element={<Suspense><KpiHistoryPage /></Suspense>} />
    <Route path="/simulations/:id/timeline" element={<Suspense><TimelinePage /></Suspense>} />
    <Route path="/projects" element={<Suspense><ProjectsListPage /></Suspense>} />
    <Route path="/projects/:id" element={<Suspense><ProjectDetailPage /></Suspense>} />
    <Route path="/projects/:id/team" element={<Suspense><ProjectTeamPage /></Suspense>} />
    <Route path="/projects/:id/deliverables" element={<Suspense><ProjectDeliverablesPage /></Suspense>} />
  </>
);
```

- [ ] **Step 2: Supprimer le fichier de la page legacy**

```bash
git rm apps/webapp/src/features/simulation/pages/simulation-dashboard.tsx
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/features/simulation/config/simulation.routes.tsx
git commit -m "$(cat <<'EOF'
refactor(simulation): redirect /simulations/:id/dashboard to merged Cockpit

The old SimulationDashboardPage is removed: its content has been folded
into the new Cockpit (simulation-detail). The legacy route now
client-side redirects to /simulations/:id.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Reskin `simulations-list.tsx`

**Files:** Rewrite `apps/webapp/src/features/simulation/pages/simulations-list.tsx`

- [ ] **Step 1: Remplacer entièrement le contenu du fichier**

```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, SimulationPhase, KpiValues } from '../types/simulation.types';

const STATUS_CONFIG: Record<Simulation['status'], { label: string; dot: string; pill: string }> = {
  DRAFT: { label: 'Brouillon', dot: 'bg-[var(--neutral-400)]', pill: 'text-[var(--neutral-500)]' },
  ONBOARDING: { label: 'Passation', dot: 'bg-[var(--brand-500)]', pill: 'text-[var(--brand-700)]' },
  IN_PROGRESS: { label: 'En cours', dot: 'bg-[var(--success-500)]', pill: 'text-[var(--success-700)]' },
  PAUSED: { label: 'En pause', dot: 'bg-[var(--warning-500)]', pill: 'text-[var(--warning-700)]' },
  COMPLETED: { label: 'Terminée', dot: 'bg-[var(--brand-500)]', pill: 'text-[var(--brand-700)]' },
  ABANDONED: { label: 'Abandonnée', dot: 'bg-[var(--error-500)]', pill: 'text-[var(--error-700)]' },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const SECTOR_ICONS: Record<string, string> = {
  IT: 'technology-2',
  CONSTRUCTION: 'home',
  MARKETING: 'chart-line',
  HEALTHCARE: 'heart',
  FINANCE: 'dollar',
  CUSTOM: 'element-11',
};

function kpiStroke(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'stroke-[var(--success-500)]';
  if (v >= 40) return 'stroke-[var(--warning-500)]';
  return 'stroke-[var(--error-500)]';
}

function kpiText(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'text-[var(--success-700)]';
  if (v >= 40) return 'text-[var(--warning-700)]';
  return 'text-[var(--error-700)]';
}

function MiniGauge({ value, label, inverse = false }: { value: number; label: string; inverse?: boolean }) {
  const display = Math.round(value);
  const C = 2 * Math.PI * 16;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * C;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-10">
        <svg className="size-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-[var(--brand-50)]" />
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round" className={kpiStroke(value, inverse)} strokeDasharray={`${dash} ${C}`} />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-[9px] font-bold', kpiText(value, inverse))}>
          {display}
        </span>
      </div>
      <span className="text-[9px] leading-none text-[var(--neutral-400)]">{label}</span>
    </div>
  );
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function phaseBarClass(p: SimulationPhase): string {
  if (p.status === 'COMPLETED') return 'bg-[var(--success-500)]';
  if (p.status === 'ACTIVE') return 'bg-[var(--accent-500)]';
  return 'bg-[var(--brand-100)]';
}

type TabFilter = 'all' | 'IN_PROGRESS' | 'COMPLETED';

export default function SimulationsListPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const statusParam = activeTab === 'all' ? undefined : activeTab;
    simulationApi
      .getSimulations(statusParam)
      .then((data) => setSimulations(data))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'COMPLETED', label: 'Terminées' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations' }]}
        title="Mes simulations"
        subtitle="Pilotez vos simulations en cours, lancez-en de nouvelles."
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
        <div className="mb-5 flex items-center gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                activeTab === t.key
                  ? 'border-[var(--accent-500)] text-[var(--accent-700)]'
                  : 'border-transparent text-[var(--neutral-400)] hover:text-[var(--brand-700)]',
              )}
            >
              {t.label}
              {activeTab === 'all' && t.key === 'all' && (
                <span className="ms-1.5 text-xs text-[var(--neutral-400)]">({simulations.length})</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-[var(--error-700)]">Erreur : {error}</p>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab)}
                className="mt-3 cursor-pointer text-sm font-semibold text-[var(--accent-600)] hover:underline"
              >
                Réessayer
              </button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && simulations.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon="chart-simple"
                title="Aucune simulation"
                description="Choisissez un scénario et plongez dans l'expérience."
                action={{ label: 'Créer ma première simulation', href: '/simulations/new' }}
              />
            </CardContent>
          </Card>
        )}

        {!loading && !error && simulations.length > 0 && (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {simulations.map((sim) => {
              const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
              const completedPhases = sim.phases?.filter((p) => p.status === 'COMPLETED').length ?? 0;
              const totalPhases = sim.phases?.length ?? 0;
              const k = sim.kpis as KpiValues | null;
              const statusCfg = STATUS_CONFIG[sim.status] ?? STATUS_CONFIG.DRAFT;
              const sectorIcon = SECTOR_ICONS[sim.scenario?.sector ?? ''] ?? 'element-11';
              const pendingDecisions = sim.decisions?.filter((d) => d.selectedOption === null).length ?? 0;

              return (
                <motion.div key={sim.id} variants={reduce ? undefined : staggerItem}>
                  <Card
                    className="group cursor-pointer overflow-hidden border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-300)] motion-reduce:transform-none"
                    onClick={() => navigate(`/simulations/${sim.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 pb-3">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className={cn('size-1.5 rounded-full', statusCfg.dot)} />
                            <span className={cn('text-xs font-semibold', statusCfg.pill)}>{statusCfg.label}</span>
                          </div>
                          <span className="text-[10px] text-[var(--neutral-400)]">
                            {sim.startedAt ? relativeDate(sim.startedAt) : 'Non démarré'}
                          </span>
                        </div>

                        <h3 className="truncate font-display text-[15px] font-bold text-[var(--brand-700)] transition-colors group-hover:text-[var(--accent-700)]">
                          {sim.project?.name || 'Projet'}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-[var(--neutral-500)]">
                          {sim.scenario?.title || 'Scénario'}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                            <KeenIcon icon={sectorIcon} style="duotone" className="text-[10px] leading-none" />
                            {sim.scenario?.sector}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                            {DIFFICULTY_LABEL[sim.scenario?.difficulty ?? ''] ?? sim.scenario?.difficulty}
                          </span>
                          {pendingDecisions > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-[var(--warning-50)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning-700)]">
                              {pendingDecisions} décision{pendingDecisions > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-[var(--neutral-400)]">
                            {activePhase ? activePhase.name : completedPhases === totalPhases ? 'Terminé' : 'Phase inconnue'}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--neutral-400)]">
                            {completedPhases}/{totalPhases}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {sim.phases?.map((phase) => (
                            <div key={phase.order} className={cn('h-1.5 flex-1 rounded-full transition-colors', phaseBarClass(phase))} />
                          ))}
                        </div>
                      </div>

                      {k && (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          <div className="flex items-center justify-between">
                            <MiniGauge value={k.budget} label="Budget" />
                            <MiniGauge value={k.schedule} label="Délai" />
                            <MiniGauge value={k.quality} label="Qualité" />
                            <MiniGauge value={k.teamMorale} label="Moral" />
                            <MiniGauge value={k.riskLevel} label="Risque" inverse />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/pages/simulations-list.tsx
git commit -m "$(cat <<'EOF'
refactor(simulation): repaint simulations-list to Simex palette

Toolbar → PageHeader, tokenized status colors and KPI mini-gauges,
accented French strings, accent-tab indicator, staggered card entrance.
Structure unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Extraire `ScenarioCard` (préparation Task 11)

**Files:** Create `apps/webapp/src/features/simulation/components/scenario-card.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';
import type { Scenario } from '../types/simulation.types';

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const DIFFICULTY_PILL: Record<string, string> = {
  BEGINNER: 'bg-[var(--success-50)] text-[var(--success-700)]',
  INTERMEDIATE: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  ADVANCED: 'bg-[var(--error-50)] text-[var(--error-700)]',
  EXPERT: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const TYPE_LABEL: Record<string, string> = {
  GREENFIELD: 'Nouveau projet',
  BROWNFIELD: 'Reprise en cours',
};

const SECTOR_ICONS: Record<string, string> = {
  IT: 'technology-2',
  CONSTRUCTION: 'home',
  MARKETING: 'chart-line',
  HEALTHCARE: 'heart',
  FINANCE: 'dollar',
  CUSTOM: 'element-11',
};

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (s: Scenario) => void;
  recommended?: boolean;
}

export function ScenarioCard({ scenario, onSelect, recommended = false }: ScenarioCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? undefined : staggerItem}>
      <Card
        className="group cursor-pointer border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-300)] motion-reduce:transform-none"
        onClick={() => onSelect(scenario)}
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                <KeenIcon icon={SECTOR_ICONS[scenario.sector] ?? 'element-11'} style="duotone" className="text-sm text-[var(--brand-700)]" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
                {scenario.sector}
              </span>
            </div>
            {recommended && (
              <span className="rounded-full bg-[var(--accent-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-700)]">
                Recommandé
              </span>
            )}
          </div>

          <h3 className="font-display text-[15px] font-bold leading-tight text-[var(--brand-700)] transition-colors group-hover:text-[var(--accent-700)]">
            {scenario.title}
          </h3>
          {scenario.description && (
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--neutral-500)]">
              {scenario.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', DIFFICULTY_PILL[scenario.difficulty] ?? 'bg-[var(--brand-50)] text-[var(--brand-700)]')}>
              {DIFFICULTY_LABEL[scenario.difficulty] ?? scenario.difficulty}
            </span>
            {scenario.scenarioType && (
              <span className="rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                {TYPE_LABEL[scenario.scenarioType] ?? scenario.scenarioType}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/scenario-card.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): extract ScenarioCard reusable component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Reskin `create-simulation.tsx` (chirurgical)

**Files:** Modify `apps/webapp/src/features/simulation/pages/create-simulation.tsx`

> The file is 783 lines; this task makes targeted edits only — no full rewrite. Read the file first before editing to confirm line ranges.

- [ ] **Step 1: Remplacer l'import `Toolbar` + l'en-tête**

In the imports block, **remove** :
```ts
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
```
And **add** :
```ts
import { PageHeader } from '@/components/page-header';
import { ScenarioCard } from '../components/scenario-card';
```

In the JSX (around the current `<Toolbar>…</Toolbar>` block at the top of the `return`), **replace** the entire `<Toolbar>` JSX with :
```tsx
<PageHeader
  breadcrumbs={[
    { label: 'Tableau de bord', to: '/dashboard' },
    { label: 'Simulations', to: '/simulations' },
    { label: 'Nouvelle' },
  ]}
  title="Nouvelle simulation"
  subtitle="Choisissez un scénario ou faites-en générer un par l'IA."
/>
```

If the previous `<Toolbar>` block contained a `Retour` button or other action in `<ToolbarActions>`, remove it — the breadcrumb covers navigation back.

- [ ] **Step 2: Tabs `catalog`/`generate` au style accent**

Find the tab strip (typically a row of two `<button>` elements selecting `activeTab`). Replace each button's `className` with:
```ts
className={cn(
  'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
  activeTab === '<value>'
    ? 'border-[var(--accent-500)] text-[var(--accent-700)]'
    : 'border-transparent text-[var(--neutral-400)] hover:text-[var(--brand-700)]',
)}
```
(where `<value>` is `'catalog'` or `'generate'`). Wrap the strip in `<div className="mb-5 flex items-center gap-1 border-b border-border">…</div>`.

- [ ] **Step 3: Remplacer les définitions `DIFFICULTY_LABELS` / `DIFFICULTY_COLORS` / `SCENARIO_TYPE_CONFIG` / `MORALE_LABELS`**

Replace the existing top-of-file maps with these accented & tokenized versions:
```ts
const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-[var(--success-50)] text-[var(--success-700)]',
  INTERMEDIATE: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  ADVANCED: 'bg-[var(--error-50)] text-[var(--error-700)]',
  EXPERT: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const SCENARIO_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  GREENFIELD: { label: 'Nouveau projet', className: 'bg-[var(--brand-50)] text-[var(--brand-700)]' },
  BROWNFIELD: { label: 'Reprise en cours', className: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
};

const MORALE_LABELS: Record<string, string> = {
  very_low: 'Très bas',
  low: 'Bas',
  neutral: 'Neutre',
  high: 'Haut',
  very_high: 'Très haut',
};
```

- [ ] **Step 4: Remplacer la section "Recommandés"**

Find the section that renders recommended scenarios (around the `Recommandes pour vous` heading). Replace its heading and its mapping by:

```tsx
{recommendedScenarios.length > 0 && (
  <section className="mb-6">
    <h3 className="mb-3 font-display text-[15px] font-bold text-[var(--brand-700)]">
      Recommandés pour vous
    </h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {recommendedScenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          recommended
          onSelect={handleSelectScenario}
        />
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 5: Remplacer la grille principale du catalogue**

Find the main catalog grid (the larger grid mapping `scenarios.map(...)` inside the `catalog` tab). Replace its mapping by:

```tsx
<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
  {scenarios.map((scenario) => (
    <ScenarioCard
      key={scenario.id}
      scenario={scenario}
      onSelect={handleSelectScenario}
    />
  ))}
</div>
```

(Delete the inline card markup that used the old `Card`/`CardContent` with badges — it's now in `ScenarioCard`.)

- [ ] **Step 6: Reskin du Dialog (titres + bouton primaire)**

In the `<Dialog>` block, set the `DialogTitle` className to `font-display text-lg font-extrabold text-[var(--brand-700)]`. For every internal section heading inside the dialog body (typically `<h3>`/`<h4>` for « Objectifs », « Personae », « KPIs initiaux »), set the className to `font-display text-sm font-bold text-[var(--brand-700)]`. Replace the primary "Lancer" button by:
```tsx
<Button variant="primary" size="md" onClick={handleLaunch} disabled={creating}>
  {creating ? 'Lancement…' : 'Lancer la simulation'}
</Button>
```
Replace any "Annuler" button by `<Button variant="outline" size="md" onClick={() => setSelectedScenario(null)}>Annuler</Button>`.

- [ ] **Step 7: Accents français restants**

Search and replace within this file only (Edit tool, one occurrence at a time — don't use `replace_all` for ambiguous strings):
- `Recommandes` → `Recommandés` (already partially done above; sweep the file).
- `Generer` → `Générer`, `Genere` → `Généré`, `generer` → `générer`.
- `Difficulte` → `Difficulté`.
- `Categorie` → `Catégorie`.
- `Telecharger` → `Télécharger`.
- `Equipe` → `Équipe`, `equipe` → `équipe`.
- `Echeance` → `Échéance`, `echeance` → `échéance`.
- `Evenement` → `Événement`, `evenement` → `événement`.
- `Strategie` → `Stratégie`.
- `Modere` / `moderee` → `Modéré` / `modérée`.
- `Tres bas` → `Très bas`, `Tres haut` → `Très haut`.
- Any other obvious missing diacritic encountered while reading.

- [ ] **Step 8: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add apps/webapp/src/features/simulation/pages/create-simulation.tsx
git commit -m "$(cat <<'EOF'
refactor(simulation): repaint create-simulation to Simex palette

Toolbar → PageHeader, accent-styled tabs, ScenarioCard reused for the
two grids, tokenized difficulty/type pills, Dialog reskinned, French
accents swept across the file.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Vérification navigateur

**Files:** none (browser smoke test only)

- [ ] **Step 1: S'assurer que les dev servers tournent**

```bash
curl -sS -o /dev/null -w "api=%{http_code}\n" --max-time 3 http://localhost:3001/health
curl -sS -o /dev/null -w "web=%{http_code}\n" --max-time 3 http://localhost:5173/
```
Expected: `api=200`, `web=200`. If not, start them in two background terminals:
```bash
pnpm --filter @sim360/api dev   # (ensure @sim360/core is built first)
pnpm --filter @sim360/webapp dev
```

- [ ] **Step 2: Smoke navigateur (Playwright + injection token)**

Write a throwaway script `/tmp/hub-verify.mjs`:

```js
import pw from '/Users/shounsa/Documents/Workspaces/simex-pro/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.js';
const { chromium } = pw;
const BASE = 'http://localhost:5173', API = 'http://localhost:3001/api/v1', OUT = '/tmp/hub-verify';

async function fullCapture(page, out) {
  await page.evaluate(() => {
    const main = document.querySelector('main.simex-main');
    if (main) { main.style.position = 'static'; main.style.height = 'auto'; main.style.overflow = 'visible'; }
    const shell = document.querySelector('div.h-screen.overflow-hidden');
    if (shell) { shell.style.height = 'auto'; shell.style.overflow = 'visible'; }
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: out, fullPage: true });
}

(async () => {
  const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@sim360.dev', password:'Admin123!'})});
  const tokens = (await r.json()).tokens;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(([a,r]) => {
    localStorage.setItem('sim360_access_token', a);
    localStorage.setItem('sim360_refresh_token', r);
    localStorage.setItem('onboarding_tour_completed', 'true');
  }, [tokens.accessToken, tokens.refreshToken]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type()==='error') errors.push('CONSOLE ' + m.text()); });
  await import('node:fs/promises').then(fs => fs.mkdir(OUT, { recursive: true }));

  // 1) Liste
  await page.goto(`${BASE}/simulations`, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  console.log('LIST h1=', await page.locator('h1').first().textContent());
  await fullCapture(page, `${OUT}/01-list.png`);

  // 2) Pick first sim id from API (admin user has seeded sims)
  const list = await fetch(`${API}/simulations`, { headers: { Authorization: `Bearer ${tokens.accessToken}` } }).then(r => r.json());
  const simId = list[0]?.id;
  console.log('Using simulation id:', simId);
  if (simId) {
    // 3) Cockpit
    await page.goto(`${BASE}/simulations/${simId}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
    console.log('COCKPIT title h2=', await page.locator('h2').first().textContent());
    console.log('COCKPIT pmo cta visible?', await page.locator('text=Ouvrir le coach').count());
    console.log('COCKPIT gauges count =', await page.locator('div.min-h-\\[104px\\]').count());
    await fullCapture(page, `${OUT}/02-cockpit.png`);

    // 4) Old dashboard route redirects
    await page.goto(`${BASE}/simulations/${simId}/dashboard`, { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
    console.log('REDIRECT to:', page.url());
  }

  // 5) Création
  await page.goto(`${BASE}/simulations/new`, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  console.log('CREATE h1=', await page.locator('h1').first().textContent());
  await fullCapture(page, `${OUT}/03-create.png`);

  console.log('ERRORS:', errors.length ? errors.slice(0, 5) : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
```

Run: `node /tmp/hub-verify.mjs`
Expected output: list `h1="Mes simulations"`, cockpit `h2` = nom de projet, gauges count = 5, PMO CTA visible, redirect URL ends with `/simulations/<id>` (not `/dashboard`), `ERRORS: none`.

- [ ] **Step 3: Inspecter visuellement les 3 screenshots**

Open `/tmp/hub-verify/01-list.png`, `02-cockpit.png`, `03-create.png`. Confirm: palette Simex (Deep Blue + Warm Orange), accents français complets, structure conforme aux maquettes du spec.

- [ ] **Step 4: Commit (optional — no code change in this task)**

Nothing to commit. Report PASS to the controller.

---

## Self-Review (auteur du plan)

**Spec coverage :**
- Fusion `simulation-detail` ↔ `simulation-dashboard` → Tasks 7 + 8. ✓
- Layout A (header → phase strip → 5 KPI → actions/timeline → PMO) → Tasks 2/3/4/5/6/7. ✓
- KpiGauge radial avec inverse, captions, tooltips → Task 1 + usage Task 7. ✓
- CockpitHeader avec pills + actions Pause/Phase suivante (avec `DisabledWithTooltip`) → Task 2. ✓
- CockpitPhaseStrip → Task 3. ✓
- CockpitActionsCard agrégeant décisions/événements/réunions → Task 4. ✓
- CockpitTimelineCard → Task 5. ✓
- CockpitPmoBanner via `useShellState().setPmoOpen` → Task 6. ✓
- HandoverBanner conservé pour ONBOARDING → Task 7 (intégration). ✓
- État erreur + loading sur le Cockpit → Task 7. ✓
- Lien débriefing si COMPLETED/ABANDONED → Task 2 (CockpitHeader). ✓
- Route `/dashboard` → redirect → Task 8. ✓
- Suppression `simulation-dashboard.tsx` → Task 8. ✓
- Liste reskinned (PageHeader, palette, accents, stagger) → Task 9. ✓
- ScenarioCard extrait → Task 10. ✓
- Création reskinned (PageHeader, ScenarioCard, accents, Dialog) → Task 11. ✓
- Animations, responsive, accessibilité → intégrés dans chaque composant. ✓
- Vérification navigateur → Task 12. ✓

**Placeholder scan :** aucun TBD ; chaque étape de code montre le code complet. Task 11 a quelques étapes textuelles d'« Edit chirurgical » (sweeps d'accents) parce que le fichier d'origine est 783 lignes et qu'une réécriture intégrale serait inutilement risquée — l'engineer doit lire le fichier avant d'éditer (rappelé explicitement).

**Type consistency :**
- `KpiKey` défini en Task 1, réutilisé en Task 7 (import explicite). ✓
- `Simulation['status']` discriminant utilisé identiquement en Task 2 (CockpitHeader) et Task 9 (liste). ✓
- `Decision['selectedOption'] === null` cohérent Tasks 4 et 7/9. ✓
- `RandomEvent['severity']` (`LOW|MEDIUM|HIGH|CRITICAL`) cohérent Task 4. ✓
- `SimulationMeeting['status']` filtré sur `'SCHEDULED'|'IN_PROGRESS'` (Task 4) — cohérent avec la déclaration du type (string). ✓
- `useShellState().setPmoOpen` mêmes signatures dans dashboard PMO card et Cockpit PMO banner. ✓
- `PROGRESS_VARIANTS` n'est pas utilisé ici (les jauges sont radiales, pas linéaires) → conforme au spec. ✓
- `staggerContainer`/`staggerItem` cohérents (Tasks 4, 7, 9, 10). ✓
