import { useState } from 'react';
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

interface AptitudeTestStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface TestScenario {
  id: string;
  title: string;
  context: string;
  question: string;
  options: { value: string; label: string }[];
  category: 'prioritization' | 'communication' | 'budget';
}

const SCENARIOS: TestScenario[] = [
  {
    id: 'scenario-1',
    title: 'Gestion des priorites',
    context:
      'Vous avez 3 taches urgentes et seulement 2 heures disponibles : corriger un bug critique en production, preparer la presentation pour le comite de pilotage de demain, et repondre a un appel d\'offre dont la deadline est ce soir.',
    question: 'Classez ces taches par ordre de priorite. Quelle approche adoptez-vous ?',
    options: [
      {
        value: '1',
        label:
          'Bug critique d\'abord (impact immediat), puis appel d\'offre (deadline), puis presentation (demain)',
      },
      {
        value: '2',
        label:
          'Appel d\'offre d\'abord (deadline ce soir), puis bug critique, puis presentation',
      },
      {
        value: '3',
        label:
          'Deleguer le bug a l\'equipe technique, traiter l\'appel d\'offre soi-meme, et reporter la presentation',
      },
      {
        value: '4',
        label:
          'Traiter les 3 en parallele en y consacrant 40 minutes chacune',
      },
    ],
    category: 'prioritization',
  },
  {
    id: 'scenario-2',
    title: 'Gestion de conflit',
    context:
      'Un membre de votre equipe est en conflit ouvert avec le client. Lors de la derniere reunion, il a contredit publiquement les exigences du client en affirmant qu\'elles etaient irrealistes. Le client menace d\'escalader au sponsor du projet.',
    question: 'Que faites-vous en priorite ?',
    options: [
      {
        value: '1',
        label:
          'Organiser un entretien individuel avec le membre de l\'equipe pour comprendre ses frustrations, puis une mediation avec le client',
      },
      {
        value: '2',
        label:
          'Contacter immediatement le client pour s\'excuser et retirer le collaborateur du projet',
      },
      {
        value: '3',
        label:
          'Envoyer un email au client et au collaborateur pour recadrer les regles de communication',
      },
      {
        value: '4',
        label:
          'Laisser la situation se calmer d\'elle-meme et intervenir uniquement si le client escalade vraiment',
      },
    ],
    category: 'communication',
  },
  {
    id: 'scenario-3',
    title: 'Depassement budgetaire',
    context:
      'Votre projet a depasse le budget initial de 20%. Les causes identifiees sont : des changements de perimetre non formalises (+12%), des retards fournisseur ayant entraine des penalites (+5%), et une sous-estimation initiale (+3%). Le sponsor demande un plan d\'action.',
    question: 'Quelle action prenez-vous ?',
    options: [
      {
        value: '1',
        label:
          'Mettre en place un processus de change control strict, renegocier avec le fournisseur, et presenter une re-estimation au sponsor',
      },
      {
        value: '2',
        label:
          'Reduire le perimetre du projet pour revenir dans le budget initial',
      },
      {
        value: '3',
        label:
          'Demander un budget supplementaire au sponsor en justifiant chaque depassement',
      },
      {
        value: '4',
        label:
          'Absorber le surcout en reduisant la qualite des livrables restants',
      },
    ],
    category: 'budget',
  },
];

const CATEGORY_LABELS: Record<TestScenario['category'], string> = {
  prioritization: 'Priorisation',
  communication: 'Communication',
  budget: 'Gestion budgetaire',
};

const CATEGORY_ICONS: Record<TestScenario['category'], string> = {
  prioritization: 'sort',
  communication: 'people',
  budget: 'chart-simple',
};

export function AptitudeTestStep({ onNext, onBack }: AptitudeTestStepProps) {
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

  const scenario = SCENARIOS[currentScenario];
  const progress = ((currentScenario + 1) / SCENARIOS.length) * 100;
  const allAnswered = Object.keys(answers).length === SCENARIOS.length;

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
        toast.success("Test d'aptitude soumis avec succes.");
      },
      onError: () => {
        toast.error('Erreur lors de la soumission du test.');
      },
    });
  };

  // Results screen
  if (showResults) {
    const scores = results ?? { logic: 0, prioritization: 0, organization: 0 };
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Resultats du test</h2>
          <p className="text-sm text-muted-foreground">
            Voici vos scores par categorie. Ces resultats seront utilises pour personnaliser votre
            simulation.
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="sort" style="duotone" className="text-lg text-primary" />
                  <span className="text-sm font-medium text-foreground">Priorisation</span>
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
                  <span className="text-sm font-medium text-foreground">Logique</span>
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
                  <span className="text-sm font-medium text-foreground">Organisation</span>
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
            Continuer
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
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Test d'aptitude</h2>
          <p className="text-sm text-muted-foreground">
            Ce mini-test evalue vos reflexes en gestion de projet a travers 3 mises en situation
            realistes.
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <KeenIcon icon="notepad" style="duotone" className="text-5xl text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">3 scenarios de gestion de projet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Vous serez confronte a des situations courantes : gestion des priorites, resolution de
                conflits et maitrise budgetaire. Il n'y a pas de mauvaise reponse.
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

  return (
    <div className="space-y-6">
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
          {currentScenario === 0 ? 'Retour' : 'Precedent'}
        </Button>

        {currentScenario < SCENARIOS.length - 1 ? (
          <Button
            variant="primary"
            className="min-h-[44px] px-5"
            onClick={() => setCurrentScenario((prev) => prev + 1)}
            disabled={!answers[scenario.id]}
          >
            Suivant
            <ArrowRight className="text-sm ms-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            className="min-h-[44px] px-5"
            onClick={handleSubmit}
            disabled={!allAnswered || submitTest.isPending}
          >
            {submitTest.isPending ? 'Soumission...' : 'Terminer le test'}
          </Button>
        )}
      </div>
    </div>
  );
}
