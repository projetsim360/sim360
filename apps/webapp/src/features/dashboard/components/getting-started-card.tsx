import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { GettingStarted } from '../types/dashboard.types';

interface GettingStartedCardProps {
  data: GettingStarted;
}

interface StepItem {
  key: keyof Omit<GettingStarted, 'completionPercent'>;
  label: string;
  link?: string;
}

const STEPS: StepItem[] = [
  { key: 'profileCompleted', label: 'Completez votre profil', link: '/onboarding' },
  { key: 'firstSimulationLaunched', label: 'Lancez votre premiere simulation', link: '/simulations/new' },
  { key: 'firstDeliverableSubmitted', label: 'Soumettez un livrable' },
  { key: 'firstDebriefingViewed', label: 'Consultez votre debriefing' },
  { key: 'firstPortfolioShared', label: 'Partagez votre portfolio', link: '/profile/badges' },
];

export function GettingStartedCard({ data }: GettingStartedCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const allComplete = data.completionPercent === 100;

  if (dismissed) return null;

  if (allComplete) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <KeenIcon icon="check-circle" style="duotone" className="text-xl text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Bravo ! Vous avez tout explore</p>
              <p className="text-xs text-muted-foreground">Vous maitrisez les bases de la plateforme</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            Masquer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
            <KeenIcon icon="rocket" style="duotone" className="text-xl text-primary" />
          </div>
          <div>
            <CardTitle>Premiers pas</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Completez ces etapes pour maitriser la plateforme
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {STEPS.map((step) => {
          const completed = data[step.key];
          const content = (
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                completed ? 'opacity-60' : 'hover:bg-muted/50',
                step.link && !completed ? 'cursor-pointer' : '',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center size-6 rounded-full border-2 shrink-0',
                  completed
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30',
                )}
              >
                {completed && (
                  <KeenIcon icon="check" style="solid" className="text-xs text-white" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm flex-1',
                  completed ? 'line-through text-muted-foreground' : 'text-gray-900 font-medium',
                )}
              >
                {step.label}
              </span>
              {step.link && !completed && (
                <KeenIcon icon="right" style="solid" className="text-xs text-muted-foreground" />
              )}
            </div>
          );

          if (step.link && !completed) {
            return (
              <Link key={step.key} to={step.link} className="block">
                {content}
              </Link>
            );
          }

          return <div key={step.key}>{content}</div>;
        })}

        <div className="pt-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progression</span>
            <span className="text-xs font-medium text-gray-900">{data.completionPercent}%</span>
          </div>
          <Progress value={data.completionPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
