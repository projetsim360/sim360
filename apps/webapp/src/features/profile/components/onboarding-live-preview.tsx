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
import { PROFILE_TYPE_LABELS, DOMAINS, SECTORS, formatDifficulty } from '../types/profile.types';
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
          { state: diff ? 'done' : 'todo', label: diff ? `Difficulté : ${formatDifficulty(diff)}` : 'Difficulté' },
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
