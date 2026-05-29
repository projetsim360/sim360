# HandoverBanner Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the onboarding stepper (`HandoverBanner`) into a premium immersive bandeau (dark brand gradient + translucent grid + animated accent beams + personalised greeting + clickable past steps), responsive with a vertical timeline on mobile.

**Architecture:** Single-file rewrite of `apps/webapp/src/features/simulation/components/handover-banner.tsx` with two internal sub-components (`DesktopStep`, `MobileStep`) and a shared `StepCircle`. Uses existing primitives: `GridBackground` for grid + beams, `framer-motion` + `lib/motion.ts` helpers for entry/stagger, `useAuth()` for greeting, `useReducedMotion()` for accessibility gating. One small wiring change in `simulation-detail.tsx` to pass the new optional `sim` prop. No backend change.

**Tech Stack:** React 19, Tailwind CSS v4, framer-motion 11, `@/components/ui/grid-background`, `@/components/ui/skeleton`, `@/components/keenicons`, `@/providers/auth-provider`.

**Spec:** `docs/superpowers/specs/2026-05-29-handover-banner-redesign-design.md`

**Branch:** `main` (current workflow — commits go directly to main, no PR per session convention).

**Verification:** No front-end test runner (per `frontend-verification` memory). Verification = `pnpm --filter @sim360/webapp typecheck` + Playwright capture (desktop 1280×980, mobile 375×812, `reducedMotion: 'reduce'` variant).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `apps/webapp/src/features/simulation/components/handover-banner.tsx` | **Rewrite** | New `HandoverBanner` + `StepCircle` + `DesktopStep` + `MobileStep` + `StepMeta`. Single file, ~270 lines. Spec §8 defers any further extraction to "only if > 250 lines"; we land at ~270 — acceptable for v1, extract later if it grows. |
| `apps/webapp/src/features/simulation/pages/simulation-detail.tsx` | **Modify** line 197 | Pass new optional `sim={sim}` prop to `<HandoverBanner>`. |

Nothing else changes. No new files, no API/Prisma/route changes.

---

## Task 1 — Rewrite `handover-banner.tsx`

**Files:**
- Modify (full rewrite): `apps/webapp/src/features/simulation/components/handover-banner.tsx`

This is one large change (the visual + structural redesign of a single, self-contained component). Replacing the file in one commit is cleaner than incremental commits that would leave intermediate states broken.

- [ ] **Step 1: Replace the entire file content**

Open `apps/webapp/src/features/simulation/components/handover-banner.tsx` and replace its full content with:

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GridBackground } from '@/components/ui/grid-background';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useAuth } from '@/providers/auth-provider';
import { simulationApi } from '../api/simulation.api';
import type { HandoverStatus, Simulation, SimulationMeeting } from '../types/simulation.types';

interface HandoverBannerProps {
  simulationId: string;
  sim?: Pick<Simulation, 'project'>;
  onHandoverComplete?: () => void;
}

type StepKey = 'HR' | 'PMO' | 'DONE';
type StepState = 'done' | 'active' | 'future';

const STEP_DEFS: { key: StepKey; label: string; icon: string }[] = [
  { key: 'HR', label: 'Accueil RH', icon: 'people' },
  { key: 'PMO', label: 'Passation PMO', icon: 'notepad' },
  { key: 'DONE', label: 'Démarrage', icon: 'rocket' },
];

const STEP_DURATIONS_MIN: Record<StepKey, number> = { HR: 10, PMO: 15, DONE: 2 };

function StepCircle({
  state,
  icon,
  size,
  showRevisitBadge = false,
}: {
  state: StepState;
  icon: string;
  size: 'sm' | 'md' | 'lg';
  showRevisitBadge?: boolean;
}) {
  const sizeClass =
    size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (state === 'done') {
    return (
      <div className={cn('relative rounded-full bg-white text-[var(--success-500)] flex items-center justify-center', sizeClass)}>
        <KeenIcon icon="check" style="solid" className="text-base leading-none" />
        {showRevisitBadge && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--success-500)] text-white flex items-center justify-center"
          >
            <KeenIcon icon="arrows-circle" style="solid" className="text-[8px] leading-none" />
          </span>
        )}
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className={cn('rounded-full bg-[var(--accent-500)] text-white flex items-center justify-center animate-handover-pulse-ring', sizeClass)}>
        <KeenIcon icon={icon} style="duotone" className="text-base leading-none" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-full bg-white/8 border border-dashed border-white/30 text-white/55 flex items-center justify-center', sizeClass)}>
      <KeenIcon icon={icon} style="duotone" className="text-base leading-none" />
    </div>
  );
}

function StepMeta({ state, durationMin }: { state: StepState; durationMin: number }) {
  if (state === 'done') return <span className="text-[10px] text-white/60">Terminé · revoir →</span>;
  if (state === 'active') return <span className="text-[10px] text-white/80">En cours · ~{durationMin} min</span>;
  return <span className="text-[10px] text-white/40">À venir · ~{durationMin} min</span>;
}

function DesktopStep({
  step,
  state,
  meeting,
}: {
  step: (typeof STEP_DEFS)[number];
  state: StepState;
  meeting: SimulationMeeting | null;
}) {
  const labelClass = state === 'future' ? 'text-white/55' : 'text-white';
  const inner = (
    <div className="flex flex-col items-center w-28" aria-current={state === 'active' ? 'step' : undefined}>
      <StepCircle
        state={state}
        icon={step.icon}
        size={state === 'active' ? 'lg' : 'md'}
        showRevisitBadge={state === 'done' && meeting !== null}
      />
      <p className={cn('mt-2 text-[11px] font-bold', labelClass)}>{step.label}</p>
      <StepMeta state={state} durationMin={STEP_DURATIONS_MIN[step.key]} />
    </div>
  );
  if (state === 'done' && meeting !== null) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className="rounded-md focus-visible:outline-2 focus-visible:outline-white/70"
        aria-label={`Revoir le compte-rendu : ${step.label}`}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function MobileStep({
  step,
  state,
  meeting,
  isLast,
}: {
  step: (typeof STEP_DEFS)[number];
  state: StepState;
  meeting: SimulationMeeting | null;
  isLast: boolean;
}) {
  const labelClass = state === 'future' ? 'text-white/55' : 'text-white';
  const inner = (
    <div className="flex items-start gap-3" aria-current={state === 'active' ? 'step' : undefined}>
      <div className="flex flex-col items-center flex-shrink-0">
        <StepCircle
          state={state}
          icon={step.icon}
          size={state === 'active' ? 'md' : 'sm'}
        />
        {!isLast && (
          <div className={cn('w-[2px] flex-1 min-h-6 mt-1 rounded-full', state === 'done' ? 'bg-white/85' : 'bg-white/20')} />
        )}
      </div>
      <div className={cn('flex-1 min-w-0', isLast ? '' : 'pb-3')}>
        <p className={cn('text-[11px] font-bold', labelClass)}>{step.label}</p>
        <StepMeta state={state} durationMin={STEP_DURATIONS_MIN[step.key]} />
      </div>
    </div>
  );
  if (state === 'done' && meeting !== null) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className="block rounded-md focus-visible:outline-2 focus-visible:outline-white/70"
        aria-label={`Revoir le compte-rendu : ${step.label}`}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

export function HandoverBanner({ simulationId, sim, onHandoverComplete }: HandoverBannerProps) {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<HandoverStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    simulationApi
      .getHandoverStatus(simulationId)
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [simulationId]);

  if (loading) return <Skeleton className="h-72 sm:h-44 w-full rounded-xl mb-5" />;
  if (!status || !status.hasHandover) return null;

  const currentStepIndex = status.isComplete
    ? STEP_DEFS.length - 1
    : STEP_DEFS.findIndex((s) => s.key === status.currentStep);
  const stepIndexDisplay = Math.max(0, currentStepIndex) + 1;
  const remainingMin = STEP_DEFS.slice(currentStepIndex).reduce(
    (acc, s) => acc + STEP_DURATIONS_MIN[s.key],
    0,
  );

  const firstName = user?.firstName ?? 'apprenant';
  const companyName = sim?.project?.client ?? sim?.project?.name ?? 'votre projet';

  const stateOf = (index: number): StepState => {
    if (status.isComplete) return 'done';
    if (index < currentStepIndex) return 'done';
    if (index === currentStepIndex) return 'active';
    return 'future';
  };

  const meetingFor = (key: StepKey): SimulationMeeting | null => {
    if (key === 'HR') return status.hrMeeting;
    if (key === 'PMO') return status.pmoMeeting;
    return null;
  };

  async function handleCompleteHandover() {
    setCompleting(true);
    try {
      await simulationApi.completeHandover(simulationId);
      onHandoverComplete?.();
    } catch {
      // swallow — the parent will surface errors via its own toast flow if needed
    } finally {
      setCompleting(false);
    }
  }

  const ctaClass =
    'bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white shadow-[0_8px_20px_rgba(238,122,58,0.40)] gap-2 w-full sm:w-auto';

  let cta: React.ReactNode = null;
  if (status.currentStep === 'HR' && status.hrMeeting) {
    cta = (
      <Button variant="primary" size="lg" asChild className={ctaClass}>
        <Link to={`/meetings/${status.hrMeeting.id}`} className="inline-flex items-center gap-2">
          <KeenIcon icon="people" style="duotone" className="text-sm leading-none" />
          Commencer l'accueil RH
        </Link>
      </Button>
    );
  } else if (status.currentStep === 'PMO' && status.pmoMeeting) {
    cta = (
      <Button variant="primary" size="lg" asChild className={ctaClass}>
        <Link to={`/meetings/${status.pmoMeeting.id}`} className="inline-flex items-center gap-2">
          <KeenIcon icon="notepad" style="duotone" className="text-sm leading-none" />
          Commencer la passation PMO
        </Link>
      </Button>
    );
  } else {
    cta = (
      <Button
        variant="primary"
        size="lg"
        onClick={handleCompleteHandover}
        disabled={completing}
        className={ctaClass}
      >
        <KeenIcon icon="rocket" style="duotone" className="text-sm leading-none" />
        {completing ? 'Démarrage en cours…' : 'Commencer le projet'}
      </Button>
    );
  }

  return (
    <motion.section
      aria-labelledby="handover-title"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-5"
    >
      <style>{`
        @keyframes handover-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 5px rgba(238,122,58,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(238,122,58,0.20); }
        }
        .animate-handover-pulse-ring { animation: handover-pulse-ring 2s ease-in-out infinite; }
      `}</style>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--brand-900)] via-[var(--brand-800)] to-[var(--brand-700)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(238,122,58,0.42), transparent 70%)' }}
        />
        <GridBackground
          gridSize="12:8"
          colors={{
            background: 'bg-transparent',
            borderColor: 'border-white/10',
            borderSize: '1px',
            borderStyle: 'solid',
          }}
          beams={
            reduce
              ? { count: 0 }
              : {
                  count: 3,
                  colors: ['bg-[var(--accent-500)]', 'bg-[var(--accent-300)]', 'bg-white'],
                  shadow: 'shadow-md shadow-[var(--accent-500)]/50 rounded-full',
                  speed: 5,
                }
          }
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative z-10 p-5 sm:p-6 text-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
            <div>
              <h2 id="handover-title" className="font-display font-bold text-[17px] leading-tight">
                {status.isComplete ? `C'est parti, ${firstName} !` : `Bienvenue, ${firstName}`}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {status.isComplete
                  ? 'Votre prise de poste est validée — lancez le projet.'
                  : `Vos premiers pas chez ${companyName}.`}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={STEP_DEFS.length}
                aria-valuenow={stepIndexDisplay}
                aria-label="Progression de la prise de poste"
                className="bg-white/12 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              >
                {status.isComplete ? 'Prêt' : `Étape ${stepIndexDisplay} / ${STEP_DEFS.length}`}
              </div>
              {!status.isComplete && (
                <span className="text-[10px] text-white/55 hidden sm:inline">≈ {remainingMin} min restantes</span>
              )}
            </div>
          </div>

          {/* Desktop stepper */}
          <motion.ol
            role="list"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="hidden sm:flex items-start justify-center gap-0"
          >
            {STEP_DEFS.map((step, i) => {
              const state = stateOf(i);
              const meeting = meetingFor(step.key);
              const isLast = i === STEP_DEFS.length - 1;
              return (
                <motion.li
                  key={step.key}
                  variants={reduce ? undefined : staggerItem}
                  className="flex items-start"
                >
                  <DesktopStep step={step} state={state} meeting={meeting} />
                  {!isLast && (
                    <div className="flex items-center h-10 mx-1">
                      <div
                        className={cn(
                          'w-14 h-[2px] rounded-full',
                          state === 'done' ? 'bg-white/85' : 'bg-white/20',
                        )}
                      />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>

          {/* Mobile stepper (vertical timeline) */}
          <motion.ol
            role="list"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="flex sm:hidden flex-col"
          >
            {STEP_DEFS.map((step, i) => {
              const state = stateOf(i);
              const meeting = meetingFor(step.key);
              const isLast = i === STEP_DEFS.length - 1;
              return (
                <motion.li key={step.key} variants={reduce ? undefined : staggerItem}>
                  <MobileStep step={step} state={state} meeting={meeting} isLast={isLast} />
                </motion.li>
              );
            })}
          </motion.ol>

          {/* CTA */}
          <div className="mt-5 flex justify-center">{cta}</div>
        </div>
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Typecheck the webapp**

Run:

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS with no errors. If you see a `JSX intrinsic` / `motion.li` type error, ensure framer-motion 11+ is installed (`pnpm --filter @sim360/webapp list framer-motion`).

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/components/handover-banner.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): redesign handover banner — immersive brand banner + grid + beams

Replace the flat 3-step stepper with a premium immersive banner: dark
brand gradient, translucent grid + 3 animated accent beams, personalised
greeting, contextual CTA, completed steps clickable to reopen the
meeting summary. Vertical timeline on mobile. All motion gated by
useReducedMotion. Spec:
docs/superpowers/specs/2026-05-29-handover-banner-redesign-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 — Wire `sim` prop in `simulation-detail.tsx`

**Files:**
- Modify: `apps/webapp/src/features/simulation/pages/simulation-detail.tsx:197`

The new `HandoverBanner` accepts an optional `sim` prop so the greeting subtitle can render the project's client/name. Without it the component falls back to "votre projet" — works but less personal.

- [ ] **Step 1: Edit the one-line prop addition**

Find line 197 in `apps/webapp/src/features/simulation/pages/simulation-detail.tsx`:

```tsx
            <HandoverBanner simulationId={sim.id} onHandoverComplete={loadData} />
```

Replace with:

```tsx
            <HandoverBanner simulationId={sim.id} sim={sim} onHandoverComplete={loadData} />
```

- [ ] **Step 2: Typecheck the webapp**

Run:

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS. The new prop `sim?: Pick<Simulation, 'project'>` accepts the full `Simulation` (excess properties OK on optional prop).

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulation/pages/simulation-detail.tsx
git commit -m "$(cat <<'EOF'
feat(simulation): pass sim to HandoverBanner for personalised greeting

Lets the redesigned banner read project.client (or .name as fallback)
to render "Vos premiers pas chez {company}" instead of the generic
"votre projet" fallback.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — Verification (typecheck + Playwright)

**Files:**
- No source changes.
- Temporary script: `/tmp/handover-banner-verify.mjs` (Playwright, not committed).
- Screenshot output: `/tmp/handover-verify/` (not committed).

This task validates the 6 acceptance criteria from spec §10. No test runner exists for the webapp (per `frontend-verification` memory) — Playwright + typecheck is the verification protocol.

- [ ] **Step 1: Confirm the webapp dev server is running**

Check:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173
```

Expected: `200`. If anything else, start it:

```bash
cd /Users/shounsa/Documents/Workspaces/simex-pro && pnpm --filter @sim360/webapp dev > /tmp/webapp-dev.log 2>&1 &
sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173
```

- [ ] **Step 2: Confirm the API is running**

Check:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/v1/health
```

Expected: `200`. If not, start: `pnpm --filter @sim360/api dev > /tmp/api-dev.log 2>&1 &` (wait ~10 s).

- [ ] **Step 3: Identify an ONBOARDING simulation**

Use the known-good seeded simulation from the prior session: `cmn20q6xk00nrsbg2zrofeo0x`.

If it no longer exists (DB reseeded), get one with:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@sim360.dev","password":"Admin123!"}' | jq -r '.tokens.accessToken')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/simulations | jq -r '.[] | select(.status=="ONBOARDING") | .id' | head -1
```

Use the returned id as `SIM` in the next step.

- [ ] **Step 4: Write the Playwright verification script**

Create `/tmp/handover-banner-verify.mjs`:

```js
import pw from '/Users/shounsa/Documents/Workspaces/simex-pro/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.js';
import { mkdirSync } from 'node:fs';

const { chromium } = pw;
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3001/api/v1';
const OUT = '/tmp/handover-verify';
const SIM = process.env.SIM || 'cmn20q6xk00nrsbg2zrofeo0x';

mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);

async function setup(reducedMotion) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sim360.dev', password: 'Admin123!' }),
  });
  const tokens = (await r.json()).tokens;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 980 },
    reducedMotion,
  });
  await ctx.addInitScript(
    ([a, rt]) => {
      localStorage.setItem('sim360_access_token', a);
      localStorage.setItem('sim360_refresh_token', rt);
      localStorage.setItem('onboarding_tour_completed', 'true');
    },
    [tokens.accessToken, tokens.refreshToken],
  );
  return { browser, ctx };
}

async function run() {
  // ---- Desktop, motion on ----
  log('1. Desktop 1280×980, motion on');
  let { browser, ctx } = await setup('no-preference');
  let page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200));
  });
  await page.goto(`${BASE}/simulations/${SIM}`, { waitUntil: 'networkidle' });
  await page.locator('[aria-labelledby="handover-title"]').waitFor({ timeout: 12000 });
  await page.locator('#handover-title').waitFor();
  const title = await page.locator('#handover-title').innerText();
  const pill = await page.locator('[role="progressbar"]').innerText();
  const stepperCount = await page.locator('[aria-labelledby="handover-title"] ol').count();
  log('  title =', JSON.stringify(title));
  log('  pill =', JSON.stringify(pill));
  log('  stepper ol count =', stepperCount, '(should be 2 — one desktop hidden on mobile, one mobile hidden on desktop)');
  await page.screenshot({ path: `${OUT}/1-desktop.png`, fullPage: false });

  // Wait a beat to let beams render across; second capture proves animation
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/1b-desktop-1.5s.png`, fullPage: false });

  await browser.close();

  // ---- Mobile, motion on ----
  log('2. Mobile 375×812, motion on');
  ({ browser, ctx } = await setup('no-preference'));
  await ctx.close();
  ({ browser, ctx } = await setup('no-preference'));
  page = await ctx.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  page.on('pageerror', (e) => errors.push('M-PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('M-CONSOLE: ' + m.text().slice(0, 200));
  });
  await page.goto(`${BASE}/simulations/${SIM}`, { waitUntil: 'networkidle' });
  await page.locator('[aria-labelledby="handover-title"]').waitFor({ timeout: 12000 });
  const mobileHasOl = await page.locator('[aria-labelledby="handover-title"] ol.flex-col').count();
  log('  mobile vertical timeline (ol.flex-col visible) =', mobileHasOl);
  await page.screenshot({ path: `${OUT}/2-mobile.png`, fullPage: false });
  await browser.close();

  // ---- Desktop, reduced motion ----
  log('3. Desktop 1280×980, reduced motion');
  ({ browser, ctx } = await setup('reduce'));
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('RM-PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('RM-CONSOLE: ' + m.text().slice(0, 200));
  });
  await page.goto(`${BASE}/simulations/${SIM}`, { waitUntil: 'networkidle' });
  await page.locator('[aria-labelledby="handover-title"]').waitFor({ timeout: 12000 });
  await page.screenshot({ path: `${OUT}/3-desktop-reduced.png`, fullPage: false });
  await browser.close();

  // ---- Click "Accueil RH" if it's done to verify revisit link ----
  log('4. Verify completed step is clickable (if any)');
  ({ browser, ctx } = await setup('no-preference'));
  page = await ctx.newPage();
  await page.goto(`${BASE}/simulations/${SIM}`, { waitUntil: 'networkidle' });
  await page.locator('[aria-labelledby="handover-title"]').waitFor({ timeout: 12000 });
  const revisitLinks = await page.locator('a[aria-label^="Revoir le compte-rendu"]').count();
  log('  revisit links (completed steps clickable) =', revisitLinks);
  if (revisitLinks > 0) {
    const href = await page.locator('a[aria-label^="Revoir le compte-rendu"]').first().getAttribute('href');
    log('  first revisit href =', href);
  }
  await browser.close();

  log('\nERRORS:', errors.length ? errors.slice(0, 12) : 'NONE');
}

run().catch((e) => {
  console.error('FAIL', e);
  process.exit(1);
});
```

- [ ] **Step 5: Run the Playwright script**

```bash
node /tmp/handover-banner-verify.mjs
```

Expected output (the exact title may differ — the firstName comes from the logged-in admin user, and the company comes from the simulation):

```
1. Desktop 1280×980, motion on
  title = "Bienvenue, <FirstName>"
  pill = "Étape <N> / 3"
  stepper ol count = 2 (should be 2 — one desktop hidden on mobile, one mobile hidden on desktop)
2. Mobile 375×812, motion on
  mobile vertical timeline (ol.flex-col visible) = 1
3. Desktop 1280×980, reduced motion
4. Verify completed step is clickable (if any)
  revisit links (completed steps clickable) = <0 or more>

ERRORS: NONE
```

If `ERRORS: NONE` and the title / pill / stepper counts match, all 6 acceptance criteria are satisfied.

- [ ] **Step 6: Visually inspect the screenshots**

Open the captures:

```bash
open /tmp/handover-verify/1-desktop.png /tmp/handover-verify/1b-desktop-1.5s.png /tmp/handover-verify/2-mobile.png /tmp/handover-verify/3-desktop-reduced.png
```

Check on `1-desktop.png` (the canonical capture):
- Dark brand gradient background visible.
- Translucent grid lines visible across the banner.
- Halo accent glow in the top-right corner.
- Personalised greeting "Bienvenue, <FirstName>" in white sans-serif (display font).
- Pill "Étape N / 3" top-right with backdrop blur.
- 3 step circles centered, with the current step larger (48 px) and accent-coloured.
- Connecting lines between circles (white for completed, white/20 for upcoming).
- Single accent CTA centered at the bottom with shadow glow.
- No `blue-500`, no `green-500` visible (only Simex tokens).

Compare `1-desktop.png` and `1b-desktop-1.5s.png`: a beam (small accent dot with glow) should be in a different position between the two — proves the animation runs.

Check on `2-mobile.png`:
- Same dark gradient + grid.
- Steps stacked vertically with a connector line on the left.
- CTA is full-width at the bottom.
- No horizontal scrollbar.

Check on `3-desktop-reduced.png`:
- Same layout as `1-desktop.png` but no beams (compare to `1-desktop.png` — beams absent).
- Active step has no pulsing ring (the dot is just static).

- [ ] **Step 7: Verify no French accent regressions**

Run from the project root:

```bash
grep -E "(demarrer|integration|completez|terminee|Demarrage|Integration)" apps/webapp/src/features/simulation/components/handover-banner.tsx
```

Expected: no output.

- [ ] **Step 8: Report verification result**

If all 7 prior steps passed, write a short verification report to the user:

```
Verification: HandoverBanner redesign

Verdict: PASS

Method: typecheck + Playwright on http://localhost:5173, sim <SIM>, admin@sim360.dev.

Steps:
1. Typecheck (webapp) → PASS
2. Desktop 1280×980 → banner renders, title="Bienvenue, <FirstName>", pill="Étape N / 3", 2 stepper <ol> in DOM (responsive variants) → /tmp/handover-verify/1-desktop.png
3. Beams animate (frame at 0 vs 1.5s differs) → /tmp/handover-verify/1b-desktop-1.5s.png
4. Mobile 375×812 → vertical timeline visible, no overflow → /tmp/handover-verify/2-mobile.png
5. Reduced motion → no beams, no pulse → /tmp/handover-verify/3-desktop-reduced.png
6. Completed step links → <N> revisit links found, href=/meetings/<id>
7. French accents → grep clean

Findings: <list anything unexpected — surplus console.warn, a beam that drifts off-screen weirdly, etc. Empty is fine.>
```

If anything failed, do NOT mark Task 3 complete — fix the underlying issue and re-run. No commit is needed for Task 3 unless you also tweaked something in `handover-banner.tsx`.

---

## Self-Review Notes (for the engineer / coordinator)

Done after writing this plan, recorded here for transparency:

**Spec coverage scan** (against spec §10 acceptance criteria):
1. Typecheck stays green → Task 1 step 2 + Task 2 step 2.
2. Banner renders with all visual elements → Task 3 step 5 (Playwright) + step 6 (visual inspection).
3. Mobile responsive at 375 px → Task 3 step 5 mobile run + step 6 inspection.
4. Reduced motion disables beams + pulse → Task 3 step 5 reduced run + step 6.
5. No missing accents → Task 3 step 7 grep.
6. Playwright capture proves rendering, no console errors → Task 3 step 5.

All 6 covered.

**Spec §11 risks coverage:**
- `GridBackground` background override → handled in Task 1 code (`background: 'bg-transparent'`).
- Beam intensity → speed 5, count 3, reduced-motion gated — visible in Task 1 code; if Playwright capture shows them too distracting, the engineer can tune `count: 3 → 2` and `speed: 5 → 6` and re-commit. No separate task needed.
- Halo + grid + beams too noisy → same; tune in-place if needed.
- Durées hardcoded → Task 1 step 1 (constant declared, documented in spec).
- Past step clickable only when meeting exists → encoded in `state === 'done' && meeting !== null` guards in Task 1.

**Placeholder scan:** none — every step has explicit code, command, and expected output.

**Type consistency check:**
- `StepKey = 'HR' | 'PMO' | 'DONE'` — used in `STEP_DEFS`, `STEP_DURATIONS_MIN`, `meetingFor`, matches `HandoverStatus.currentStep`.
- `StepState = 'done' | 'active' | 'future'` — used in `StepCircle`, `DesktopStep`, `MobileStep`, `StepMeta`, `stateOf` — consistent.
- `HandoverBannerProps.sim?: Pick<Simulation, 'project'>` — `simulation-detail.tsx` passes the full `Simulation`, which structurally satisfies `Pick<Simulation, 'project'>` (TS accepts).
- Class name `animate-handover-pulse-ring` matches the `<style>` declaration on line ~239 of the new file.
