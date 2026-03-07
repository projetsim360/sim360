import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import type { DeliverableTemplate, PhaseType, DeliverableTemplateDifficulty } from '../types/admin-reference.types';
import { PHASE_LABELS, DIFFICULTY_LABELS } from '../types/admin-reference.types';

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const DIFFICULTIES: DeliverableTemplateDifficulty[] = ['DISCOVERY', 'STANDARD', 'ADVANCED'];

const templateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  type: z.string().min(1, 'Le type est requis'),
  phase: z.enum(['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'], {
    required_error: 'La phase est requise',
  }),
  description: z.string().optional(),
  content: z.string().min(1, 'Le contenu est requis'),
  evaluationCriteria: z.string().min(1, 'Les criteres d\'evaluation sont requis'),
  pmiProcess: z.string().optional(),
  difficulty: z.enum(['DISCOVERY', 'STANDARD', 'ADVANCED'], {
    required_error: 'La difficulte est requise',
  }),
  referenceExample: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface DeliverableTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: DeliverableTemplate | null;
  onSubmit: (data: {
    title: string;
    type: string;
    phase: PhaseType;
    description?: string;
    content: string;
    evaluationCriteria: Record<string, unknown>;
    pmiProcess?: string;
    difficulty: DeliverableTemplateDifficulty;
    referenceExample?: string;
  }) => void;
  isPending?: boolean;
}

export function DeliverableTemplateForm({
  open,
  onOpenChange,
  template,
  onSubmit,
  isPending,
}: DeliverableTemplateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      type: '',
      phase: 'INITIATION',
      description: '',
      content: '',
      evaluationCriteria: '{}',
      pmiProcess: '',
      difficulty: 'STANDARD',
      referenceExample: '',
    },
  });

  const phaseValue = watch('phase');
  const difficultyValue = watch('difficulty');

  useEffect(() => {
    if (template) {
      reset({
        title: template.title,
        type: template.type,
        phase: template.phase,
        description: template.description || '',
        content: template.content,
        evaluationCriteria: JSON.stringify(template.evaluationCriteria, null, 2),
        pmiProcess: template.pmiProcess || '',
        difficulty: template.difficulty,
        referenceExample: template.referenceExample || '',
      });
    } else {
      reset({
        title: '',
        type: '',
        phase: 'INITIATION',
        description: '',
        content: '',
        evaluationCriteria: '{}',
        pmiProcess: '',
        difficulty: 'STANDARD',
        referenceExample: '',
      });
    }
  }, [template, reset]);

  const handleFormSubmit = (values: TemplateFormValues) => {
    let evaluationCriteria: Record<string, unknown>;
    try {
      evaluationCriteria = JSON.parse(values.evaluationCriteria);
    } catch {
      evaluationCriteria = {};
    }

    onSubmit({
      title: values.title,
      type: values.type,
      phase: values.phase,
      description: values.description || undefined,
      content: values.content,
      evaluationCriteria,
      pmiProcess: values.pmiProcess || undefined,
      difficulty: values.difficulty,
      referenceExample: values.referenceExample || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Modifier le template' : 'Nouveau template de livrable'}
          </DialogTitle>
          <DialogDescription>
            {template
              ? 'Modifiez les informations du template de livrable.'
              : 'Remplissez les informations pour creer un nouveau template.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form
            id="deliverable-template-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Titre */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...register('title')} placeholder="Titre du template" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Type + Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Type</Label>
                <Input id="type" {...register('type')} placeholder="Ex: Charte projet" />
                {errors.type && (
                  <p className="text-xs text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Phase PMI</Label>
                <Select
                  value={phaseValue}
                  onValueChange={(val) => setValue('phase', val as PhaseType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner une phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {PHASE_LABELS[phase]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.phase && (
                  <p className="text-xs text-destructive">{errors.phase.message}</p>
                )}
              </div>
            </div>

            {/* Difficulte + Processus PMI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Difficulte</Label>
                <Select
                  value={difficultyValue}
                  onValueChange={(val) => setValue('difficulty', val as DeliverableTemplateDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner une difficulte" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {DIFFICULTY_LABELS[diff]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-xs text-destructive">{errors.difficulty.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pmiProcess">Processus PMI</Label>
                <Input
                  id="pmiProcess"
                  {...register('pmiProcess')}
                  placeholder="Ex: 4.1 Elaborer la charte"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description du template (optionnel)"
                className="min-h-20"
              />
            </div>

            {/* Contenu template (Markdown) */}
            <div className="space-y-1.5">
              <Label htmlFor="content">Contenu du template (Markdown)</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder="Redigez le contenu du template en Markdown..."
                className="min-h-32 font-mono text-xs"
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content.message}</p>
              )}
            </div>

            {/* Criteres d'evaluation (JSON) */}
            <div className="space-y-1.5">
              <Label htmlFor="evaluationCriteria">Criteres d'evaluation (JSON)</Label>
              <Textarea
                id="evaluationCriteria"
                {...register('evaluationCriteria')}
                placeholder='{"completude": 30, "pertinence": 40, "clarte": 30}'
                className="min-h-24 font-mono text-xs"
              />
              {errors.evaluationCriteria && (
                <p className="text-xs text-destructive">{errors.evaluationCriteria.message}</p>
              )}
            </div>

            {/* Exemple de reference (Markdown, optionnel) */}
            <div className="space-y-1.5">
              <Label htmlFor="referenceExample">Exemple de reference (Markdown, optionnel)</Label>
              <Textarea
                id="referenceExample"
                {...register('referenceExample')}
                placeholder="Un exemple de livrable bien redige..."
                className="min-h-24 font-mono text-xs"
              />
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="deliverable-template-form"
            disabled={isPending}
          >
            {isPending ? 'Enregistrement...' : template ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
