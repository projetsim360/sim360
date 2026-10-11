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
import { useT, useTv } from '@/i18n/app/use-t';
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

type T = ReturnType<typeof useT>;
type TV = ReturnType<typeof useTv>;

function buildModel(
  profile: UserProfile | undefined,
  step: OnboardingStep,
  live: OnboardingLiveState,
  t: T,
  tv: TV,
): PreviewModel {
  switch (step) {
    case 'profil': {
      const q = live.questionnaire ?? {};
      const hasImport = !!profile?.cvData || !!profile?.linkedinData || !!profile?.cvFileUrl;
      const skillCount = (profile?.cvData as Record<string, unknown> | undefined)?.skillCount as
        | number
        | undefined;
      return {
        title: t('onboarding.preview.profileTitle'),
        lines: [
          {
            state: hasImport ? 'done' : 'todo',
            label: hasImport
              ? skillCount
                ? t('onboarding.preview.cvSkills', { count: skillCount })
                : t('onboarding.preview.imported')
              : t('onboarding.preview.cvLinkedin'),
          },
          {
            state: q.objective ? 'done' : 'todo',
            label: q.objective
              ? t('onboarding.preview.objectiveValue', { value: tv('onboarding.preview.objective', q.objective) })
              : t('onboarding.preview.objectiveLabel'),
          },
          {
            state: q.targetDomain ? 'done' : 'todo',
            label: q.targetDomain
              ? t('onboarding.preview.domainValue', { value: tv('domain', q.targetDomain) })
              : t('onboarding.preview.domainLabel'),
          },
          {
            state: q.experienceLevel ? 'done' : 'todo',
            label: q.experienceLevel
              ? t('onboarding.preview.experienceValue', { value: tv('onboarding.preview.experience', q.experienceLevel) })
              : t('onboarding.preview.experienceLabel'),
          },
        ],
      };
    }
    case 'aptitude-test': {
      const p = live.aptitudeProgress;
      const cats = p?.answeredCategories ?? [];
      return {
        title: p ? t('onboarding.preview.scenario', { n: p.current, total: p.total }) : t('onboarding.step.aptitude.title'),
        lines: [],
        badges: [
          { label: t('onboarding.aptitude.cat.prioritization'), on: cats.includes('prioritization') },
          { label: t('onboarding.aptitude.cat.communication'), on: cats.includes('communication') },
          { label: t('onboarding.preview.budget'), on: cats.includes('budget') },
        ],
      };
    }
    case 'diagnostic': {
      const d = profile?.diagnosticData;
      const skillCount = profile?.skills?.length ?? 0;
      if (!d) {
        return { title: t('onboarding.preview.analysis'), lines: [{ state: 'active', label: t('onboarding.preview.analyzing') }] };
      }
      return {
        title: t('onboarding.preview.analysis'),
        lines: [
          { state: 'done', label: t('onboarding.path.profile', { value: tv('profileType', d.profileType) }) },
          { state: 'done', label: t('onboarding.preview.skillsToBuild', { count: skillCount }) },
          { state: 'done', label: t('onboarding.preview.suggestedSector', { value: tv('domain', d.suggestedSector) }) },
        ],
      };
    }
    case 'choose-path': {
      const sectorValue = profile?.selectedSector ?? profile?.suggestedSector;
      const diff = profile?.diagnosticData?.suggestedDifficulty ?? profile?.suggestedDifficulty;
      return {
        title: t('onboarding.preview.ready'),
        lines: [
          {
            state: sectorValue ? 'done' : 'todo',
            label: sectorValue ? t('onboarding.preview.sectorValue', { value: tv('domain', sectorValue) }) : t('onboarding.preview.sectorTodo'),
          },
          {
            state: diff ? 'done' : 'todo',
            label: diff ? t('onboarding.path.difficulty', { value: tv('difficulty', diff.toUpperCase()) }) : t('onboarding.preview.difficultyLabel'),
          },
          { state: 'active', label: t('onboarding.preview.launch') },
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
  const t = useT();
  const tv = useTv();
  const model = buildModel(profile, currentStep, live, t, tv);
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
            {t('onboarding.preview.yourProfile')}
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
