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
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const DIFFICULTIES: DeliverableTemplateDifficulty[] = ['DISCOVERY', 'STANDARD', 'ADVANCED'];

const templateSchema = z.object({
  title: z.string().min(1, 'admin.form.titleRequired'),
  type: z.string().min(1, 'admin.form.typeRequired'),
  phase: z.enum(['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'], {
    error: 'admin.form.phaseRequired',
  }),
  description: z.string().optional(),
  content: z.string().min(1, 'admin.form.contentRequired'),
  evaluationCriteria: z.string().min(1, 'admin.form.criteriaRequired'),
  pmiProcess: z.string().optional(),
  difficulty: z.enum(['DISCOVERY', 'STANDARD', 'ADVANCED'], {
    error: 'admin.form.difficultyRequired',
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
  const t = useT();
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
            {template ? t('admin.tpl.edit') : t('admin.tpl.new')}
          </DialogTitle>
          <DialogDescription>
            {template
              ? t('admin.tpl.editDesc')
              : t('admin.tpl.newDesc')}
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
              <Label htmlFor="title">{t('recruit.col.title')}</Label>
              <Input id="title" {...register('title')} placeholder={t('admin.tpl.titlePh')} />
              {errors.title && (
                <p className="text-xs text-destructive">{t(errors.title.message as AppMessageKey)}</p>
              )}
            </div>

            {/* Type + Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">{t('admin.type')}</Label>
                <Input id="type" {...register('type')} placeholder={t('admin.tpl.typePh')} />
                {errors.type && (
                  <p className="text-xs text-destructive">{t(errors.type.message as AppMessageKey)}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('admin.pmiPhase')}</Label>
                <Select
                  value={phaseValue}
                  onValueChange={(val) => setValue('phase', val as PhaseType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.pickPhase')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {t(PHASE_LABELS[phase])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.phase && (
                  <p className="text-xs text-destructive">{t(errors.phase.message as AppMessageKey)}</p>
                )}
              </div>
            </div>

            {/* Difficulte + Processus PMI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('admin.difficultyLabel')}</Label>
                <Select
                  value={difficultyValue}
                  onValueChange={(val) => setValue('difficulty', val as DeliverableTemplateDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.pickDifficulty')} />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {t(DIFFICULTY_LABELS[diff])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-xs text-destructive">{t(errors.difficulty.message as AppMessageKey)}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pmiProcess">{t('admin.pmiProcess')}</Label>
                <Input
                  id="pmiProcess"
                  {...register('pmiProcess')}
                  placeholder={t('admin.tpl.processPh')}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">{t('onboarding.custom.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('admin.tpl.descPh')}
                className="min-h-20"
              />
            </div>

            {/* Contenu template (Markdown) */}
            <div className="space-y-1.5">
              <Label htmlFor="content">{t('admin.tpl.content')}</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder={t('admin.tpl.contentPh')}
                className="min-h-32 font-mono text-xs"
              />
              {errors.content && (
                <p className="text-xs text-destructive">{t(errors.content.message as AppMessageKey)}</p>
              )}
            </div>

            {/* Criteres d'evaluation (JSON) */}
            <div className="space-y-1.5">
              <Label htmlFor="evaluationCriteria">{t('admin.tpl.criteria')}</Label>
              <Textarea
                id="evaluationCriteria"
                {...register('evaluationCriteria')}
                placeholder='{"completude": 30, "pertinence": 40, "clarte": 30}'
                className="min-h-24 font-mono text-xs"
              />
              {errors.evaluationCriteria && (
                <p className="text-xs text-destructive">{t(errors.evaluationCriteria.message as AppMessageKey)}</p>
              )}
            </div>

            {/* Exemple de reference (Markdown, optionnel) */}
            <div className="space-y-1.5">
              <Label htmlFor="referenceExample">{t('admin.tpl.example')}</Label>
              <Textarea
                id="referenceExample"
                {...register('referenceExample')}
                placeholder={t('admin.tpl.examplePh')}
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
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="deliverable-template-form"
            disabled={isPending}
          >
            {isPending ? t('common.saving') : template ? t('admin.update') : t('mentoring.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
