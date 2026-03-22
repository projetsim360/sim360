import { KeenIcon } from '@/components/keenicons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserProfile } from '../types/profile.types';
import { PROFILE_TYPE_LABELS } from '../types/profile.types';

interface ProfileSummaryCardProps {
  profile: UserProfile;
  className?: string;
  /** Compact mode for mobile collapsible */
  compact?: boolean;
}

export function ProfileSummaryCard({ profile, className, compact }: ProfileSummaryCardProps) {
  const hasCV = !!profile.cvFileUrl || !!profile.cvData;
  const hasLinkedin = !!profile.linkedinData;
  const skillCount = profile.skills?.length ?? 0;

  const items: Array<{ icon: string; label: string; value: React.ReactNode; done: boolean }> = [
    {
      icon: 'file-up',
      label: 'CV',
      value: hasCV ? 'Importe' : 'Non fourni',
      done: hasCV,
    },
    {
      icon: 'linkedin',
      label: 'LinkedIn',
      value: hasLinkedin ? 'Connecte' : 'Non fourni',
      done: hasLinkedin,
    },
  ];

  if (profile.questionnaireData) {
    const objectiveLabel =
      profile.questionnaireData.objective === 'reinforce'
        ? 'Renforcement'
        : profile.questionnaireData.objective === 'reconversion'
          ? 'Reconversion'
          : 'Decouverte';
    items.push({
      icon: 'questionnaire-tablet',
      label: 'Objectif',
      value: objectiveLabel,
      done: true,
    });
  }

  if (profile.profileType) {
    items.push({
      icon: 'user-tick',
      label: 'Profil',
      value: (
        <Badge variant="primary" appearance="light" size="sm">
          {PROFILE_TYPE_LABELS[profile.profileType]}
        </Badge>
      ),
      done: true,
    });
  }

  if (skillCount > 0) {
    items.push({
      icon: 'star',
      label: 'Competences',
      value: `${skillCount} detectee${skillCount > 1 ? 's' : ''}`,
      done: true,
    });
  }

  if (profile.selectedSector) {
    items.push({
      icon: 'category',
      label: 'Secteur',
      value: profile.selectedSector,
      done: true,
    });
  }

  // Compact inline mode (for mobile)
  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-3', className)}>
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-1.5 text-sm',
              item.done ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-5 h-5 rounded-full shrink-0',
                item.done ? 'bg-success/15' : 'bg-muted',
              )}
            >
              {item.done ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
                </svg>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              )}
            </div>
            <span className="font-medium">{item.label}</span>
            {typeof item.value === 'string' ? (
              <span className="text-muted-foreground">{item.value}</span>
            ) : (
              item.value
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full card mode (for sidebar)
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <KeenIcon icon="profile-circle" style="duotone" className="text-base text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Resume du profil</h3>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-lg shrink-0',
                  item.done ? 'bg-success/10' : 'bg-muted',
                )}
              >
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
                  </svg>
                ) : (
                  <KeenIcon
                    icon={item.icon}
                    style="duotone"
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <div className="text-xs font-medium text-foreground text-right truncate ml-2">
                  {typeof item.value === 'string' ? item.value : item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion indicator */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progression</span>
            <span className="text-xs font-semibold text-foreground">
              {items.filter((i) => i.done).length}/{items.length}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${items.length > 0 ? (items.filter((i) => i.done).length / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
