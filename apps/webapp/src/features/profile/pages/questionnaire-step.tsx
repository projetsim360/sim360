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
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { useSubmitQuestionnaire } from '../api/profile.api';
import { DOMAINS } from '../types/profile.types';
import type { QuestionnaireData } from '../types/profile.types';

const questionnaireSchema = z.object({
  objective: z.enum(['reinforce', 'reconversion', 'discovery'], {
    required_error: 'Veuillez selectionner un objectif.',
  }),
  targetDomain: z.string().min(1, 'Veuillez selectionner un domaine.'),
  experienceLevel: z.enum(['none', 'beginner', 'confirmed'], {
    required_error: 'Veuillez indiquer votre niveau d\'experience.',
  }),
  mainMotivation: z
    .string()
    .min(10, 'Veuillez decrire votre motivation (minimum 10 caracteres).')
    .max(500, 'Maximum 500 caracteres.'),
});

interface QuestionnaireStepProps {
  onNext: (data: QuestionnaireData) => void;
  onBack: () => void;
  defaultValues?: QuestionnaireData | null;
}

export function QuestionnaireStep({ onNext, onBack, defaultValues }: QuestionnaireStepProps) {
  const submitQuestionnaire = useSubmitQuestionnaire();

  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: defaultValues ?? {
      objective: undefined as unknown as QuestionnaireData['objective'],
      targetDomain: '',
      experienceLevel: undefined as unknown as QuestionnaireData['experienceLevel'],
      mainMotivation: '',
    },
  });

  const onSubmit = (data: QuestionnaireData) => {
    submitQuestionnaire.mutate(data, {
      onSuccess: () => {
        toast.success('Questionnaire enregistre.');
        onNext(data);
      },
      onError: () => {
        toast.error('Erreur lors de l\'enregistrement du questionnaire.');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Questionnaire de profilage</h2>
        <p className="text-sm text-muted-foreground">
          Repondez a quelques questions pour personnaliser votre parcours.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Question 1: Objectif */}
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quel est votre objectif principal ?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="reinforce" id="obj-reinforce" />
                          <Label htmlFor="obj-reinforce" className="font-normal cursor-pointer">
                            Renforcer mes competences en gestion de projet
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="reconversion" id="obj-reconversion" />
                          <Label htmlFor="obj-reconversion" className="font-normal cursor-pointer">
                            Reconversion professionnelle
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="discovery" id="obj-discovery" />
                          <Label htmlFor="obj-discovery" className="font-normal cursor-pointer">
                            Decouverte de la gestion de projet
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question 2: Domaine vise */}
              <FormField
                control={form.control}
                name="targetDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quel domaine vous interesse le plus ?</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectionnez un domaine" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOMAINS.map((domain) => (
                            <SelectItem key={domain.value} value={domain.value}>
                              {domain.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question 3: Experience */}
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre experience en gestion de projet</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="none" id="exp-none" />
                          <Label htmlFor="exp-none" className="font-normal cursor-pointer">
                            Aucune experience
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="beginner" id="exp-beginner" />
                          <Label htmlFor="exp-beginner" className="font-normal cursor-pointer">
                            Debutant (moins de 2 ans)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="confirmed" id="exp-confirmed" />
                          <Label htmlFor="exp-confirmed" className="font-normal cursor-pointer">
                            Confirme (2 ans ou plus)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question 4: Motivation */}
              <FormField
                control={form.control}
                name="mainMotivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quelle est votre motivation principale ?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Decrivez ce qui vous motive a utiliser Simex pro..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
                  <ArrowLeft className="text-sm me-1" />
                  Retour
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="min-h-[44px] px-5"
                  disabled={submitQuestionnaire.isPending}
                >
                  {submitQuestionnaire.isPending ? 'Enregistrement...' : 'Continuer'}
                  <ArrowRight className="text-sm ms-1" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
