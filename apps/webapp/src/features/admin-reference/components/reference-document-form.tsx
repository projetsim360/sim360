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
import type {
  ReferenceDocument,
  PhaseType,
  ReferenceDocumentCategory,
} from '../types/admin-reference.types';
import { PHASE_LABELS, CATEGORY_LABELS } from '../types/admin-reference.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const CATEGORIES: ReferenceDocumentCategory[] = ['TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY'];

const documentSchema = z.object({
  title: z.string().min(1, 'admin.form.titleRequired'),
  category: z.enum(['TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY'], {
    error: 'admin.form.categoryRequired',
  }),
  phase: z.string().optional(),
  pmiProcess: z.string().optional(),
  content: z.string().min(1, 'admin.form.contentRequired'),
  term: z.string().optional(),
  example: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface ReferenceDocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: ReferenceDocument | null;
  onSubmit: (data: {
    title: string;
    category: ReferenceDocumentCategory;
    phase?: PhaseType;
    pmiProcess?: string;
    content: string;
    term?: string;
    example?: string;
  }) => void;
  isPending?: boolean;
}

export function ReferenceDocumentForm({
  open,
  onOpenChange,
  document,
  onSubmit,
  isPending,
}: ReferenceDocumentFormProps) {
  const t = useT();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      category: 'STANDARD',
      phase: '',
      pmiProcess: '',
      content: '',
      term: '',
      example: '',
    },
  });

  const categoryValue = watch('category');
  const phaseValue = watch('phase');
  const isGlossary = categoryValue === 'GLOSSARY';

  useEffect(() => {
    if (document) {
      reset({
        title: document.title,
        category: document.category,
        phase: document.phase || '',
        pmiProcess: document.pmiProcess || '',
        content: document.content,
        term: document.term || '',
        example: document.example || '',
      });
    } else {
      reset({
        title: '',
        category: 'STANDARD',
        phase: '',
        pmiProcess: '',
        content: '',
        term: '',
        example: '',
      });
    }
  }, [document, reset]);

  const handleFormSubmit = (values: DocumentFormValues) => {
    onSubmit({
      title: values.title,
      category: values.category as ReferenceDocumentCategory,
      phase: (values.phase as PhaseType) || undefined,
      pmiProcess: values.pmiProcess || undefined,
      content: values.content,
      term: values.term || undefined,
      example: values.example || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {document ? t('admin.doc.edit') : t('admin.doc.new')}
          </DialogTitle>
          <DialogDescription>
            {document
              ? t('admin.doc.editDesc')
              : t('admin.doc.newDesc')}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <form
            id="reference-document-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Titre */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-title">{t('recruit.col.title')}</Label>
              <Input id="doc-title" {...register('title')} placeholder={t('admin.doc.titlePh')} />
              {errors.title && (
                <p className="text-xs text-destructive">{t(errors.title.message as AppMessageKey)}</p>
              )}
            </div>

            {/* Categorie + Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t('admin.categoryLabel')}</Label>
                <Select
                  value={categoryValue}
                  onValueChange={(val) => setValue('category', val as ReferenceDocumentCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.pickCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(CATEGORY_LABELS[cat])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{t(errors.category.message as AppMessageKey)}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('admin.pmiPhaseOpt')}</Label>
                <Select
                  value={phaseValue || ''}
                  onValueChange={(val) => setValue('phase', val === '_none' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.pickPhase')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">{t('admin.none')}</SelectItem>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {t(PHASE_LABELS[phase])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Processus PMI */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-pmiProcess">{t('admin.pmiProcessOpt')}</Label>
              <Input
                id="doc-pmiProcess"
                {...register('pmiProcess')}
                placeholder={t('admin.doc.processPh')}
              />
            </div>

            {/* Champs specifiques Glossaire */}
            {isGlossary && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="doc-term">{t('admin.doc.term')}</Label>
                  <Input
                    id="doc-term"
                    {...register('term')}
                    placeholder={t('admin.doc.termPh')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-example">{t('admin.doc.example')}</Label>
                  <Textarea
                    id="doc-example"
                    {...register('example')}
                    placeholder={t('admin.doc.examplePh')}
                    className="min-h-20"
                  />
                </div>
              </>
            )}

            {/* Contenu (Markdown) */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-content">{t('admin.doc.content')}</Label>
              <Textarea
                id="doc-content"
                {...register('content')}
                placeholder={t('admin.doc.contentPh')}
                className="min-h-32 font-mono text-xs"
              />
              {errors.content && (
                <p className="text-xs text-destructive">{t(errors.content.message as AppMessageKey)}</p>
              )}
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
            form="reference-document-form"
            disabled={isPending}
          >
            {isPending ? t('common.saving') : document ? t('admin.update') : t('mentoring.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
