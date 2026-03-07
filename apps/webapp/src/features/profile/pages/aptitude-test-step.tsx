import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Clock } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSubmitAptitudeTest } from '../api/profile.api';
import type { AptitudeTestData } from '../types/profile.types';

interface AptitudeTestStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface TestQuestion {
  id: string;
  question: string;
  context: string;
  options: { value: string; label: string }[];
  category: 'logic' | 'prioritization' | 'organization';
}

const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 'q1',
    context: 'Vous organisez un anniversaire surprise. Le traiteur annule a la derniere minute.',
    question: 'Quelle est votre premiere reaction ?',
    options: [
      { value: 'a', label: 'Chercher immediatement un remplacant en appelant plusieurs traiteurs' },
      { value: 'b', label: 'Informer les invites du changement et demander des suggestions' },
      { value: 'c', label: 'Revoir le budget pour une solution alternative (fait maison)' },
      { value: 'd', label: 'Reporter l\'evenement pour mieux se preparer' },
    ],
    category: 'logic',
  },
  {
    id: 'q2',
    context: 'Trois taches urgentes arrivent en meme temps : la decoration, la liste des invites et la musique.',
    question: 'Comment priorisez-vous ?',
    options: [
      { value: 'a', label: 'La liste des invites — c\'est la base de la planification' },
      { value: 'b', label: 'La decoration — elle prend le plus de temps' },
      { value: 'c', label: 'La musique — c\'est le plus facile a regler rapidement' },
      { value: 'd', label: 'Je delegue chaque tache a une personne differente' },
    ],
    category: 'prioritization',
  },
  {
    id: 'q3',
    context: 'Le budget initial etait de 500 euros. Apres les premiers achats, il ne reste que 150 euros mais il manque encore le gateau et les boissons.',
    question: 'Comment gerez-vous cette situation ?',
    options: [
      { value: 'a', label: 'Demander une contribution aux invites' },
      { value: 'b', label: 'Reduire les couts en preparant le gateau soi-meme' },
      { value: 'c', label: 'Revoir l\'ensemble du budget et couper d\'autres postes' },
      { value: 'd', label: 'Augmenter le budget en justifiant les depenses supplementaires' },
    ],
    category: 'organization',
  },
  {
    id: 'q4',
    context: 'Le jour J, deux invites cles informent qu\'ils auront 2 heures de retard.',
    question: 'Comment adaptez-vous le planning ?',
    options: [
      { value: 'a', label: 'Decaler l\'heure de debut pour tout le monde' },
      { value: 'b', label: 'Maintenir le planning et prevoir une activite d\'integration pour leur arrivee' },
      { value: 'c', label: 'Reorganiser l\'ordre des activites pour placer les moments cles apres leur arrivee' },
      { value: 'd', label: 'Ne rien changer — ceux qui sont la profitent de la fete' },
    ],
    category: 'logic',
  },
];

const TIMER_DURATION = 5 * 60; // 5 minutes

export function AptitudeTestStep({ onNext, onBack }: AptitudeTestStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isStarted, setIsStarted] = useState(false);
  const submitTest = useSubmitAptitudeTest();

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const handleTimeExpired = useCallback(() => {
    toast.warning('Temps ecoule. Vos reponses ont ete soumises.');
    handleSubmit();
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && isStarted) {
      handleTimeExpired();
    }
  }, [timeLeft, isStarted, handleTimeExpired]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string) => {
    const question = TEST_QUESTIONS[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleSubmit = () => {
    const data: AptitudeTestData = { answers };
    submitTest.mutate(data, {
      onSuccess: () => {
        toast.success('Test d\'aptitude soumis avec succes.');
        onNext();
      },
      onError: () => {
        toast.error('Erreur lors de la soumission du test.');
      },
    });
  };

  const question = TEST_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / TEST_QUESTIONS.length) * 100;
  const allAnswered = Object.keys(answers).length === TEST_QUESTIONS.length;

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Test d'aptitude</h2>
          <p className="text-sm text-muted-foreground">
            Ce mini-test evalue vos capacites de base en gestion de projet a travers un scenario ludique.
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Scenario : Organiser un anniversaire surprise
              </h3>
              <p className="text-sm text-muted-foreground">
                Vous devez organiser un anniversaire surprise avec 3 contraintes imprevues.
                Repondez aux 4 questions de mise en situation.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="text-base" />
                <span>5 minutes maximum</span>
              </div>
              <span>4 questions</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="text-sm me-1" />
                Retour
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsStarted(true)}>
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
            Question {currentQuestion + 1} sur {TEST_QUESTIONS.length}
          </p>
        </div>
        <Badge
          variant={timeLeft < 60 ? 'destructive' : 'secondary'}
          size="lg"
          className="font-mono"
        >
          <Clock className="text-sm me-1" />
          {formatTime(timeLeft)}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Badge variant="info" appearance="light" size="sm">
              {question.category === 'logic' && 'Logique'}
              {question.category === 'prioritization' && 'Priorisation'}
              {question.category === 'organization' && 'Organisation'}
            </Badge>
            <p className="text-sm text-muted-foreground italic">{question.context}</p>
          </div>
          <CardTitle className="text-base mt-2">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[question.id] ?? ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                  answers[question.id] === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30',
                )}
              >
                <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} className="mt-0.5" />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="font-normal cursor-pointer leading-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="text-sm me-1" />
          Precedente
        </Button>

        {currentQuestion < TEST_QUESTIONS.length - 1 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={!answers[question.id]}
          >
            Suivante
            <ArrowRight className="text-sm ms-1" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
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
