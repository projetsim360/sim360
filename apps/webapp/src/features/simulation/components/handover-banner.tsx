import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { simulationApi } from '../api/simulation.api';
import type { HandoverStatus } from '../types/simulation.types';

interface HandoverBannerProps {
  simulationId: string;
  onHandoverComplete?: () => void;
}

const STEPS = [
  { key: 'HR', label: 'Accueil RH', icon: 'people', description: 'Culture et integration' },
  { key: 'PMO', label: 'Passation PMO', icon: 'notepad', description: 'Projet et methodologie' },
  { key: 'DONE', label: 'Demarrage', icon: 'rocket', description: 'Lancer le projet' },
] as const;

export function HandoverBanner({ simulationId, onHandoverComplete }: HandoverBannerProps) {
  const [status, setStatus] = useState<HandoverStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    simulationApi.getHandoverStatus(simulationId)
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [simulationId]);

  if (loading || !status || !status.hasHandover) return null;

  const currentStepIndex = status.isComplete
    ? STEPS.length - 1
    : STEPS.findIndex((s) => s.key === status.currentStep);

  async function handleCompleteHandover() {
    setCompleting(true);
    try {
      await simulationApi.completeHandover(simulationId);
      onHandoverComplete?.();
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Card className="mb-5 overflow-hidden">
      {/* Gradient top bar */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-blue-500 to-success" />

      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-base font-semibold text-foreground">
            {status.isComplete ? 'Passation terminee !' : 'Prise de poste en cours'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {status.isComplete
              ? 'Vous avez termine votre integration. Vous pouvez maintenant commencer le projet.'
              : 'Completez les reunions d\'integration avant de demarrer le projet.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-start justify-center gap-0 mb-6">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isDone = index < currentStepIndex;
            const isFuture = index > currentStepIndex;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={step.key} className="flex items-start">
                {/* Step */}
                <div className="flex flex-col items-center w-32">
                  {/* Circle */}
                  <div
                    className={cn(
                      'relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
                    )}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <KeenIcon icon={step.icon} style="duotone" className="text-base leading-none" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className={cn(
                      'text-xs font-semibold',
                      isDone ? 'text-green-600 dark:text-green-400' :
                      isActive ? 'text-brand-500' :
                      'text-gray-400 dark:text-gray-500',
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[10px] mt-0.5 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex items-center h-11">
                    <div className={cn(
                      'w-16 h-[2px] rounded-full transition-all duration-500',
                      isDone ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700',
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          {status.currentStep === 'HR' && status.hrMeeting && (
            <Button variant="primary" asChild>
              <Link to={`/meetings/${status.hrMeeting.id}`} className="inline-flex items-center gap-2">
                <KeenIcon icon="people" style="duotone" className="text-sm leading-none" />
                Commencer l'accueil RH
              </Link>
            </Button>
          )}

          {status.currentStep === 'PMO' && status.pmoMeeting && (
            <Button variant="primary" asChild>
              <Link to={`/meetings/${status.pmoMeeting.id}`} className="inline-flex items-center gap-2">
                <KeenIcon icon="notepad" style="duotone" className="text-sm leading-none" />
                Commencer la passation PMO
              </Link>
            </Button>
          )}

          {(status.currentStep === 'DONE' || status.isComplete) && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCompleteHandover}
              disabled={completing}
              className="px-8 gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {completing ? 'Demarrage en cours...' : 'Commencer le projet'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
