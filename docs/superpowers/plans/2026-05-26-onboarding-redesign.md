# Onboarding Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre l'onboarding `/onboarding` en un parcours « 3 temps » au shell marque (rail bleu profond + contenu aéré + aperçu vivant), responsive et fluide, sans toucher au câblage data.

**Architecture:** On regroupe Import + Questionnaire en une étape « Profil ». Un shell autonome (rail desktop / barre mobile) pilote le stepper, l'en-tête de contenu (depuis `STEP_META`) et un panneau d'aperçu vivant qui change par étape. Les étapes existantes (aptitude/diagnostic/parcours) gardent leur logique, perdent leur en-tête propre et s'alignent sur les tokens de marque.

**Tech Stack:** React 19, Vite, Tailwind v4 (tokens CSS `--brand-*`/`--accent-*`), Radix + CVA, KeenIcon, react-hook-form + zod, Framer Motion, TanStack Query.

**Spec de référence :** `docs/superpowers/specs/2026-05-26-onboarding-redesign-design.md`

**Branche :** `feat/onboarding-redesign`

---

## Note de vérification (pas de runner de tests front)

Le webapp n'a **pas** de runner de tests front (pas de Vitest configuré pour ces composants). La vérification de chaque tâche est donc :
1. `pnpm --filter @sim360/webapp typecheck` → **attendu : aucune erreur**.
2. Vérification navigateur consolidée à la **Task 9** (desktop + mobile + parcours conditionnel + reduced-motion).

Ne pas écrire de fichiers `*.test.tsx` : il n'y a pas d'infra pour les exécuter. La preuve de bon fonctionnement vient du typecheck + du navigateur.

## Ordre & dépendances

Tasks 1→4 sont **additives** (nouveaux fichiers, build vert à chaque étape). Task 5 est le **cutover atomique** (réécrit hook + stepper + page, crée rail + topbar, supprime les 3 anciens fichiers ; build vert et fonctionnel en fin de tâche). Tasks 6→8 restylent les étapes restantes. Task 9 vérifie au navigateur.

## File Structure

| Fichier | Action | Responsabilité |
|---|---|---|
| `config/onboarding.config.ts` | CREATE | Type `OnboardingStep`, `STEP_ORDER`, `STEP_META`, `OnboardingLiveState`, `StepperItem` |
| `components/profile-import-panel.tsx` | CREATE | Bandeau d'import optionnel (CV + LinkedIn + dialog) |
| `components/onboarding-live-preview.tsx` | CREATE | Aperçu vivant par étape (variant rail/accordion) |
| `pages/profil-step.tsx` | CREATE | Étape fusionnée import + questionnaire (cartes) |
| `hooks/use-onboarding.ts` | REWRITE | Machine d'état nouveau découpage + compteur dynamique + `stepperItems` |
| `components/onboarding-stepper.tsx` | REWRITE | Stepper orientation vertical/horizontal + entrée conditionnelle |
| `components/onboarding-rail.tsx` | CREATE | Rail desktop (wordmark + stepper + aperçu) |
| `components/onboarding-topbar.tsx` | CREATE | Barre mobile (wordmark + mini-stepper + aperçu accordéon) |
| `pages/onboarding-page.tsx` | REWRITE | Orchestrateur shell + en-tête contenu + transitions |
| `pages/profile-import-step.tsx` | DELETE | Absorbé par profile-import-panel + profil-step |
| `pages/questionnaire-step.tsx` | DELETE | Absorbé par profil-step |
| `components/profile-summary-card.tsx` | DELETE | Remplacé par onboarding-live-preview |
| `pages/aptitude-test-step.tsx` | RESTYLE | Retire en-tête propre, tokens marque, `onLiveChange` |
| `pages/diagnostic-step.tsx` | RESTYLE | Retire en-tête propre, tokens marque |
| `pages/choose-path-step.tsx` | RESTYLE | Retire en-tête propre, tokens marque |

Tous les chemins sont relatifs à `apps/webapp/src/features/profile/`.

---

### Task 1: Config de l'onboarding

**Files:**
- Create: `apps/webapp/src/features/profile/config/onboarding.config.ts`

- [ ] **Step 1: Créer le fichier de config**

Fichier complet :

```tsx
import type { QuestionnaireData } from '../types/profile.types';

export type OnboardingStep = 'profil' | 'aptitude-test' | 'diagnostic' | 'choose-path';

export const STEP_ORDER: OnboardingStep[] = ['profil', 'aptitude-test', 'diagnostic', 'choose-path'];

export interface StepMeta {
  shortLabel: string;
  railSubtitle: string;
  title: string;
  lead: string;
  icon: string;
}

export const STEP_META: Record<OnboardingStep, StepMeta> = {
  'profil': {
    shortLabel: 'Profil',
    railSubtitle: 'Import + questionnaire',
    title: 'Parlez-nous de vous',
    lead: "Quelques informations pour personnaliser votre simulation. Importez votre CV pour gagner du temps, ou répondez directement.",
    icon: 'profile-circle',
  },
  'aptitude-test': {
    shortLabel: 'Mise en situation',
    railSubtitle: '3 scénarios',
    title: 'Mise en situation',
    lead: "Trois situations concrètes de gestion de projet. Il n'y a pas de mauvaise réponse.",
    icon: 'notepad',
  },
  'diagnostic': {
    shortLabel: 'Diagnostic',
    railSubtitle: 'Analyse IA',
    title: 'Votre diagnostic',
    lead: "Voici ce que notre IA a compris de votre profil.",
    icon: 'shield-tick',
  },
  'choose-path': {
    shortLabel: 'Parcours',
    railSubtitle: 'Secteur + lancement',
    title: 'Choisissez votre parcours',
    lead: "Le secteur dans lequel vous allez piloter votre première simulation.",
    icon: 'route',
  },
};

export interface OnboardingLiveState {
  questionnaire?: Partial<QuestionnaireData>;
  aptitudeProgress?: { current: number; total: number; answeredCategories: string[] };
}

export interface StepperItem {
  key: OnboardingStep;
  shortLabel: string;
  railSubtitle: string;
  isConditional: boolean;
  isActive: boolean;
  displayNumber: number | null;
  isCurrent: boolean;
  isCompleted: boolean;
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/config/onboarding.config.ts
git commit -m "feat(onboarding): add step config (meta, order, live state types)"
```

---

### Task 2: Bandeau d'import optionnel

**Files:**
- Create: `apps/webapp/src/features/profile/components/profile-import-panel.tsx`

Extrait/redesign de `profile-import-step.tsx` : conserve **toute** la logique (upload CV, import LinkedIn, validations, toasts, dialog) mais présente un bandeau optionnel compact.

- [ ] **Step 1: Créer le composant**

Fichier complet :

```tsx
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUploadCv, useImportLinkedin } from '../api/profile.api';
import type { UserProfile } from '../types/profile.types';

interface ProfileImportPanelProps {
  profile?: UserProfile;
}

export function ProfileImportPanel({ profile }: ProfileImportPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLinkedinDialog, setShowLinkedinDialog] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  const uploadCv = useUploadCv();
  const importLinkedin = useImportLinkedin();

  const hasCv = !!profile?.cvFileUrl || !!profile?.cvData;
  const hasLinkedin = !!profile?.linkedinData;

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Seuls les fichiers PDF sont acceptés.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 Mo.');
        return;
      }
      const fd = new FormData();
      fd.append('cv', file);
      uploadCv.mutate(fd, {
        onSuccess: (data) => {
          const skillCount =
            data && typeof data === 'object' && 'cvData' in data
              ? ((data as UserProfile).cvData as Record<string, unknown>)?.skillCount
              : undefined;
          toast.success(
            skillCount
              ? `CV importé. ${skillCount} compétences détectées.`
              : 'CV importé avec succès.',
          );
        },
        onError: () => toast.error("Erreur lors de l'import du CV."),
      });
    },
    [uploadCv],
  );

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setLinkedinError('Veuillez saisir une URL LinkedIn.');
      return false;
    }
    if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(url.trim())) {
      setLinkedinError("URL LinkedIn invalide (ex : https://linkedin.com/in/votre-profil).");
      return false;
    }
    setLinkedinError('');
    return true;
  };

  const submitLinkedin = () => {
    if (!validateUrl(linkedinUrl)) return;
    importLinkedin.mutate(
      { linkedinUrl: linkedinUrl.trim() },
      {
        onSuccess: () => {
          toast.success('Données LinkedIn importées avec succès.');
          setShowLinkedinDialog(false);
          setLinkedinUrl('');
          setLinkedinError('');
        },
        onError: () => toast.error("Erreur lors de l'import LinkedIn."),
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border border-[var(--brand-100)] bg-[var(--brand-50)] p-4 sm:flex-row sm:items-center',
          isDragOver && 'border-[var(--accent-500)] ring-2 ring-[var(--accent-500)]/20',
          uploadCv.isPending && 'opacity-70',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files);
        }}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-100)] bg-white">
          <KeenIcon icon="file-up" style="duotone" className="text-lg text-[var(--brand-600)]" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[var(--brand-700)]">Accélérez le profilage</span>
            <Badge variant="secondary" size="xs">Optionnel</Badge>
            {(hasCv || hasLinkedin) && (
              <Badge variant="success" appearance="light" size="xs">Importé</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploadCv.isPending
              ? 'Analyse du CV en cours…'
              : 'Importez votre CV ou votre profil LinkedIn pour pré-remplir vos compétences.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowLinkedinDialog(true)}>
            <KeenIcon icon="linkedin" style="duotone" className="text-sm text-[#0077B5]" />
            LinkedIn
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadCv.isPending}
            onClick={() => document.getElementById('cv-file-input')?.click()}
          >
            <KeenIcon icon="file-up" style="duotone" className="text-sm" />
            CV (PDF)
          </Button>
        </div>
        <input
          id="cv-file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          aria-label="Sélectionner un CV au format PDF"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      <Dialog open={showLinkedinDialog} onOpenChange={setShowLinkedinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="linkedin" style="duotone" className="text-xl text-[#0077B5]" />
              Importer depuis LinkedIn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Collez l'URL de votre profil LinkedIn. Nous extrairons vos expériences, compétences et formations.
            </p>
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">URL du profil LinkedIn</Label>
              <Input
                id="linkedin-url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (linkedinError) setLinkedinError('');
                }}
                placeholder="https://linkedin.com/in/votre-profil"
                aria-invalid={!!linkedinError}
              />
              {linkedinError && <p className="text-xs text-destructive">{linkedinError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowLinkedinDialog(false);
                setLinkedinUrl('');
                setLinkedinError('');
              }}
            >
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={submitLinkedin} disabled={importLinkedin.isPending}>
              {importLinkedin.isPending ? 'Import en cours…' : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur (le composant est créé mais pas encore utilisé — c'est normal).

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/components/profile-import-panel.tsx
git commit -m "feat(onboarding): add optional import panel (CV + LinkedIn)"
```

---

### Task 3: Aperçu vivant

**Files:**
- Create: `apps/webapp/src/features/profile/components/onboarding-live-preview.tsx`

- [ ] **Step 1: Créer le composant**

Fichier complet :

```tsx
import { useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Check } from '@/components/keenicons/icons';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { UserProfile } from '../types/profile.types';
import { PROFILE_TYPE_LABELS, DOMAINS, SECTORS } from '../types/profile.types';
import type { OnboardingStep, OnboardingLiveState } from '../config/onboarding.config';

type LineState = 'done' | 'active' | 'todo';
interface PreviewLine {
  state: LineState;
  label: string;
}
interface PreviewModel {
  title: string;
  lines: PreviewLine[];
  badges?: { label: string; on: boolean }[];
}

const OBJECTIVE_LABELS: Record<string, string> = {
  reinforce: 'Renforcement',
  reconversion: 'Reconversion',
  discovery: 'Découverte',
};
const EXPERIENCE_LABELS: Record<string, string> = {
  none: 'Aucune',
  beginner: 'Débutant',
  confirmed: 'Confirmé',
};

function buildModel(
  profile: UserProfile | undefined,
  step: OnboardingStep,
  live: OnboardingLiveState,
): PreviewModel {
  switch (step) {
    case 'profil': {
      const q = live.questionnaire ?? {};
      const hasImport = !!profile?.cvData || !!profile?.linkedinData || !!profile?.cvFileUrl;
      const skillCount = (profile?.cvData as Record<string, unknown> | undefined)?.skillCount as
        | number
        | undefined;
      const domainLabel = DOMAINS.find((d) => d.value === q.targetDomain)?.label;
      return {
        title: 'Votre profil se construit',
        lines: [
          {
            state: hasImport ? 'done' : 'todo',
            label: hasImport
              ? skillCount
                ? `CV · ${skillCount} compétences`
                : 'Données importées'
              : 'CV / LinkedIn',
          },
          {
            state: q.objective ? 'done' : 'todo',
            label: q.objective ? `Objectif : ${OBJECTIVE_LABELS[q.objective]}` : 'Objectif',
          },
          {
            state: q.targetDomain ? 'done' : 'todo',
            label: domainLabel ? `Domaine : ${domainLabel}` : 'Domaine visé',
          },
          {
            state: q.experienceLevel ? 'done' : 'todo',
            label: q.experienceLevel
              ? `Expérience : ${EXPERIENCE_LABELS[q.experienceLevel]}`
              : 'Expérience',
          },
        ],
      };
    }
    case 'aptitude-test': {
      const p = live.aptitudeProgress;
      const cats = p?.answeredCategories ?? [];
      return {
        title: p ? `Scénario ${p.current} / ${p.total}` : 'Mise en situation',
        lines: [],
        badges: [
          { label: 'Priorisation', on: cats.includes('prioritization') },
          { label: 'Communication', on: cats.includes('communication') },
          { label: 'Budget', on: cats.includes('budget') },
        ],
      };
    }
    case 'diagnostic': {
      const d = profile?.diagnosticData;
      const skillCount = profile?.skills?.length ?? 0;
      if (!d) {
        return { title: 'Analyse IA', lines: [{ state: 'active', label: 'Analyse en cours…' }] };
      }
      return {
        title: 'Analyse IA',
        lines: [
          { state: 'done', label: `Profil : ${PROFILE_TYPE_LABELS[d.profileType]}` },
          {
            state: 'done',
            label: `${skillCount} compétence${skillCount > 1 ? 's' : ''} à renforcer`,
          },
          {
            state: 'done',
            label: `Secteur suggéré : ${
              SECTORS.find((s) => s.value === d.suggestedSector)?.label ?? d.suggestedSector
            }`,
          },
        ],
      };
    }
    case 'choose-path': {
      const sectorValue = profile?.selectedSector ?? profile?.suggestedSector;
      const sectorLabel = SECTORS.find((s) => s.value === sectorValue)?.label ?? sectorValue;
      const diff = profile?.diagnosticData?.suggestedDifficulty ?? profile?.suggestedDifficulty;
      return {
        title: 'Prêt à démarrer',
        lines: [
          { state: sectorLabel ? 'done' : 'todo', label: sectorLabel ? `Secteur : ${sectorLabel}` : 'Secteur à choisir' },
          { state: diff ? 'done' : 'todo', label: diff ? `Difficulté : ${diff}` : 'Difficulté' },
          { state: 'active', label: 'Lancement' },
        ],
      };
    }
    default:
      return { title: '', lines: [] };
  }
}

function StateDot({ state, variant }: { state: LineState; variant: 'rail' | 'accordion' }) {
  if (state === 'done') {
    return (
      <span className="flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[var(--success-500)] text-white">
        <Check className="text-[10px]" />
      </span>
    );
  }
  if (state === 'active') {
    return <span className="size-[17px] shrink-0 animate-pulse rounded-full bg-[var(--accent-500)]" />;
  }
  return (
    <span
      className={cn(
        'size-[17px] shrink-0 rounded-full border',
        variant === 'rail' ? 'border-white/20 bg-white/10' : 'border-border bg-muted',
      )}
    />
  );
}

interface OnboardingLivePreviewProps {
  profile?: UserProfile;
  currentStep: OnboardingStep;
  live: OnboardingLiveState;
  variant: 'rail' | 'accordion';
}

export function OnboardingLivePreview({
  profile,
  currentStep,
  live,
  variant,
}: OnboardingLivePreviewProps) {
  const [open, setOpen] = useState(false);
  const model = buildModel(profile, currentStep, live);
  const total = model.lines.length || (model.badges?.length ?? 0);
  const done =
    model.lines.filter((l) => l.state === 'done').length +
    (model.badges?.filter((b) => b.on).length ?? 0);

  const body = (
    <div className="space-y-2.5">
      {model.lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2 text-[12.5px]">
          <StateDot state={line.state} variant={variant} />
          <span
            className={cn(
              'font-medium',
              variant === 'rail'
                ? line.state === 'todo'
                  ? 'text-[var(--brand-300)]'
                  : 'text-white'
                : line.state === 'todo'
                  ? 'text-muted-foreground'
                  : 'text-foreground',
            )}
          >
            {line.label}
          </span>
        </div>
      ))}
      {model.badges && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {model.badges.map((b) => (
            <span
              key={b.label}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                b.on
                  ? variant === 'rail'
                    ? 'border-[var(--accent-500)]/50 bg-[var(--accent-500)]/20 text-[var(--accent-200)]'
                    : 'border-[var(--accent-300)] bg-[var(--accent-50)] text-[var(--accent-700)]'
                  : variant === 'rail'
                    ? 'border-white/16 bg-white/10 text-[var(--brand-200)]'
                    : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {b.label}
              {b.on ? ' ✓' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (variant === 'accordion') {
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-foreground">
            <KeenIcon icon="profile-circle" style="duotone" className="text-base text-[var(--brand-600)]" />
            Votre profil
          </span>
          <span className="text-[11px] text-muted-foreground">
            {done}/{total} · {model.title}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">{body}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="mt-auto rounded-xl border border-white/12 bg-white/[0.06] p-3.5">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-300)]">
        {model.title}
      </div>
      {body}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/components/onboarding-live-preview.tsx
git commit -m "feat(onboarding): add living preview panel (per-step content)"
```

---

### Task 4: Étape Profil fusionnée

**Files:**
- Create: `apps/webapp/src/features/profile/pages/profil-step.tsx`

Étape 1 fusionnée : bandeau d'import + questionnaire en cartes sélectionnables. Body uniquement (pas de h1, fourni par le shell). Reporte les valeurs au shell via `onLiveChange`.

- [ ] **Step 1: Créer le composant**

Fichier complet :

```tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { ArrowRight } from '@/components/keenicons/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSubmitQuestionnaire } from '../api/profile.api';
import { DOMAINS } from '../types/profile.types';
import type { QuestionnaireData, UserProfile } from '../types/profile.types';
import type { OnboardingLiveState } from '../config/onboarding.config';
import { ProfileImportPanel } from '../components/profile-import-panel';

const schema = z.object({
  objective: z.enum(['reinforce', 'reconversion', 'discovery'], {
    required_error: 'Veuillez sélectionner un objectif.',
  }),
  targetDomain: z.string().min(1, 'Veuillez sélectionner un domaine.'),
  experienceLevel: z.enum(['none', 'beginner', 'confirmed'], {
    required_error: "Veuillez indiquer votre niveau d'expérience.",
  }),
  mainMotivation: z
    .string()
    .min(10, 'Décrivez votre motivation (10 caractères minimum).')
    .max(500, 'Maximum 500 caractères.'),
});

const OBJECTIVES = [
  { value: 'reinforce', icon: 'rocket', label: 'Renforcer mes compétences' },
  { value: 'reconversion', icon: 'arrows-circle', label: 'Reconversion pro' },
  { value: 'discovery', icon: 'route', label: 'Découverte du métier' },
] as const;

const EXPERIENCES = [
  { value: 'none', icon: 'book-open', label: 'Aucune expérience' },
  { value: 'beginner', icon: 'graph-up', label: 'Débutant (< 2 ans)' },
  { value: 'confirmed', icon: 'award', label: 'Confirmé (2 ans +)' },
] as const;

interface ProfilStepProps {
  profile?: UserProfile;
  defaultValues?: QuestionnaireData | null;
  onLiveChange: (live: Partial<OnboardingLiveState>) => void;
  onNext: (data: QuestionnaireData) => void;
}

export function ProfilStep({ profile, defaultValues, onLiveChange, onNext }: ProfilStepProps) {
  const submit = useSubmitQuestionnaire();
  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      objective: undefined as unknown as QuestionnaireData['objective'],
      targetDomain: '',
      experienceLevel: undefined as unknown as QuestionnaireData['experienceLevel'],
      mainMotivation: '',
    },
  });

  const objective = form.watch('objective');
  const targetDomain = form.watch('targetDomain');
  const experienceLevel = form.watch('experienceLevel');

  useEffect(() => {
    onLiveChange({ questionnaire: { objective, targetDomain, experienceLevel } });
  }, [objective, targetDomain, experienceLevel, onLiveChange]);

  const onSubmit = (data: QuestionnaireData) => {
    submit.mutate(data, {
      onSuccess: () => {
        toast.success('Questionnaire enregistré.');
        onNext(data);
      },
      onError: () => toast.error("Erreur lors de l'enregistrement du questionnaire."),
    });
  };

  return (
    <div className="space-y-7">
      <ProfileImportPanel profile={profile} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  Quel est votre objectif principal ?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    {OBJECTIVES.map((o) => (
                      <OptionCard
                        key={o.value}
                        id={`obj-${o.value}`}
                        value={o.value}
                        icon={o.icon}
                        label={o.label}
                        selected={field.value === o.value}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  Votre expérience en gestion de projet
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    {EXPERIENCES.map((o) => (
                      <OptionCard
                        key={o.value}
                        id={`exp-${o.value}`}
                        value={o.value}
                        icon={o.icon}
                        label={o.label}
                        selected={field.value === o.value}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  Domaine qui vous intéresse
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainMotivation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  Votre motivation principale
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Décrivez ce qui vous motive…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" variant="primary" className="min-h-[44px] px-5" disabled={submit.isPending}>
              {submit.isPending ? 'Enregistrement…' : 'Continuer'}
              <ArrowRight className="text-sm ms-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function OptionCard({
  id,
  value,
  icon,
  label,
  selected,
}: {
  id: string;
  value: string;
  icon: string;
  label: string;
  selected: boolean;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] p-3.5 transition-all',
        selected
          ? 'border-[var(--accent-500)] bg-[var(--accent-50)] shadow-sm'
          : 'border-border bg-card hover:border-[var(--brand-300)]',
      )}
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-[9px]',
          selected ? 'bg-[var(--accent-500)] text-white' : 'bg-[var(--brand-50)] text-[var(--brand-600)]',
        )}
      >
        <KeenIcon icon={icon} style="duotone" className="text-base" />
      </span>
      <span className="text-[13px] font-semibold text-[var(--brand-700)]">{label}</span>
      <RadioGroupItem value={value} id={id} className="sr-only" />
    </Label>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/pages/profil-step.tsx
git commit -m "feat(onboarding): add merged Profil step (import + questionnaire cards)"
```

---

### Task 5: Cutover — hook, stepper, rail, topbar, page

**Files:**
- Rewrite: `apps/webapp/src/features/profile/hooks/use-onboarding.ts`
- Rewrite: `apps/webapp/src/features/profile/components/onboarding-stepper.tsx`
- Create: `apps/webapp/src/features/profile/components/onboarding-rail.tsx`
- Create: `apps/webapp/src/features/profile/components/onboarding-topbar.tsx`
- Rewrite: `apps/webapp/src/features/profile/pages/onboarding-page.tsx`
- Delete: `apps/webapp/src/features/profile/pages/profile-import-step.tsx`
- Delete: `apps/webapp/src/features/profile/pages/questionnaire-step.tsx`
- Delete: `apps/webapp/src/features/profile/components/profile-summary-card.tsx`

> Tâche atomique : le build n'est vert qu'en fin de tâche (ces fichiers sont mutuellement couplés). Effectuer toutes les sous-étapes avant le typecheck final.

- [ ] **Step 1: Réécrire le hook `use-onboarding.ts`**

Remplacer **tout** le contenu par :

```tsx
import { useState, useCallback, useMemo } from 'react';
import type { QuestionnaireData } from '../types/profile.types';
import { STEP_ORDER, STEP_META } from '../config/onboarding.config';
import type { OnboardingStep, StepperItem } from '../config/onboarding.config';

export type { OnboardingStep } from '../config/onboarding.config';

interface UseOnboardingOptions {
  initialStep?: OnboardingStep;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(options.initialStep ?? 'profil');
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());

  const needsAptitudeTest = useMemo(
    () => questionnaireData?.experienceLevel === 'none',
    [questionnaireData],
  );

  const steps = useMemo(
    () => STEP_ORDER.filter((s) => s !== 'aptitude-test' || needsAptitudeTest),
    [needsAptitudeTest],
  );

  const currentStepIndex = useMemo(() => steps.indexOf(currentStep), [steps, currentStep]);
  const totalSteps = steps.length;
  const currentNumber = currentStepIndex + 1;

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 100;
    return Math.round((currentStepIndex / (totalSteps - 1)) * 100);
  }, [currentStepIndex, totalSteps]);

  const canGoNext = currentStepIndex < totalSteps - 1;
  const canGoBack = currentStepIndex > 0;

  const goToNext = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep(steps[currentStepIndex + 1]);
  }, [currentStep, steps, currentStepIndex]);

  const goToBack = useCallback(() => {
    if (currentStepIndex <= 0) return;
    setCurrentStep(steps[currentStepIndex - 1]);
  }, [steps, currentStepIndex]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      if (steps.includes(step)) setCurrentStep(step);
    },
    [steps],
  );

  const markCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  const isStepCompleted = useCallback(
    (step: OnboardingStep) => completedSteps.has(step),
    [completedSteps],
  );

  const stepperItems: StepperItem[] = useMemo(
    () =>
      STEP_ORDER.map((key) => {
        const isActive = steps.includes(key);
        const activeIdx = steps.indexOf(key);
        return {
          key,
          shortLabel: STEP_META[key].shortLabel,
          railSubtitle: STEP_META[key].railSubtitle,
          isConditional: key === 'aptitude-test',
          isActive,
          displayNumber: isActive ? activeIdx + 1 : null,
          isCurrent: key === currentStep,
          isCompleted: completedSteps.has(key),
        };
      }),
    [steps, currentStep, completedSteps],
  );

  return {
    currentStep,
    currentStepIndex,
    currentNumber,
    steps,
    totalSteps,
    progress,
    canGoNext,
    canGoBack,
    goToNext,
    goToBack,
    goToStep,
    markCompleted,
    isStepCompleted,
    questionnaireData,
    setQuestionnaireData,
    needsAptitudeTest,
    stepperItems,
  };
}
```

- [ ] **Step 2: Réécrire le stepper `onboarding-stepper.tsx`**

Remplacer **tout** le contenu par :

```tsx
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check } from '@/components/keenicons/icons';
import type { OnboardingStep, StepperItem } from '../config/onboarding.config';

interface OnboardingStepperProps {
  items: StepperItem[];
  orientation: 'vertical' | 'horizontal';
  onStepClick?: (step: OnboardingStep) => void;
}

function Dot({ item, compact }: { item: StepperItem; compact?: boolean }) {
  const size = compact ? 'size-3.5 text-[8px]' : 'size-[34px] text-sm';
  if (item.isCompleted && !item.isCurrent) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[var(--success-500)] font-bold text-white',
          size,
        )}
      >
        {!compact && <Check className="text-base" />}
      </span>
    );
  }
  if (item.isCurrent) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[var(--accent-500)] font-bold text-white',
          size,
        )}
        style={{ boxShadow: '0 0 0 5px rgba(238,122,58,.22)' }}
      >
        {item.displayNumber ?? ''}
      </span>
    );
  }
  if (item.isConditional && !item.isActive) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border-[1.5px] border-dashed border-[var(--accent-300)] font-bold text-[var(--accent-300)]',
          size,
        )}
      >
        ★
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.07] font-bold text-[var(--brand-300)]',
        size,
      )}
    >
      {item.displayNumber ?? ''}
    </span>
  );
}

export function OnboardingStepper({ items, orientation, onStepClick }: OnboardingStepperProps) {
  const handleKeyDown = useCallback(
    (item: StepperItem) => (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && item.isActive && !item.isConditional) {
        e.preventDefault();
        onStepClick?.(item.key);
      }
    },
    [onStepClick],
  );

  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Étapes de l'onboarding" className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <Dot item={item} compact />
            {i < items.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-0.5 w-5 rounded-full',
                  item.isCompleted ? 'bg-[var(--success-500)]' : 'bg-white/16',
                )}
              />
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Étapes de l'onboarding" className="flex flex-col">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const clickable = item.isActive && !item.isConditional;
        return (
          <div key={item.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-current={item.isCurrent ? 'step' : undefined}
                aria-label={`${item.shortLabel}${item.isCurrent ? ' (en cours)' : item.isCompleted ? ' (terminée)' : ''}`}
                onClick={clickable ? () => onStepClick?.(item.key) : undefined}
                onKeyDown={handleKeyDown(item)}
                className={cn(
                  'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-900)]',
                  clickable && 'cursor-pointer',
                )}
              >
                <Dot item={item} />
              </div>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    'my-1 min-h-[26px] w-0.5 flex-1 rounded-full',
                    item.isCompleted ? 'bg-[var(--success-500)]' : 'bg-white/[0.13]',
                  )}
                />
              )}
            </div>
            <div className="pb-5 pt-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[13.5px] font-semibold',
                    item.isCurrent
                      ? 'text-white'
                      : item.isActive
                        ? 'text-[var(--brand-200)]'
                        : 'text-[var(--brand-300)]',
                  )}
                >
                  {item.shortLabel}
                </span>
                {item.isConditional && !item.isActive && (
                  <span className="rounded-full border border-[var(--accent-300)]/40 px-2 py-px text-[9.5px] font-bold uppercase tracking-wide text-[var(--accent-300)]">
                    si débutant
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11.5px] text-[var(--brand-300)]">{item.railSubtitle}</div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Créer le rail `onboarding-rail.tsx`**

```tsx
import { OnboardingStepper } from './onboarding-stepper';
import { OnboardingLivePreview } from './onboarding-live-preview';
import type { UserProfile } from '../types/profile.types';
import type { OnboardingStep, StepperItem, OnboardingLiveState } from '../config/onboarding.config';

interface OnboardingRailProps {
  items: StepperItem[];
  currentStep: OnboardingStep;
  profile?: UserProfile;
  live: OnboardingLiveState;
  onStepClick: (step: OnboardingStep) => void;
}

export function OnboardingRail({ items, currentStep, profile, live, onStepClick }: OnboardingRailProps) {
  return (
    <aside
      className="hidden w-[300px] shrink-0 flex-col p-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen"
      style={{ background: 'linear-gradient(165deg, var(--brand-700), var(--brand-900))' }}
    >
      <div className="mb-9 flex items-center gap-2.5">
        <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-[var(--accent-500)] font-display text-base font-extrabold">
          S
        </span>
        <span className="font-display text-[17px] font-extrabold tracking-tight">Simex pro</span>
      </div>
      <OnboardingStepper items={items} orientation="vertical" onStepClick={onStepClick} />
      <OnboardingLivePreview profile={profile} currentStep={currentStep} live={live} variant="rail" />
    </aside>
  );
}
```

- [ ] **Step 4: Créer la barre mobile `onboarding-topbar.tsx`**

```tsx
import { OnboardingStepper } from './onboarding-stepper';
import { OnboardingLivePreview } from './onboarding-live-preview';
import type { UserProfile } from '../types/profile.types';
import type { OnboardingStep, StepperItem, OnboardingLiveState } from '../config/onboarding.config';

interface OnboardingTopbarProps {
  items: StepperItem[];
  currentStep: OnboardingStep;
  currentNumber: number;
  totalSteps: number;
  profile?: UserProfile;
  live: OnboardingLiveState;
  onStepClick: (step: OnboardingStep) => void;
}

export function OnboardingTopbar({
  items,
  currentStep,
  currentNumber,
  totalSteps,
  profile,
  live,
  onStepClick,
}: OnboardingTopbarProps) {
  return (
    <div className="sticky top-0 z-20 lg:hidden">
      <div
        className="p-4 text-white"
        style={{ background: 'linear-gradient(165deg, var(--brand-700), var(--brand-900))' }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-sm font-extrabold">
            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent-500)] text-xs">
              S
            </span>
            Simex pro
          </span>
          <span className="text-[11px] text-[var(--brand-300)]">
            Étape {currentNumber} sur {totalSteps}
          </span>
        </div>
        <div className="mt-3">
          <OnboardingStepper items={items} orientation="horizontal" onStepClick={onStepClick} />
        </div>
      </div>
      <OnboardingLivePreview profile={profile} currentStep={currentStep} live={live} variant="accordion" />
    </div>
  );
}
```

- [ ] **Step 5: Réécrire la page `onboarding-page.tsx`**

Remplacer **tout** le contenu par :

```tsx
import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useOnboarding } from '../hooks/use-onboarding';
import { useProfile } from '../api/profile.api';
import { STEP_META } from '../config/onboarding.config';
import type { OnboardingLiveState } from '../config/onboarding.config';
import { OnboardingRail } from '../components/onboarding-rail';
import { OnboardingTopbar } from '../components/onboarding-topbar';
import { ProfilStep } from './profil-step';
import { AptitudeTestStep } from './aptitude-test-step';
import { DiagnosticStep } from './diagnostic-step';
import { ChoosePathStep } from './choose-path-step';

const OnboardingPage = () => {
  const { data: profile } = useProfile();
  const [live, setLive] = useState<OnboardingLiveState>({});
  const handleLive = useCallback(
    (p: Partial<OnboardingLiveState>) => setLive((prev) => ({ ...prev, ...p })),
    [],
  );
  const reduce = useReducedMotion();

  const {
    currentStep,
    currentNumber,
    totalSteps,
    stepperItems,
    goToNext,
    goToBack,
    goToStep,
    markCompleted,
    setQuestionnaireData,
    questionnaireData,
  } = useOnboarding();

  const meta = STEP_META[currentStep];

  const renderBody = () => {
    switch (currentStep) {
      case 'profil':
        return (
          <ProfilStep
            profile={profile}
            defaultValues={questionnaireData}
            onLiveChange={handleLive}
            onNext={(data) => {
              setQuestionnaireData(data);
              markCompleted('profil');
              goToNext();
            }}
          />
        );
      case 'aptitude-test':
        return (
          <AptitudeTestStep
            onNext={() => {
              markCompleted('aptitude-test');
              goToNext();
            }}
            onBack={goToBack}
          />
        );
      case 'diagnostic':
        return (
          <DiagnosticStep
            onNext={() => {
              markCompleted('diagnostic');
              goToNext();
            }}
            onBack={goToBack}
          />
        );
      case 'choose-path':
        return <ChoosePathStep onBack={goToBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--neutral-0)]">
      <OnboardingRail
        items={stepperItems}
        currentStep={currentStep}
        profile={profile}
        live={live}
        onStepClick={goToStep}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <OnboardingTopbar
          items={stepperItems}
          currentStep={currentStep}
          currentNumber={currentNumber}
          totalSteps={totalSteps}
          profile={profile}
          live={live}
          onStepClick={goToStep}
        />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-9 sm:px-8 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--accent-700)]">
                Étape {currentNumber} sur {totalSteps}
              </span>
              <h1 className="mt-2 font-display text-[25px] font-extrabold tracking-tight text-[var(--brand-700)]">
                {meta.title}
              </h1>
              <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-[var(--neutral-500)]">
                {meta.lead}
              </p>
              <div className="mt-7">{renderBody()}</div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default OnboardingPage;
```

- [ ] **Step 6: Supprimer les anciens fichiers**

```bash
git rm apps/webapp/src/features/profile/pages/profile-import-step.tsx \
       apps/webapp/src/features/profile/pages/questionnaire-step.tsx \
       apps/webapp/src/features/profile/components/profile-summary-card.tsx
```

- [ ] **Step 7: Typecheck (le build doit être vert maintenant)**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur. Si erreur « Cannot find module './profile-import-step' » ou similaire, vérifier qu'aucun autre fichier ne référence les composants supprimés (`grep -rn "profile-import-step\|questionnaire-step\|profile-summary-card\|ProfileSummaryCard\|ProfileImportStep\|QuestionnaireStep" apps/webapp/src`).

- [ ] **Step 8: Commit**

```bash
git add apps/webapp/src/features/profile/hooks/use-onboarding.ts \
        apps/webapp/src/features/profile/components/onboarding-stepper.tsx \
        apps/webapp/src/features/profile/components/onboarding-rail.tsx \
        apps/webapp/src/features/profile/components/onboarding-topbar.tsx \
        apps/webapp/src/features/profile/pages/onboarding-page.tsx
git commit -m "feat(onboarding): brand-rail shell, 3-act flow, dynamic stepper"
```

---

### Task 6: Restyle de l'étape Mise en situation (aptitude)

**Files:**
- Modify: `apps/webapp/src/features/profile/pages/aptitude-test-step.tsx`
- Modify: `apps/webapp/src/features/profile/pages/onboarding-page.tsx` (wiring `onLiveChange`)

Objectif : retirer les en-têtes centrés propres (le shell fournit titre + lead), reporter la progression à l'aperçu vivant, garder toute la logique. Les cartes d'option sélectionnées restent en `primary` (= accent), c'est conforme à la discipline (accent = sélection).

- [ ] **Step 1: Étendre les props et l'import**

Dans `aptitude-test-step.tsx`, ajouter `useEffect` à l'import React (ligne 1) :

```tsx
import { useState, useEffect } from 'react';
```

Ajouter le type d'import de la config en haut du fichier (après les imports existants) :

```tsx
import type { OnboardingLiveState } from '../config/onboarding.config';
```

Mettre à jour l'interface des props :

```tsx
interface AptitudeTestStepProps {
  onNext: () => void;
  onBack: () => void;
  onLiveChange?: (live: Partial<OnboardingLiveState>) => void;
}
```

Mettre à jour la signature :

```tsx
export function AptitudeTestStep({ onNext, onBack, onLiveChange }: AptitudeTestStepProps) {
```

- [ ] **Step 2: Reporter la progression**

Juste après la ligne `const allAnswered = Object.keys(answers).length === SCENARIOS.length;`, ajouter :

```tsx
  useEffect(() => {
    if (!isStarted || showResults) return;
    onLiveChange?.({
      aptitudeProgress: {
        current: currentScenario + 1,
        total: SCENARIOS.length,
        answeredCategories: SCENARIOS.filter((s) => answers[s.id]).map((s) => s.category),
      },
    });
  }, [isStarted, showResults, currentScenario, answers, onLiveChange]);
```

- [ ] **Step 3: Retirer les en-têtes centrés propres**

Dans le **rendu des résultats** (`if (showResults)`), supprimer le bloc :

```tsx
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Resultats du test</h2>
          <p className="text-sm text-muted-foreground">
            Voici vos scores par categorie. Ces resultats seront utilises pour personnaliser votre
            simulation.
          </p>
        </div>
```

Dans le **rendu intro** (`if (!isStarted)`), supprimer le bloc :

```tsx
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Test d'aptitude</h2>
          <p className="text-sm text-muted-foreground">
            Ce mini-test evalue vos reflexes en gestion de projet a travers 3 mises en situation
            realistes.
          </p>
        </div>
```

Dans le **rendu en cours** (le `return` final), remplacer le bloc d'en-tête :

```tsx
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Test d'aptitude</h2>
          <p className="text-sm text-muted-foreground">
            Scenario {currentScenario + 1} sur {SCENARIOS.length}
          </p>
        </div>
        <Badge variant="info" appearance="light" size="lg">
          <KeenIcon icon={CATEGORY_ICONS[scenario.category]} style="duotone" className="text-sm me-1" />
          {CATEGORY_LABELS[scenario.category]}
        </Badge>
      </div>
```

par (on garde juste l'indicateur de scénario + le badge catégorie, sans le `h2`) :

```tsx
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Scénario {currentScenario + 1} sur {SCENARIOS.length}
        </p>
        <Badge variant="info" appearance="light" size="lg">
          <KeenIcon icon={CATEGORY_ICONS[scenario.category]} style="duotone" className="text-sm me-1" />
          {CATEGORY_LABELS[scenario.category]}
        </Badge>
      </div>
```

- [ ] **Step 4: Câbler `onLiveChange` depuis la page**

Dans `onboarding-page.tsx`, dans `renderBody()`, remplacer le `case 'aptitude-test':` par :

```tsx
      case 'aptitude-test':
        return (
          <AptitudeTestStep
            onLiveChange={handleLive}
            onNext={() => {
              markCompleted('aptitude-test');
              goToNext();
            }}
            onBack={goToBack}
          />
        );
```

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/features/profile/pages/aptitude-test-step.tsx apps/webapp/src/features/profile/pages/onboarding-page.tsx
git commit -m "feat(onboarding): aptitude step reports progress, drop own header"
```

---

### Task 7: Restyle de l'étape Diagnostic

**Files:**
- Modify: `apps/webapp/src/features/profile/pages/diagnostic-step.tsx`

Objectif : retirer l'en-tête centré propre + l'en-tête de l'état « analyse en cours » (le shell fournit titre/lead), aligner le panneau message sur les tokens de marque.

- [ ] **Step 1: Retirer l'en-tête de l'état de chargement**

Dans le bloc `if (isProfileLoading || isAnalyzing)`, supprimer :

```tsx
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Analyse en cours...</h2>
          <p className="text-sm text-muted-foreground">
            Notre IA analyse votre profil pour generer un diagnostic personnalise.
          </p>
        </div>
```

- [ ] **Step 2: Retirer l'en-tête principal**

Dans le `return` principal, supprimer :

```tsx
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Votre diagnostic</h2>
        <p className="text-sm text-muted-foreground">
          Voici le resultat de l'analyse de votre profil par notre IA.
        </p>
      </div>
```

- [ ] **Step 3: Retoken du panneau message (structure → marque)**

Remplacer :

```tsx
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
```

par :

```tsx
            <div className="p-4 rounded-lg bg-[var(--brand-50)] border border-[var(--brand-100)]">
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/profile/pages/diagnostic-step.tsx
git commit -m "feat(onboarding): diagnostic step drops own header, brand tokens"
```

---

### Task 8: Restyle de l'étape Parcours

**Files:**
- Modify: `apps/webapp/src/features/profile/pages/choose-path-step.tsx`

Objectif : retirer l'en-tête centré propre (le shell fournit titre/lead). La sélection secteur/CTA reste en `primary` (accent), conforme.

- [ ] **Step 1: Retirer l'en-tête principal**

Dans le `return`, supprimer :

```tsx
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choisissez votre parcours</h2>
        <p className="text-sm text-muted-foreground">
          Selectionnez le secteur dans lequel vous souhaitez realiser votre simulation.
        </p>
      </div>
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/profile/pages/choose-path-step.tsx
git commit -m "feat(onboarding): choose-path step drops own header"
```

---

### Task 9: Vérification navigateur (end-to-end)

**Files:** aucun (vérification runtime).

Pré-requis : API + webapp lancés (`pnpm --filter @sim360/core build` puis API et webapp en watch). Utilisateur de test : `user@sim360.dev` a la 2FA (inutilisable en automatisation) ; utiliser `admin@sim360.dev` / `Admin123!` (pas de 2FA). L'onboarding est accessible via `/onboarding` (route protégée). Injection du token : clés localStorage `sim360_access_token` / `sim360_refresh_token`.

- [ ] **Step 1: Build + lancement**

```bash
pnpm --filter @sim360/core build
pnpm --filter @sim360/api dev    # port 3001
pnpm --filter @sim360/webapp dev # port 5173
```
Expected: webapp dispo sur http://localhost:5173.

- [ ] **Step 2: Desktop — parcours non-débutant (3 étapes)**

Ouvrir `/onboarding` (connecté). Vérifier au navigateur :
- Rail bleu profond à gauche : wordmark « S Simex pro », stepper vertical (Profil en orange/actif, « Mise en situation » en pointillé avec pill « si débutant », Diagnostic = 2, Parcours = 3), aperçu vivant en bas.
- Contenu : pastille « Étape 1 sur 3 », titre Montserrat « Parlez-nous de vous », lead, bandeau import optionnel, cartes Objectif/Expérience cliquables (sélection orange), select Domaine, textarea Motivation.
- Choisir Objectif = Renforcer, Expérience = **Confirmé**, un Domaine, saisir une motivation → l'aperçu vivant se coche en direct → « Continuer ».
- Le compteur reste « sur 3 » ; l'étape suivante est **Diagnostic** (le test d'aptitude est sauté).
Expected: capture d'écran montrant le rail + étape Profil ; transition fluide vers Diagnostic.

- [ ] **Step 3: Desktop — parcours débutant (4 étapes, révélation conditionnelle)**

Recharger `/onboarding`. À l'étape Profil, choisir Expérience = **Aucune expérience**. Vérifier :
- Le compteur passe de « sur 3 » à « sur 4 » ; l'entrée « Mise en situation » du rail devient active (numérotée 2, plus en pointillé) et Diagnostic/Parcours se renumérotent (3, 4).
- « Continuer » → étape **Mise en situation** : intro puis 3 scénarios ; l'aperçu vivant affiche « Scénario X / 3 » + badges catégories qui se cochent.
Expected: capture montrant la bascule 3→4 et l'étape Mise en situation.

- [ ] **Step 4: Diagnostic + Parcours**

Poursuivre jusqu'au Diagnostic (skeleton pendant l'analyse, aperçu « Analyse en cours… » puis profil détecté), puis Parcours (sélection secteur, aperçu « Secteur / Difficulté / Lancement »). Lancer « Commencer la simulation » → redirige vers `/simulations`.
Expected: chaîne complète sans erreur console ; aperçu vivant cohérent à chaque étape.

- [ ] **Step 5: Mobile (≤ lg)**

Réduire la fenêtre à ~375px (ou device toolbar). Vérifier :
- Le rail disparaît, une **barre supérieure** bleue apparaît (wordmark + mini-stepper horizontal + « Étape X sur N »).
- Sous la barre, accordéon « Votre profil · n/total » qui s'ouvre/ferme.
- Contenu pleine largeur, cibles tactiles ≥ 44px, bouton « Continuer » accessible.
Expected: capture mobile de l'étape Profil.

- [ ] **Step 6: Reduced motion**

Activer « prefers-reduced-motion: reduce » (DevTools > Rendering > Emulate CSS prefers-reduced-motion). Naviguer entre étapes → pas de slide horizontal (fondu uniquement).
Expected: transitions sans translation.

- [ ] **Step 7: Bilan**

Si tout passe, la fonctionnalité est vérifiée. Documenter les captures dans le résumé de tâche. Aucune commit (vérification seule).

---

## Self-Review (rempli pendant la rédaction)

**1. Couverture du spec :**
- Découpage 3 temps → Task 1 (config/STEP_ORDER) + Task 5 (hook). ✓
- Fusion import + questionnaire → Task 2 + Task 4 (ProfilStep). ✓
- Shell rail marque → Task 5 (rail). ✓
- Aperçu vivant par étape → Task 3 (cartographie complète des 4 étapes). ✓
- Mobile barre + accordéon → Task 5 (topbar) + variant accordion (Task 3). ✓
- Compteur dynamique + entrée conditionnelle pointillée → Task 1 (StepperItem) + Task 5 (hook + stepper). ✓
- En-tête contenu depuis STEP_META → Task 5 (page). ✓
- Restyle aptitude/diagnostic/parcours (retrait en-têtes, tokens) → Tasks 6/7/8. ✓
- Mapping emoji → KeenIcon → Task 4 (OBJECTIVES/EXPERIENCES) + Task 1 (STEP_META.icon). ✓
- Suppressions (summary-card, import-step, questionnaire-step) → Task 5 step 6. ✓
- Discipline marque (bleu structure / orange action) → tokens explicites partout. ✓
- Responsive + reduced-motion → Task 5 (page) + Task 9 (vérif). ✓

**2. Placeholders :** aucun TBD/TODO ; tout le code des nouveaux fichiers est complet ; les restyles donnent les chaînes exactes à retirer/remplacer.

**3. Cohérence des types :** `OnboardingStep`, `StepperItem`, `OnboardingLiveState` définis en Task 1 et utilisés à l'identique partout. `onLiveChange: (live: Partial<OnboardingLiveState>) => void` cohérent entre ProfilStep (Task 4), AptitudeTestStep (Task 6) et la page (Task 5/6). `stepperItems`/`currentNumber`/`totalSteps` exposés par le hook (Task 5) et consommés par rail/topbar/page.
