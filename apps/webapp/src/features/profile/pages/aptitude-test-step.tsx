import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { KeenIcon } from '@/components/keenicons';
import { ArrowLeft, ArrowRight } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSubmitAptitudeTest } from '../api/profile.api';
import type { AptitudeTestData } from '../types/profile.types';
import type { OnboardingLiveState } from '../config/onboarding.config';
import { SCENARIOS_EN, SCENARIOS_FR, type TestScenario } from '../content/aptitude-scenarios';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

interface AptitudeTestStepProps {
  onNext: () => void;
  onBack: () => void;
  onLiveChange?: (live: Partial<OnboardingLiveState>) => void;
}


const CATEGORY_LABELS: Record<TestScenario['category'], AppMessageKey> = {
  prioritization: 'onboarding.aptitude.cat.prioritization',
  communication: 'onboarding.aptitude.cat.communication',
  budget: 'onboarding.aptitude.cat.budget',
};

const CATEGORY_ICONS: Record<TestScenario['category'], string> = {
  prioritization: 'sort',
  communication: 'people',
  budget: 'chart-simple',
};

const INTRO_CATEGORIES = [
  { icon: 'sort', title: 'onboarding.aptitude.cat.prioritization', desc: 'onboarding.aptitude.cat.prioritization.desc', tone: 'bg-[var(--accent-50)] text-[var(--accent-700)]' },
  { icon: 'people', title: 'onboarding.aptitude.cat.communication', desc: 'onboarding.aptitude.cat.communication.desc', tone: 'bg-[var(--brand-50)] text-[var(--brand-600)]' },
  { icon: 'chart-simple', title: 'onboarding.aptitude.cat.budget', desc: 'onboarding.aptitude.cat.budget.desc', tone: 'bg-[var(--success-50)] text-[var(--success-700)]' },
] as const satisfies readonly { icon: string; title: AppMessageKey; desc: AppMessageKey; tone: string }[];

export function AptitudeTestStep({ onNext, onBack, onLiveChange }: AptitudeTestStepProps) {
  const { locale } = useAppLocale();
  const SCENARIOS = locale === 'en' ? SCENARIOS_EN : SCENARIOS_FR;
  const t = useT();
  const [isStarted, setIsStarted] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    logic: number;
    prioritization: number;
    organization: number;
  } | null>(null);
  const submitTest = useSubmitAptitudeTest();
  const reduce = useReducedMotion();

  const scenario = SCENARIOS[currentScenario];
  const progress = ((currentScenario + 1) / SCENARIOS.length) * 100;
  const allAnswered = Object.keys(answers).length === SCENARIOS.length;

  useEffect(() => {
    if (!isStarted || showResults) return;
    onLiveChange?.({
      aptitudeProgress: {
        current: currentScenario + 1,
        total: SCENARIOS.length,
        answeredCategories: SCENARIOS.filter((s) => answers[s.id]).map((s) => s.category),
      },
    });
  }, [isStarted, showResults, currentScenario, answers, onLiveChange, SCENARIOS]);

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [scenario.id]: value }));
  };

  const handleSubmit = () => {
    const data: AptitudeTestData = {
      answers: SCENARIOS.map((s) => ({
        questionId: s.id,
        answer: answers[s.id] ?? '',
      })),
    };

    submitTest.mutate(data, {
      onSuccess: (response) => {
        const profile = response as Record<string, unknown> | undefined;
        const aptitudeData = profile?.aptitudeTestData as
          | { scores?: { logic: number; prioritization: number; organization: number } }
          | undefined;
        if (aptitudeData?.scores) {
          setResults(aptitudeData.scores);
        }
        setShowResults(true);
        toast.success(t('onboarding.aptitude.submitted'));
      },
      onError: () => {
        toast.error(t('onboarding.aptitude.submitError'));
      },
    });
  };

  // Results screen
  if (showResults) {
    const scores = results ?? { logic: 0, prioritization: 0, organization: 0 };
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="sort" style="duotone" className="text-lg text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('onboarding.aptitude.cat.prioritization')}</span>
                </div>
                <Badge variant={scores.prioritization >= 70 ? 'success' : scores.prioritization >= 40 ? 'warning' : 'destructive'} size="sm">
                  {scores.prioritization}%
                </Badge>
              </div>
              <Progress value={scores.prioritization} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="abstract-26" style="duotone" className="text-lg text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('onboarding.aptitude.score.logic')}</span>
                </div>
                <Badge variant={scores.logic >= 70 ? 'success' : scores.logic >= 40 ? 'warning' : 'destructive'} size="sm">
                  {scores.logic}%
                </Badge>
              </div>
              <Progress value={scores.logic} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="chart-simple" style="duotone" className="text-lg text-primary" />
                  <span className="text-sm font-medium text-foreground">{t('onboarding.aptitude.score.organization')}</span>
                </div>
                <Badge variant={scores.organization >= 70 ? 'success' : scores.organization >= 40 ? 'warning' : 'destructive'} size="sm">
                  {scores.organization}%
                </Badge>
              </div>
              <Progress value={scores.organization} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex items-center justify-end">
          <Button variant="primary" size="sm" onClick={onNext}>
            {t('common.continue')}
            <ArrowRight className="text-sm ms-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Intro screen
  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-display text-[13px] font-bold text-[var(--brand-700)]">
            {t('onboarding.aptitude.introTitle')}
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
                <div className="text-[13.5px] font-semibold text-foreground">{t(c.title)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t(c.desc)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-[12.5px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="notepad" style="duotone" className="text-base text-[var(--brand-500)]" /> {t('onboarding.aptitude.fact.scenarios')}
          </span>
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="time" style="duotone" className="text-base text-[var(--brand-500)]" /> {t('onboarding.aptitude.fact.duration')}
          </span>
          <span className="inline-flex items-center gap-2">
            <KeenIcon icon="check-circle" style="duotone" className="text-base text-[var(--brand-500)]" /> {t('onboarding.aptitude.fact.noWrong')}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-5">
          <Button variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
            <ArrowLeft className="text-sm me-1" />
            {t('common.back')}
          </Button>
          <Button variant="primary" className="min-h-[44px] px-5" onClick={() => setIsStarted(true)}>
            {t('common.start')}
            <ArrowRight className="text-sm ms-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {t('onboarding.aptitude.scenarioOf', { n: currentScenario + 1, total: SCENARIOS.length })}
        </p>
        <Badge variant="info" appearance="light" size="lg">
          <KeenIcon icon={CATEGORY_ICONS[scenario.category]} style="duotone" className="text-sm me-1" />
          {t(CATEGORY_LABELS[scenario.category])}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{scenario.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{scenario.context}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground mb-4">{scenario.question}</p>
          <RadioGroup
            value={answers[scenario.id] ?? ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {scenario.options.map((option) => {
              const isOptionSelected = answers[scenario.id] === option.value;
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-lg border-2 transition-all cursor-pointer',
                    isOptionSelected
                      ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                      : 'border-border hover:border-primary/30 hover:bg-muted/30',
                  )}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${scenario.id}-${option.value}`}
                    className="mt-0.5 shrink-0"
                  />
                  <Label
                    htmlFor={`${scenario.id}-${option.value}`}
                    className="font-normal cursor-pointer leading-normal flex-1"
                  >
                    {option.label}
                  </Label>
                  {isOptionSelected && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="min-h-[44px] px-4"
          onClick={() => {
            if (currentScenario === 0) {
              onBack();
            } else {
              setCurrentScenario((prev) => prev - 1);
            }
          }}
        >
          <ArrowLeft className="text-sm me-1" />
          {currentScenario === 0 ? t('common.back') : t('common.previous')}
        </Button>

        {currentScenario < SCENARIOS.length - 1 ? (
          <Button
            variant="primary"
            className="min-h-[44px] px-5"
            onClick={() => setCurrentScenario((prev) => prev + 1)}
            disabled={!answers[scenario.id]}
          >
            {t('common.next')}
            <ArrowRight className="text-sm ms-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            className="min-h-[44px] px-5"
            onClick={handleSubmit}
            disabled={!allAnswered || submitTest.isPending}
          >
            {submitTest.isPending ? t('onboarding.aptitude.submitting') : t('onboarding.aptitude.finish')}
          </Button>
        )}
      </div>
    </div>
  );
}
