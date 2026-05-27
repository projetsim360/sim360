# Scenario Dialog Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réorganiser de façon premium le contenu du Dialog de détail scénario (`/simulations/new`) en 3 composants extraits + intégration, avec un bandeau brownfield sombre brand-700.

**Architecture:** Extraire le JSX inline du Dialog (~230 lignes) en `ScenarioDialogContent`, qui compose `ScenarioPhaseStrip` et `ScenarioBrownfieldBanner`. Le wrapper `<Dialog>` reste dans `create-simulation.tsx` et consomme le nouveau composant. Palette Simex partout.

**Tech Stack:** React 19 + Tailwind v4 + Radix Dialog. Pas de change backend. Spec : `docs/superpowers/specs/2026-05-26-scenario-dialog-redesign-design.md`.

**Convention de vérification :** ni webapp ni API n'ont de runner de tests (voir `MEMORY.md → frontend-verification`). Étape « test » par tâche = `pnpm --filter @sim360/webapp typecheck`. Vérification navigateur en Task 4 (Playwright + token injection user `admin@sim360.dev`/`Admin123!`).

**Branche :** `feat/onboarding-redesign`. Commits en anglais. UI en français (diacritiques complets). NE PAS committer `docs/superpowers/**/2026-05-03-auth-flow-redesign*`. Toujours append `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

**Types de référence** (depuis `apps/webapp/src/features/simulation/types/simulation.types.ts`) :
```ts
interface Scenario {
  id: string; title: string; description: string | null;
  objectives: string[]; sector: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  scenarioType: 'GREENFIELD' | 'BROWNFIELD';
  startingPhaseOrder: number;
  brownfieldContext: BrownfieldContext | null;
  estimatedDurationHours: number;
  competencies: string[];
  phases: { id: string; name: string; type: string; order: number }[];
  isPublished?: boolean;
  _count?: { simulations: number };
}
interface BrownfieldContext {
  previousDecisions: Array<{ phase: number; title: string; outcome: string; impact: 'positive'|'negative'|'neutral' }>;
  completedDeliverables: Array<{ name: string; score: number; status: 'VALIDATED'|'REJECTED' }>;
  accumulatedDelays: number; budgetUsed: number;
  knownRisks: Array<{ title: string; severity: string; status: string }>;
  teamMorale: string; previousPmNotes: string;
}
```

---

## File Structure

- Create `apps/webapp/src/features/simulation/components/scenario-phase-strip.tsx` — strip de phases dérivé du scénario.
- Create `apps/webapp/src/features/simulation/components/scenario-brownfield-banner.tsx` — bandeau sombre brand-700.
- Create `apps/webapp/src/features/simulation/components/scenario-dialog-content.tsx` — contenu complet du dialog (hero + stats + sections + footer), compose les deux précédents.
- Modify `apps/webapp/src/features/simulation/pages/create-simulation.tsx` — remplacer le JSX inline du `<Dialog>` (l. 180-415) par `<ScenarioDialogContent .../>`, nettoyer les imports devenus inutiles.

---

## Task 1: `ScenarioPhaseStrip`

**Files:** Create `apps/webapp/src/features/simulation/components/scenario-phase-strip.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { cn } from '@/lib/utils';

interface ScenarioPhaseStripProps {
  phases: { id: string; name: string; order: number }[];
  scenarioType: 'GREENFIELD' | 'BROWNFIELD';
  startingPhaseOrder: number;
}

type PhaseState = 'done' | 'start' | 'future';

function phaseState(
  order: number,
  scenarioType: 'GREENFIELD' | 'BROWNFIELD',
  startingPhaseOrder: number,
  firstOrder: number,
): PhaseState {
  if (scenarioType === 'BROWNFIELD') {
    if (order < startingPhaseOrder) return 'done';
    if (order === startingPhaseOrder) return 'start';
    return 'future';
  }
  // GREENFIELD: first phase is the start, the rest are future.
  return order === firstOrder ? 'start' : 'future';
}

const SEG_CLASS: Record<PhaseState, string> = {
  done: 'bg-[var(--success-500)]',
  start: 'bg-[var(--accent-500)]',
  future: 'bg-[var(--brand-100)]',
};

const LABEL_CLASS: Record<PhaseState, string> = {
  done: 'text-[var(--success-700)]',
  start: 'text-[var(--accent-700)]',
  future: 'text-[var(--neutral-400)]',
};

const PREFIX: Record<PhaseState, string> = {
  done: '✓ ',
  start: '● ',
  future: '',
};

export function ScenarioPhaseStrip({ phases, scenarioType, startingPhaseOrder }: ScenarioPhaseStripProps) {
  if (!phases || phases.length === 0) return null;
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const firstOrder = sorted[0]?.order ?? 0;

  return (
    <div>
      <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
        Déroulement du projet
        {scenarioType === 'BROWNFIELD' && (
          <span className="ms-1.5 font-medium normal-case tracking-normal text-[var(--accent-700)]">
            — vous démarrez à la phase {startingPhaseOrder + 1}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {sorted.map((phase) => {
          const state = phaseState(phase.order, scenarioType, startingPhaseOrder, firstOrder);
          return (
            <div key={phase.id} className="flex shrink-0 items-center gap-2">
              <div className={cn('h-2 w-12 rounded-full', SEG_CLASS[state])} />
              <span className={cn('whitespace-nowrap text-[11px] font-semibold', LABEL_CLASS[state])}>
                {PREFIX[state]}
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/scenario-phase-strip.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add ScenarioPhaseStrip for the scenario dialog

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `ScenarioBrownfieldBanner`

**Files:** Create `apps/webapp/src/features/simulation/components/scenario-brownfield-banner.tsx`

- [ ] **Step 1: Créer le composant**

```tsx
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { BrownfieldContext } from '../types/simulation.types';

const MORALE_LABELS: Record<string, string> = {
  very_low: 'Très bas',
  low: 'Bas',
  neutral: 'Neutre',
  high: 'Haut',
  very_high: 'Très haut',
};

const RISK_DOT: Record<string, string> = {
  CRITICAL: 'bg-[var(--error-500)]',
  HIGH: 'bg-[var(--accent-500)]',
  MEDIUM: 'bg-[var(--warning-500)]',
  LOW: 'bg-[var(--brand-300)]',
};

interface ScenarioBrownfieldBannerProps {
  ctx: BrownfieldContext;
}

export function ScenarioBrownfieldBanner({ ctx }: ScenarioBrownfieldBannerProps) {
  const activeRisks = ctx.knownRisks.filter((r) => r.status === 'ACTIVE').length;
  const budgetPct = Math.round(ctx.budgetUsed * 100);

  return (
    <div className="rounded-xl p-4 text-white sm:p-5" style={{ background: 'var(--brand-700)' }}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)]">
          <KeenIcon icon="arrows-circle" style="duotone" className="text-sm text-white" />
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--brand-200)]">
            Contexte de reprise
          </div>
          <div className="font-display text-[14px] font-bold text-white">
            Vous reprenez ce projet en cours
          </div>
        </div>
      </div>

      {/* Quote */}
      {ctx.previousPmNotes && (
        <p className="mb-3.5 border-l-2 border-[var(--brand-500)] pl-3 text-[13px] italic leading-relaxed text-[var(--brand-100)]">
          «&nbsp;{ctx.previousPmNotes}&nbsp;»
        </p>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[18px] font-extrabold text-[var(--accent-300)]">
            {ctx.accumulatedDelays}
            <span className="text-[11px]">j</span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">Retard accumulé</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[18px] font-extrabold text-[var(--accent-300)]">{budgetPct}%</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">Budget consommé</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className={cn('font-display text-[18px] font-extrabold', activeRisks >= 3 ? 'text-[#FCA5A5]' : 'text-white')}>
            {activeRisks}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">Risques actifs</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[16px] font-extrabold text-white">
            {MORALE_LABELS[ctx.teamMorale] ?? ctx.teamMorale}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">Moral équipe</div>
        </div>
      </div>

      {/* Risks list */}
      {ctx.knownRisks.length > 0 && (
        <div className="mt-3.5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--brand-200)]">
            Risques identifiés
          </div>
          <div className="flex flex-col gap-1.5">
            {ctx.knownRisks.map((risk, i) => {
              const isActive = risk.status === 'ACTIVE';
              return (
                <div
                  key={`${risk.title}-${i}`}
                  className="flex items-center gap-2.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5"
                >
                  <span className={cn('size-1.5 shrink-0 rounded-full', RISK_DOT[risk.severity] ?? 'bg-[var(--brand-300)]')} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-white">{risk.title}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-white/15 text-white' : 'bg-white/10 text-[var(--brand-200)]',
                    )}
                  >
                    {isActive ? 'Actif' : 'Résolu'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/scenario-brownfield-banner.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): add ScenarioBrownfieldBanner (dark brand-700 PMO-style)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `ScenarioDialogContent` (compose tout) + intégration dans `create-simulation.tsx`

**Files:**
- Create `apps/webapp/src/features/simulation/components/scenario-dialog-content.tsx`
- Modify `apps/webapp/src/features/simulation/pages/create-simulation.tsx`

- [ ] **Step 1: Créer `ScenarioDialogContent`**

Create `apps/webapp/src/features/simulation/components/scenario-dialog-content.tsx`:

```tsx
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { ScenarioPhaseStrip } from './scenario-phase-strip';
import { ScenarioBrownfieldBanner } from './scenario-brownfield-banner';
import type { Scenario } from '../types/simulation.types';

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

interface StatTileProps {
  label: string;
  value: string;
  suffix?: string;
}

function StatTile({ label, value, suffix }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--neutral-400)]">{label}</div>
      <div className="mt-1 font-display text-[18px] font-extrabold text-[var(--brand-700)]">
        {value}
        {suffix && <span className="text-[11px] text-[var(--neutral-300)]">{suffix}</span>}
      </div>
    </div>
  );
}

interface ScenarioDialogContentProps {
  scenario: Scenario;
  isGenerated: boolean;
  creating: boolean;
  onLaunch: () => void;
  onClose: () => void;
}

export function ScenarioDialogContent({
  scenario,
  isGenerated,
  creating,
  onLaunch,
  onClose,
}: ScenarioDialogContentProps) {
  const typeCfg = SCENARIO_TYPE_CONFIG[scenario.scenarioType];

  return (
    <>
      {/* Hero */}
      <div
        className="shrink-0 border-b border-border px-6 pb-4 pt-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-50), #fff)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', DIFFICULTY_COLORS[scenario.difficulty])}>
            {DIFFICULTY_LABELS[scenario.difficulty] ?? scenario.difficulty}
          </span>
          {typeCfg && (
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', typeCfg.className)}>
              {typeCfg.label}
            </span>
          )}
          {isGenerated && (
            <span className="rounded-full bg-[var(--brand-100)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-700)]">
              Généré par l'IA
            </span>
          )}
        </div>
        <DialogTitle className="mt-2.5 font-display text-lg font-extrabold leading-snug text-[var(--brand-700)]">
          {scenario.title}
        </DialogTitle>
        {scenario.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--neutral-500)]">{scenario.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-[var(--neutral-500)]">
            <KeenIcon icon="folder" style="duotone" className="text-[10px] leading-none" />
            {scenario.sector}
          </span>
          {scenario._count?.simulations !== undefined && scenario._count.simulations > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-[var(--neutral-500)]">
              <KeenIcon icon="people" style="duotone" className="text-[10px] leading-none" />
              {scenario._count.simulations} simulation{scenario._count.simulations > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 border-b border-border px-6 py-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Phases" value={String(scenario.phases.length)} />
          <StatTile label="Durée" value={String(scenario.estimatedDurationHours)} suffix="h" />
          <StatTile label="Objectifs" value={String(scenario.objectives.length)} />
          <StatTile label="Compétences" value={String(scenario.competencies.length)} />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-6">
          {/* Objectives + Competencies */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {scenario.objectives.length > 0 && (
              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
                  Objectifs du scénario
                </div>
                <div className="space-y-2">
                  {scenario.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg bg-[var(--brand-50)] p-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-100)] text-[11px] font-bold text-[var(--accent-700)]">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-snug text-[var(--brand-700)]">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {scenario.competencies.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
                    Compétences travaillées
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.competencies.map((comp, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-[var(--brand-100)] bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isGenerated && (
                <div className="rounded-lg border border-[var(--brand-100)] bg-[var(--brand-50)] p-3">
                  <p className="text-xs leading-relaxed text-[var(--brand-700)]">
                    Ce scénario a été généré par l'IA et adapté à votre profil. Vous pouvez le lancer directement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Phase strip */}
          {scenario.phases.length > 0 && (
            <ScenarioPhaseStrip
              phases={scenario.phases}
              scenarioType={scenario.scenarioType}
              startingPhaseOrder={scenario.startingPhaseOrder}
            />
          )}

          {/* Brownfield banner */}
          {scenario.scenarioType === 'BROWNFIELD' && scenario.brownfieldContext && (
            <ScenarioBrownfieldBanner ctx={scenario.brownfieldContext} />
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-[var(--neutral-50)] px-6 py-4">
        <Button variant="outline" size="md" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" size="md" onClick={onLaunch} disabled={creating}>
          {creating ? 'Lancement…' : 'Lancer la simulation'}
        </Button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck du nouveau composant**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Intégrer dans `create-simulation.tsx` — remplacer le JSX inline du Dialog**

In `apps/webapp/src/features/simulation/pages/create-simulation.tsx`, locate the `<Dialog ...>` block (starts at the `{/* Scenario detail modal */}` comment, around line 179). Replace the ENTIRE Dialog block — from `<Dialog open={!!selectedScenario} ...>` through its closing `</Dialog>` — with:

```tsx
{/* Scenario detail modal */}
<Dialog
  open={!!selectedScenario}
  onOpenChange={(open) => {
    if (!open) {
      setSelectedScenario(null);
      setIsGenerated(false);
    }
  }}
>
  <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[820px]">
    {selectedScenario && (
      <ScenarioDialogContent
        scenario={selectedScenario}
        isGenerated={isGenerated}
        creating={creating}
        onLaunch={handleLaunch}
        onClose={() => {
          setSelectedScenario(null);
          setIsGenerated(false);
        }}
      />
    )}
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Ajouter l'import + nettoyer les imports inutilisés**

Add near the other feature imports in `create-simulation.tsx`:
```ts
import { ScenarioDialogContent } from '../components/scenario-dialog-content';
```

The Dialog content extraction removes inline use of `DialogHeader`, `DialogFooter`, `DialogTitle`, and possibly `Badge` / `MORALE_LABELS` from the page. **Run typecheck (next step) to surface unused imports/vars** (the project's eslint flags some; tsconfig has `noUnusedLocals: false`, so unused won't break tsc — but remove obviously dead ones to keep the file clean). Specifically:
- Remove `DialogHeader`, `DialogFooter`, `DialogTitle` from the `@/components/ui/dialog` import IF no longer referenced elsewhere in the file (keep `Dialog`, `DialogContent`).
- Keep `MORALE_LABELS` only if still used elsewhere; if the Dialog was its only consumer, delete the `MORALE_LABELS` const from this file (it now lives in `ScenarioBrownfieldBanner`).
- Keep `Badge` only if still used (the generate tab / other places may use it — grep before removing).

Use grep to confirm before deleting each: `grep -n "DialogTitle\|DialogHeader\|DialogFooter\|MORALE_LABELS\|<Badge" apps/webapp/src/features/simulation/pages/create-simulation.tsx`.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

(Optional) Run: `pnpm --filter @sim360/webapp lint` — fix any unused-import warnings introduced by the extraction.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/features/simulation/components/scenario-dialog-content.tsx apps/webapp/src/features/simulation/pages/create-simulation.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): premium scenario dialog content with stat row and dark brownfield banner

Extract the scenario detail dialog body into ScenarioDialogContent
(hero + 4-stat premium row + Objectifs/Compétences columns + phase strip
+ brownfield banner + sticky footer), wired into create-simulation. Drops
the old flat ad-hoc-coloured layout for the Simex palette.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Vérification navigateur

**Files:** none

- [ ] **Step 1: Dev servers**

```bash
curl -sS -o /dev/null -w "api=%{http_code}\n" --max-time 3 http://localhost:3001/health
curl -sS -o /dev/null -w "web=%{http_code}\n" --max-time 3 http://localhost:5173/
```
Expected: both 200. Else start `pnpm --filter @sim360/api dev` and `pnpm --filter @sim360/webapp dev`.

- [ ] **Step 2: Smoke Playwright**

Write `/tmp/dialog-verify.mjs`:

```js
import pw from '/Users/shounsa/Documents/Workspaces/simex-pro/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.js';
const { chromium } = pw;
const BASE = 'http://localhost:5173', API = 'http://localhost:3001/api/v1', OUT = '/tmp/dialog-verify';

(async () => {
  const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@sim360.dev', password:'Admin123!'})});
  const tokens = (await r.json()).tokens;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
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

  await page.goto(`${BASE}/simulations/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);

  // Click the first scenario card to open the dialog
  const card = page.locator('div.group.cursor-pointer').first();
  await card.click();
  await page.waitForTimeout(700);

  const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
  const hasStats = await page.locator('text=/Phases/').count();
  const hasObjectives = await page.locator('text=Objectifs du scénario').count();
  const hasPhaseStrip = await page.locator('text=Déroulement du projet').count();
  const hasBrownfield = await page.locator('text=Contexte de reprise').count();
  const hasLaunch = await page.locator('text=Lancer la simulation').count();
  console.log('DIALOG visible=', dialogVisible, 'stats=', hasStats, 'objectives=', hasObjectives, 'phaseStrip=', hasPhaseStrip, 'brownfield=', hasBrownfield, 'launchBtn=', hasLaunch);
  await page.screenshot({ path: `${OUT}/dialog.png` });

  // Try to find a BROWNFIELD scenario via API and open it directly is harder; instead
  // iterate cards until brownfield banner shows.
  if (hasBrownfield === 0) {
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const cards = page.locator('div.group.cursor-pointer');
    const n = await cards.count();
    for (let i = 1; i < Math.min(n, 12); i++) {
      await cards.nth(i).click(); await page.waitForTimeout(500);
      const bf = await page.locator('text=Contexte de reprise').count();
      if (bf > 0) { console.log('BROWNFIELD found at card', i); await page.screenshot({ path: `${OUT}/dialog-brownfield.png` }); break; }
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    }
  } else {
    await page.screenshot({ path: `${OUT}/dialog-brownfield.png` });
  }

  console.log('ERRORS:', errors.length ? errors.slice(0, 5) : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
```

Run: `node /tmp/dialog-verify.mjs`
Expected: `DIALOG visible=true`, stats/objectives/phaseStrip/launchBtn counts ≥ 1, `ERRORS: none`. If a brownfield scenario exists in the seed, a `dialog-brownfield.png` shows the dark brand-700 banner.

- [ ] **Step 3: Inspecter les screenshots**

Read `/tmp/dialog-verify/dialog.png` (and `dialog-brownfield.png` if produced). Confirm: hero compact, 4 stat tiles, Objectifs numérotés (pastilles accent), Compétences pills brand, phase strip toné, footer Annuler/Lancer ; sur brownfield, bandeau sombre brand-700 avec citation + 4 KPI tiles + risques.

- [ ] **Step 4: Report PASS** to the controller (no commit — verification only).

---

## Self-Review (auteur du plan)

**Spec coverage :**
- Layout A (hero → stats row → 2 cols → phase strip → brownfield → footer) → Task 3 (`ScenarioDialogContent`). ✓
- Rangée 4 stats premium → Task 3 (`StatTile` × 4). ✓
- Objectifs numérotés (pastille accent) + Compétences pills brand → Task 3. ✓
- Encart « Généré IA » repaletté brand (pas de blue) → Task 3. ✓
- `ScenarioPhaseStrip` dérivant statut de scenarioType + startingPhaseOrder → Task 1. ✓
- Bandeau brownfield sombre brand-700 (variante 2) avec header, citation, 4 KPI tiles, risques → Task 2. ✓
- Couleurs sémantiques sur sombre (accent-300, #FCA5A5 pour risques ≥ 3) → Task 2. ✓
- Dots sévérité doublés par pill statut Actif/Résolu → Task 2. ✓
- Footer sticky Annuler/Lancer accent → Task 3. ✓
- Intégration : wrapper Dialog conservé, consomme le composant, nettoyage imports → Task 3 steps 3-4. ✓
- Responsive (2/4 cols stats, 1/2 cols sections, overflow-x phase strip, 2/4 brownfield) → intégré. ✓
- Vérification navigateur greenfield + brownfield → Task 4. ✓

**Placeholder scan :** aucun TBD ; chaque step de code montre le code complet. Task 3 step 4 (nettoyage imports) contient une instruction conditionnelle « grep avant suppression » — légitime car dépend de l'usage réel dans le fichier (783 lignes), et la commande grep exacte est fournie.

**Type consistency :**
- `BrownfieldContext` (Task 2) = type réel du fichier types (accumulatedDelays, budgetUsed, knownRisks{title,severity,status}, teamMorale, previousPmNotes). ✓
- `ScenarioPhaseStrip` props (phases{id,name,order}, scenarioType, startingPhaseOrder) cohérentes Task 1 ↔ Task 3 (appel). ✓
- `ScenarioBrownfieldBanner` prop `ctx: BrownfieldContext` cohérent Task 2 ↔ Task 3. ✓
- `ScenarioDialogContent` props (scenario, isGenerated, creating, onLaunch, onClose) cohérentes Task 3 ↔ intégration (handleLaunch, creating, isGenerated, close lambda). ✓
- `DialogTitle` importé dans `ScenarioDialogContent` (Task 3) pour conserver l'`aria-labelledby` de Radix — cohérent avec la suppression de son usage inline dans la page. ✓
- `scenario.difficulty` ∈ BEGINNER/INTERMEDIATE/ADVANCED ; les maps incluent EXPERT en clé morte inoffensive (fallback `?? scenario.difficulty`). ✓
