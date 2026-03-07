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

const PHASES: PhaseType[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'];
const CATEGORIES: ReferenceDocumentCategory[] = ['TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY'];

const documentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  category: z.enum(['TEMPLATE', 'STANDARD', 'BEST_PRACTICE', 'GLOSSARY'], {
    required_error: 'La categorie est requise',
  }),
  phase: z.string().optional(),
  pmiProcess: z.string().optional(),
  content: z.string().min(1, 'Le contenu est requis'),
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
            {document ? 'Modifier le document' : 'Nouveau document de reference'}
          </DialogTitle>
          <DialogDescription>
            {document
              ? 'Modifiez les informations du document de reference.'
              : 'Remplissez les informations pour creer un nouveau document.'}
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
              <Label htmlFor="doc-title">Titre</Label>
              <Input id="doc-title" {...register('title')} placeholder="Titre du document" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Categorie + Phase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categorie</Label>
                <Select
                  value={categoryValue}
                  onValueChange={(val) => setValue('category', val as ReferenceDocumentCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner une categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Phase PMI (optionnel)</Label>
                <Select
                  value={phaseValue || ''}
                  onValueChange={(val) => setValue('phase', val === '_none' ? '' : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner une phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucune</SelectItem>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {PHASE_LABELS[phase]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Processus PMI */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-pmiProcess">Processus PMI (optionnel)</Label>
              <Input
                id="doc-pmiProcess"
                {...register('pmiProcess')}
                placeholder="Ex: 4.1 Elaborer la charte du projet"
              />
            </div>

            {/* Champs specifiques Glossaire */}
            {isGlossary && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="doc-term">Terme</Label>
                  <Input
                    id="doc-term"
                    {...register('term')}
                    placeholder="Terme a definir"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-example">Exemple concret</Label>
                  <Textarea
                    id="doc-example"
                    {...register('example')}
                    placeholder="Un exemple concret illustrant le terme..."
                    className="min-h-20"
                  />
                </div>
              </>
            )}

            {/* Contenu (Markdown) */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-content">Contenu (Markdown)</Label>
              <Textarea
                id="doc-content"
                {...register('content')}
                placeholder="Redigez le contenu du document en Markdown..."
                className="min-h-32 font-mono text-xs"
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content.message}</p>
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
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="reference-document-form"
            disabled={isPending}
          >
            {isPending ? 'Enregistrement...' : document ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
