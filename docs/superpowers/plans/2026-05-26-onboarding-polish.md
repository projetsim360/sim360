# Onboarding Iteration-2 (Polish + Animations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Mise en situation / Diagnostic / Parcours onboarding steps, resolve the domain↔sector redundancy, and add a consistent animation layer (incl. app-wide animated progress bars).

**Architecture:** Additive tasks first (shared motion presets, animated `Progress`, new `SkillDeltaBar`), then per-step redesigns that consume them. Each task leaves the build green. Animations use Framer Motion and all honor `prefers-reduced-motion`.

**Tech Stack:** React 19, Vite, Tailwind v4 (`--brand-*`/`--accent-*` tokens), Radix + CVA, KeenIcon, Framer Motion, react-hook-form + zod.

**Spec:** `docs/superpowers/specs/2026-05-26-onboarding-polish-design.md`
**Branche:** `feat/onboarding-redesign`

---

## Verification note (no frontend test runner)

Per `frontend-verification` memory: there is no front test runner. Each task verifies with `pnpm --filter @sim360/webapp typecheck` (must pass), and Task 8 does consolidated browser verification (Playwright, login via API token injection into `localStorage` `sim360_access_token`/`sim360_refresh_token`, admin@sim360.dev / Admin123!). Do not write `*.test.tsx`.

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `apps/webapp/src/lib/motion.ts` | CREATE | Shared Framer Motion presets (stagger container/item, card hover/tap) |
| `apps/webapp/src/components/ui/progress.tsx` | MODIFY | `Progress` animates fill from 0 on mount (app-wide) |
| `apps/webapp/src/features/profile/components/skill-delta-bar.tsx` | CREATE | Animated current→target skill-gap bar |
| `apps/webapp/src/features/profile/pages/aptitude-test-step.tsx` | MODIFY | Redesign the intro screen (category cards + meta + stagger) |
| `apps/webapp/src/features/profile/pages/diagnostic-step.tsx` | REWRITE | Hero verdict + skill-delta bars + animated "AI thinking" loading |
| `apps/webapp/src/features/profile/components/sector-selector.tsx` | REWRITE | Keep grid; add stagger + hover; fix accents |
| `apps/webapp/src/features/profile/pages/choose-path-step.tsx` | MODIFY | Launchpad redesign + sector pre-fill from domain |
| `apps/webapp/src/features/profile/pages/profil-step.tsx` | MODIFY | Card micro-interactions |

Tasks 1→3 are additive. Tasks 4→7 are the redesigns. Task 8 verifies.

---

### Task 1: Shared motion presets

**Files:**
- Create: `apps/webapp/src/lib/motion.ts`

- [ ] **Step 1: Create the presets file**

```tsx
import type { Variants } from 'framer-motion';

/** Container that reveals its children one-by-one. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child item: fades + slides up. Pair with `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

/** whileHover preset — subtle lift. */
export const cardHover = { y: -2, transition: { duration: 0.15 } };

/** whileTap preset — subtle press. */
export const cardTap = { scale: 0.98 };
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/lib/motion.ts
git commit -m "feat(ui): add shared Framer Motion presets"
```

---

### Task 2: Animate the shared Progress bar (app-wide)

**Files:**
- Modify: `apps/webapp/src/components/ui/progress.tsx`

The `Progress` indicator currently renders straight at its final value (no entrance animation). Make it start at 0 and transition to `value` after mount, so every `Progress` in the app animates its fill. Honor reduced motion.

- [ ] **Step 1: Replace the `Progress` function**

Find this exact block:

```tsx
function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
```

Replace with:

```tsx
function Progress({
  className,
  indicatorClassName,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
}) {
  // Start at 0 and animate to `value` after mount so the fill is animated
  // everywhere the component is used. Reduced motion users get it instantly
  // (transition disabled via `motion-reduce`).
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
          'h-full w-full flex-1 bg-primary transition-transform duration-700 ease-out motion-reduce:transition-none',
          indicatorClassName,
        )}
        style={{ transform: `translateX(-${100 - display}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors. (`React` is already imported in this file as `import * as React from 'react'`.)

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/components/ui/progress.tsx
git commit -m "feat(ui): animate Progress fill on mount (app-wide)"
```

---

### Task 3: SkillDeltaBar component

**Files:**
- Create: `apps/webapp/src/features/profile/components/skill-delta-bar.tsx`

Animated current→target skill bar: a filled segment for the current level and a hatched segment for the gap to target. Used by the diagnostic step (Task 5). Unused until then — expected.

- [ ] **Step 1: Create the component**

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { SKILL_LEVEL_LABELS } from '../types/profile.types';
import type { SkillLevel } from '../types/profile.types';

const LEVEL_PCT: Record<SkillLevel, number> = {
  none: 4,
  basic: 33,
  intermediate: 66,
  advanced: 100,
};

interface SkillDeltaBarProps {
  name: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  /** Stagger index for entrance delay. */
  index?: number;
}

export function SkillDeltaBar({ name, currentLevel, targetLevel, index = 0 }: SkillDeltaBarProps) {
  const reduce = useReducedMotion();
  const cur = LEVEL_PCT[currentLevel];
  const target = LEVEL_PCT[targetLevel];
  const gap = Math.max(0, target - cur);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold text-foreground">{name}</span>
        <span className="text-[11.5px] font-medium text-muted-foreground">
          {SKILL_LEVEL_LABELS[currentLevel]}{' '}
          <span className="font-bold text-[var(--accent-700)]">→ {SKILL_LEVEL_LABELS[targetLevel]}</span>
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--brand-50)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand-600)]"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${cur}%` }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${cur}%`,
            background:
              'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 5px, var(--accent-100) 5px, var(--accent-100) 10px)',
          }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${gap}%` }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
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
git add apps/webapp/src/features/profile/components/skill-delta-bar.tsx
git commit -m "feat(onboarding): add animated SkillDeltaBar"
```

---

### Task 4: Redesign Mise en situation intro

**Files:**
- Modify: `apps/webapp/src/features/profile/pages/aptitude-test-step.tsx`

Only the **intro screen** (`if (!isStarted)`) changes. The in-progress and results screens keep their logic.

- [ ] **Step 1: Add imports**

At the top, after the existing React import line `import { useState, useEffect } from 'react';`, add:

```tsx
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion';
```

- [ ] **Step 2: Add the intro categories constant**

After the existing `const CATEGORY_ICONS` declaration (module scope), add:

```tsx
const INTRO_CATEGORIES = [
  { icon: 'sort', title: 'Priorisation', desc: 'Arbitrer entre urgences concurrentes.', tone: 'bg-[var(--accent-50)] text-[var(--accent-700)]' },
  { icon: 'people', title: 'Communication', desc: "Gérer un conflit d'équipe ou client.", tone: 'bg-[var(--brand-50)] text-[var(--brand-600)]' },
  { icon: 'chart-simple', title: 'Gestion budgétaire', desc: 'Réagir à un dépassement de budget.', tone: 'bg-[var(--success-50)] text-[var(--success-700)]' },
] as const;
```

- [ ] **Step 3: Add the reduced-motion flag**

Inside the component, right after the line `const submitTest = useSubmitAptitudeTest();`, add:

```tsx
  const reduce = useReducedMotion();
```

- [ ] **Step 4: Replace the intro screen**

Find the whole intro block (starts with the `// Intro screen` comment and the `if (!isStarted) {` return):

```tsx
  // Intro screen
  if (!isStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <KeenIcon icon="notepad" style="duotone" className="text-5xl text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">3 scénarios de gestion de projet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Vous serez confronté à des situations courantes : gestion des priorités, résolution de
                conflits et maîtrise budgétaire. Il n'y a pas de mauvaise réponse.
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              {SCENARIOS.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <KeenIcon
                    icon={CATEGORY_ICONS[s.category]}
                    style="duotone"
                    className="text-base text-primary"
                  />
                  <span>{CATEGORY_LABELS[s.category]}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="text-sm me-1" />
                Retour
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStarted(true)}
              >
                Commencer le test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
```

Replace it entirely with:

```tsx
  // Intro screen
  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-display text-[13px] font-bold text-[var(--brand-700)]">
            Ce que nous allons évaluer
          </h3>
          <motion.div
            className="grid gap-3 sm:grid-cols-3"
            variants={staggerContainer}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            {INTRO_CATEGORIES.map((c, i) => (
              <motion.div
                key={c.title}
                variants={staggerItem}
                whileHover={reduce ? undefined : cardHover}
                className="relative rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="absolute right-3 top-3 font-display text-[11px] font-extrabold text-[var(--neutral-200)]">
                  0{i + 1}
                </span>
                <span className={cn('mb-3 flex size-10 items-center justify-center rounded-xl', c.tone)}>
                  <KeenIcon icon={c.icon} style="duotone" className="text-lg" />
                </span>
                <div className="text-[13.5px] font-semibold text-foreground">{c.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-[12.5px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="notepad" style="duotone" className="text-base text-[var(--brand-500)]" /> 3 scénarios
          </span>
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="time" style="duotone" className="text-base text-[var(--brand-500)]" /> environ 5 minutes
          </span>
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="check-circle" style="duotone" className="text-base text-[var(--brand-500)]" /> aucune mauvaise réponse
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <Button variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
            <ArrowLeft className="text-sm me-1" />
            Retour
          </Button>
          <Button variant="primary" className="min-h-[44px] px-5" onClick={() => setIsStarted(true)}>
            Commencer
            <ArrowRight className="text-sm ms-1" />
          </Button>
        </div>
      </div>
    );
  }
```

(`Card`/`CardContent`/`CardHeader`/`CardTitle` remain used by the in-progress and results screens — do not remove their imports. `ArrowRight` is already imported.)

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/features/profile/pages/aptitude-test-step.tsx
git commit -m "feat(onboarding): redesign aptitude intro (category cards + stagger)"
```

---

### Task 5: Redesign Diagnostic (hero verdict + skill deltas + AI-thinking loading)

**Files:**
- Rewrite: `apps/webapp/src/features/profile/pages/diagnostic-step.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { ArrowLeft, ArrowRight, Sparkles } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { useProfile, useAnalyzeProfile, useCustomizeSkills } from '../api/profile.api';
import { SkillEditor } from '../components/skill-editor';
import { SkillDeltaBar } from '../components/skill-delta-bar';
import { PROFILE_TYPE_LABELS } from '../types/profile.types';
import type { SkillGap } from '../types/profile.types';

interface DiagnosticStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function DiagnosticStep({ onNext, onBack }: DiagnosticStepProps) {
  const reduce = useReducedMotion();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const analyzeProfile = useAnalyzeProfile();
  const customizeSkills = useCustomizeSkills();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<SkillGap[]>([]);

  useEffect(() => {
    if (!profile?.diagnosticData) {
      analyzeProfile.mutate(undefined, {
        onError: () => toast.error("Erreur lors de l'analyse du profil."),
      });
    }
  }, []);

  useEffect(() => {
    if (profile?.skills) setEditedSkills(profile.skills);
  }, [profile?.skills]);

  const diagnostic = profile?.diagnosticData;
  const isAnalyzing = analyzeProfile.isPending;

  const handleSaveSkills = () => {
    customizeSkills.mutate(editedSkills, {
      onSuccess: () => {
        toast.success('Compétences mises à jour.');
        setIsCustomizing(false);
      },
      onError: () => toast.error('Erreur lors de la sauvegarde des compétences.'),
    });
  };

  if (isProfileLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--brand-100)] bg-[var(--brand-50)] p-8 text-center">
          <span className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-700)] text-white">
            {!reduce && (
              <span className="absolute inset-0 animate-ping rounded-2xl bg-[var(--brand-500)] opacity-30" />
            )}
            <KeenIcon icon="abstract-26" style="duotone" className="relative text-2xl" />
          </span>
          <p className="font-display text-base font-bold text-[var(--brand-700)]">Analyse de votre profil…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Notre IA évalue vos compétences et prépare votre diagnostic.
          </p>
          <div className="mx-auto mt-5 max-w-sm space-y-2.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mx-auto h-3 w-4/5" />
            <Skeleton className="mx-auto h-3 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const hasSkills = !!profile?.skills && profile.skills.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero verdict */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-700), var(--brand-500))' }}
      >
        <Sparkles className="pointer-events-none absolute -right-3 -top-5 text-[120px] opacity-10" />
        <div className="relative flex gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <KeenIcon icon="abstract-26" style="duotone" className="text-2xl" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--brand-200)]">
              Profil détecté par l'IA
            </div>
            {diagnostic?.profileType && (
              <div className="mt-1 font-display text-[22px] font-extrabold">
                {PROFILE_TYPE_LABELS[diagnostic.profileType]}
              </div>
            )}
            {diagnostic?.personalizedMessage && (
              <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-[var(--brand-100)]">
                {diagnostic.personalizedMessage}
              </p>
            )}
            {diagnostic?.suggestedDifficulty && (
              <span className="mt-3 inline-block rounded-full bg-[var(--accent-500)] px-3 py-1 text-[10.5px] font-bold capitalize">
                Difficulté suggérée : {diagnostic.suggestedDifficulty}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {diagnostic?.summary && <p className="text-sm text-muted-foreground">{diagnostic.summary}</p>}

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vos compétences à développer</CardTitle>
            <Button
              variant={isCustomizing ? 'mono' : 'outline'}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              {isCustomizing ? 'Annuler' : 'Personnaliser'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCustomizing ? (
            <div className="space-y-4">
              <SkillEditor skills={editedSkills} onChange={setEditedSkills} />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSaveSkills} disabled={customizeSkills.isPending}>
                  {customizeSkills.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          ) : hasSkills ? (
            <>
              <div className="mb-4 flex gap-4 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-3.5 rounded-sm bg-[var(--brand-600)]" /> Niveau actuel
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-3.5 rounded-sm"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 4px, var(--accent-100) 4px, var(--accent-100) 8px)',
                    }}
                  />{' '}
                  Écart à combler
                </span>
              </div>
              <div className="space-y-4">
                {profile!.skills!.map((skill, i) => (
                  <SkillDeltaBar
                    key={skill.name}
                    name={skill.name}
                    currentLevel={skill.currentLevel}
                    targetLevel={skill.targetLevel}
                    index={i}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucune compétence détectée. Cliquez sur « Personnaliser » pour ajouter vos compétences.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
          <ArrowLeft className="text-sm me-1" />
          Retour
        </Button>
        <Button variant="primary" className="min-h-[44px] px-5" onClick={onNext}>
          Accepter et continuer
          <ArrowRight className="text-sm ms-1" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors. (`Sparkles` is a named export of `@/components/keenicons/icons` — confirm it resolves; it was used by the previous version.)

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/pages/diagnostic-step.tsx
git commit -m "feat(onboarding): redesign diagnostic (hero verdict, skill deltas, AI-thinking loader)"
```

---

### Task 6: Launchpad Parcours + sector pre-fill

**Files:**
- Rewrite: `apps/webapp/src/features/profile/components/sector-selector.tsx`
- Modify: `apps/webapp/src/features/profile/pages/choose-path-step.tsx`

#### 6a — sector-selector.tsx (keep grid, add stagger + hover, fix accents)

- [ ] **Step 1: Replace the entire file**

```tsx
import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { SECTORS } from '../types/profile.types';
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion';

interface SectorSelectorProps {
  value?: string;
  suggestedSector?: string;
  onChange: (sector: string) => void;
  className?: string;
}

export function SectorSelector({ value, suggestedSector, onChange, className }: SectorSelectorProps) {
  const reduce = useReducedMotion();

  const handleKeyDown = useCallback(
    (sectorValue: string) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(sectorValue);
      }
    },
    [onChange],
  );

  return (
    <motion.div
      role="radiogroup"
      aria-label="Sélection du secteur de simulation"
      className={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      {SECTORS.map((sector) => {
        const isSelected = value === sector.value;
        const isSuggested = suggestedSector === sector.value;

        return (
          <motion.div key={sector.value} variants={staggerItem} whileHover={reduce ? undefined : cardHover}>
            <Card
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              aria-label={`${sector.label}${isSuggested ? " (suggéré par l'IA)" : ''}`}
              className={cn(
                'relative h-full cursor-pointer outline-none transition-all hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected && 'border-primary bg-primary/5 ring-2 ring-primary',
                !isSelected && 'hover:border-primary/50',
              )}
              onClick={() => onChange(sector.value)}
              onKeyDown={handleKeyDown(sector.value)}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2.5 p-5">
                {isSuggested && (
                  <Badge variant="primary" size="xs" className="absolute right-2 top-2">
                    Suggéré par l'IA
                  </Badge>
                )}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    isSelected ? 'bg-primary/10' : 'bg-muted',
                  )}
                >
                  <KeenIcon
                    icon={sector.icon}
                    style="duotone"
                    className={cn('text-2xl transition-colors', isSelected ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <span
                  className={cn(
                    'text-center text-sm font-medium transition-colors',
                    isSelected ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {sector.label}
                </span>
                {isSelected && (
                  <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

#### 6b — choose-path-step.tsx (launchpad layout + pre-fill)

- [ ] **Step 3: Add imports**

Add `PROFILE_TYPE_LABELS` to the existing import from `'../types/profile.types'`. The current line is:

```tsx
import { SECTORS } from '../types/profile.types';
```

Change it to:

```tsx
import { SECTORS, PROFILE_TYPE_LABELS } from '../types/profile.types';
```

- [ ] **Step 4: Pre-fill the sector from the domain**

Find:

```tsx
  const [selectedSector, setSelectedSector] = useState<string>(
    profile?.selectedSector ?? profile?.suggestedSector ?? '',
  );
```

Replace with (adds `targetDomain` as a last-resort default — DOMAINS and SECTORS share the same value keys):

```tsx
  const [selectedSector, setSelectedSector] = useState<string>(
    profile?.selectedSector ??
      profile?.suggestedSector ??
      profile?.questionnaireData?.targetDomain ??
      '',
  );
```

- [ ] **Step 5: Replace the difficulty + sector + custom blocks with the launchpad layout**

Find this contiguous block (the difficulty card, the sector card, and the custom-project card):

```tsx
      {/* Difficulty indicator */}
      {suggestedDifficulty && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Difficulte suggeree</p>
              <p className="text-sm text-muted-foreground">
                Basee sur votre profil et vos competences
              </p>
            </div>
            <Badge variant="primary" appearance="light" size="lg" className="capitalize">
              {suggestedDifficulty}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Sector Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Secteur de simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorSelector
            value={selectedSector}
            suggestedSector={
              profile?.diagnosticData?.suggestedSector ?? profile?.suggestedSector
            }
            onChange={handleSectorChange}
          />
        </CardContent>
      </Card>

      {/* Custom Project Option */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Projet personnalise</p>
            <p className="text-sm text-muted-foreground">
              Vous avez un projet specifique ? Decrivez-le et notre IA generera un scenario adapte.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
            <KeenIcon icon="plus" style="duotone" className="text-sm me-1" />
            Proposer un projet
          </Button>
        </CardContent>
      </Card>
```

Replace it with:

```tsx
      {/* Recap strip */}
      {(profile?.profileType || suggestedDifficulty || (profile?.skills?.length ?? 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--brand-100)] bg-[var(--brand-50)] px-4 py-3">
          <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-600)]">
            Votre parcours
          </span>
          {profile?.profileType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              Profil : {PROFILE_TYPE_LABELS[profile.profileType]}
            </span>
          )}
          {suggestedDifficulty && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              Difficulté : {suggestedDifficulty}
            </span>
          )}
          {(profile?.skills?.length ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              {profile!.skills!.length} compétences ciblées
            </span>
          )}
        </div>
      )}

      {/* Sector Selection */}
      <div>
        <h3 className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">Secteur de votre simulation</h3>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
          Basé sur votre domaine et l'analyse IA — modifiable.
        </p>
        <SectorSelector
          value={selectedSector}
          suggestedSector={profile?.diagnosticData?.suggestedSector ?? profile?.suggestedSector}
          onChange={handleSectorChange}
        />
      </div>

      {/* Custom project alternative */}
      <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[var(--brand-200)] bg-muted/40 p-4 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-100)] bg-white">
          <KeenIcon icon="notepad-edit" style="duotone" className="text-lg text-[var(--brand-600)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--brand-700)]">Proposer un projet personnalisé</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Décrivez votre propre projet, notre IA génère un scénario sur mesure.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
          <KeenIcon icon="plus" style="duotone" className="text-sm me-1" />
          Décrire mon projet
        </Button>
      </div>
```

- [ ] **Step 6: Strengthen the launch CTA**

Find:

```tsx
          <Button
            variant="primary"
            className="min-h-[44px] px-5"
            onClick={handleComplete}
            disabled={(!selectedSector && !submittedProject) || completeOnboarding.isPending}
          >
            {completeOnboarding.isPending ? 'Finalisation...' : 'Commencer la simulation'}
            <Play className="text-sm ms-1" />
          </Button>
```

Replace with:

```tsx
          <Button
            variant="primary"
            className="min-h-[48px] px-6 text-base font-bold"
            onClick={handleComplete}
            disabled={(!selectedSector && !submittedProject) || completeOnboarding.isPending}
          >
            <Play className="text-sm me-1.5" />
            {completeOnboarding.isPending ? 'Finalisation…' : 'Lancer ma simulation'}
          </Button>
```

- [ ] **Step 7: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors. If `CardHeader`/`CardTitle` become unused in choose-path-step (they were only used by the removed sector card), remove them from the import to satisfy lint — but verify first with a grep (`grep -n "CardHeader\|CardTitle" apps/webapp/src/features/profile/pages/choose-path-step.tsx`); the submitted-project preview still uses `CardHeader`/`CardTitle`, so they likely remain used. Only remove if genuinely unused.

Note: `notepad-edit` KeenIcon is already used elsewhere in this file (the custom-project dialog title), so it is a valid icon name here.

- [ ] **Step 8: Commit**

```bash
git add apps/webapp/src/features/profile/components/sector-selector.tsx apps/webapp/src/features/profile/pages/choose-path-step.tsx
git commit -m "feat(onboarding): launchpad Parcours, sector pre-fill, animated grid"
```

---

### Task 7: Profil card micro-interactions

**Files:**
- Modify: `apps/webapp/src/features/profile/pages/profil-step.tsx`

Add hover-lift + tap-press to the `OptionCard` (consistency with the other steps). CSS-only; honors reduced motion.

- [ ] **Step 1: Update the OptionCard className**

Find:

```tsx
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] p-3.5 transition-all',
        selected
          ? 'border-[var(--accent-500)] bg-[var(--accent-50)] shadow-sm'
          : 'border-border bg-card hover:border-[var(--brand-300)]',
      )}
```

Replace with:

```tsx
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] motion-reduce:transform-none',
        selected
          ? 'border-[var(--accent-500)] bg-[var(--accent-50)] shadow-sm'
          : 'border-border bg-card hover:border-[var(--brand-300)]',
      )}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/pages/profil-step.tsx
git commit -m "feat(onboarding): add card micro-interactions to Profil options"
```

---

### Task 8: Browser verification (end-to-end)

**Files:** none (runtime verification). Reuse `/tmp/onb-verify/smoke.mjs` from iteration 1 (Playwright at `node_modules/.pnpm/playwright@*/node_modules/playwright`, CJS default import).

Pre-req: API (`:3001`) + webapp (`:5173`) running. Login `admin@sim360.dev` / `Admin123!` via `POST /api/v1/auth/login`, inject `sim360_access_token`/`sim360_refresh_token` into localStorage, then drive `/onboarding`.

- [ ] **Step 1: Typecheck + lint the whole webapp**

Run: `pnpm --filter @sim360/webapp typecheck && pnpm --filter @sim360/webapp lint`
Expected: typecheck clean; lint introduces **no new warnings** in the touched files (`progress.tsx`, `motion.ts`, `skill-delta-bar.tsx`, `aptitude-test-step.tsx`, `diagnostic-step.tsx`, `sector-selector.tsx`, `choose-path-step.tsx`, `profil-step.tsx`).

- [ ] **Step 2: Mise en situation intro (beginner path)**

Drive: Profil → choose objective + **experienceLevel = none** + domain + motivation → Continuer → land on "Mise en situation".
Verify (screenshot): 3 category cards ("Priorisation / Communication / Gestion budgétaire") with icons + descriptions appear (staggered), the meta row ("3 scénarios · environ 5 minutes · aucune mauvaise réponse"), Retour/Commencer. No console errors.

- [ ] **Step 3: Diagnostic**

Answer the 3 scenarios → Terminer → Continuer to Diagnostic. Verify:
- Loading: the "Analyse de votre profil…" card with the pulsing avatar (not a bare skeleton) shows while analyzing.
- Result: the gradient **hero verdict** with the profile type prominent + personalized message + "Difficulté suggérée" pill; then the **skill bars** (current filled + hatched gap) animate in; legend present; "Personnaliser" toggles the SkillEditor.
Screenshot the result state.

- [ ] **Step 4: Parcours (launchpad + pre-fill)**

Continue to Parcours. Verify:
- **Recap strip** chips (Profil / Difficulté / N compétences) — only those with data.
- "Secteur de votre simulation" + note; the sector grid shows with one card pre-selected and a "Suggéré par l'IA" badge (pre-fill from suggestion/domain).
- "ou" separator + "Proposer un projet personnalisé" alternative; the dialog still opens.
- Strong CTA "Lancer ma simulation"; clicking completes → navigates to `/simulations`.
Screenshot.

- [ ] **Step 5: Animated progress bars (app-wide)**

Open any page with a `Progress` bar (e.g., the aptitude in-progress screen, or the dashboard) and confirm the bar **fills from 0** on load (animated), not instantly painted. Confirm under DevTools "Emulate prefers-reduced-motion: reduce" it appears instantly (no transition).

- [ ] **Step 6: Reduced motion**

With `reducedMotion: 'reduce'`, walk the steps: no stagger/hover/scale/slide; content appears statically; the diagnostic loader is static (no ping).

- [ ] **Step 7: Bilan** — document screenshots; verification only (no commit).

---

## Self-Review

**1. Spec coverage:**
- Redundancy pre-fill + reframe → Task 6 (Step 4 pre-fill, Step 5 reframed section + note). ✓
- Mise en situation intro redesign → Task 4. ✓
- Diagnostic hero + skill deltas + AI-thinking loading → Task 5 (+ Task 3 SkillDeltaBar). ✓
- Parcours launchpad (recap, reframed sector, custom alternative, strong CTA) → Task 6. ✓
- Animations: stagger + micro-interactions + success/fill + AI analysis → Tasks 1 (presets), 3/5 (skill fill + loader), 4 (intro stagger/hover), 6 (sector stagger/hover), 7 (Profil micro). ✓
- Progress animated app-wide → Task 2. ✓
- prefers-reduced-motion honored → every animated unit gates on `useReducedMotion()` or `motion-reduce:`. ✓

**2. Placeholders:** none — full code for new files and exact find/replace for edits.

**3. Type consistency:** `staggerContainer`/`staggerItem`/`cardHover`/`cardTap` defined in Task 1 and imported identically in Tasks 4/5(no)/6. `SkillDeltaBar` props (`name`, `currentLevel`, `targetLevel`, `index`) defined in Task 3 and used identically in Task 5. `LEVEL_PCT` keys match `SkillLevel` union. `PROFILE_TYPE_LABELS` import added where used (Tasks 5, 6). `diagnostic.suggestedDifficulty`/`profileType`/`personalizedMessage`/`summary` match `DiagnosticData`.
