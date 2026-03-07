import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { KeenIcon } from '@/components/keenicons';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateCampaign } from '../api/recruitment.api';
import { SkillsInput } from '../components/skills-input';
import { CultureSelector } from '../components/culture-selector';
import type { SkillWeight, CultureType } from '../types/recruitment.types';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const campaignSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caracteres'),
  jobTitle: z.string().min(2, 'Le poste est requis'),
  jobDescription: z.string().min(10, 'La description doit contenir au moins 10 caracteres'),
  experienceLevel: z.string().min(1, "Le niveau d'experience est requis"),
  projectTypes: z.array(z.string()).min(1, 'Selectionnez au moins un type de projet'),
  culture: z.enum(['STRICT', 'AGILE', 'COLLABORATIVE']),
  cultureDescription: z.string().optional(),
  maxCandidates: z.number().min(1).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = [
  { label: 'Informations', icon: 'document' },
  { label: 'Competences', icon: 'award' },
  { label: 'Culture', icon: 'people' },
  { label: 'Parametres', icon: 'setting-2' },
  { label: 'Resume', icon: 'check' },
];

const EXPERIENCE_LEVELS = [
  { value: 'JUNIOR', label: 'Junior (0-2 ans)' },
  { value: 'INTERMEDIATE', label: 'Intermediaire (2-5 ans)' },
  { value: 'SENIOR', label: 'Senior (5-10 ans)' },
  { value: 'EXPERT', label: 'Expert (10+ ans)' },
];

const PROJECT_TYPES = [
  'IT / Digital',
  'Construction / BTP',
  'Industrie',
  'Consulting',
  'Marketing',
  'R&D',
  'Transformation',
  'Infrastructure',
];

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState<SkillWeight[]>([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (documents.length + validFiles.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} fichiers autorises`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Format non supporte : ${file.name}. Utilisez PDF ou DOCX.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Fichier trop volumineux : ${file.name}. Maximum 10 Mo.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setDocuments((prev) => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const createMutation = useCreateCampaign();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      jobTitle: '',
      jobDescription: '',
      experienceLevel: '',
      projectTypes: [],
      culture: 'COLLABORATIVE',
      cultureDescription: '',
      maxCandidates: undefined,
    },
  });

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleProjectType = (type: string) => {
    const updated = selectedProjectTypes.includes(type)
      ? selectedProjectTypes.filter((t) => t !== type)
      : [...selectedProjectTypes, type];
    setSelectedProjectTypes(updated);
    form.setValue('projectTypes', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        requiredSkills: skills,
        documents: documents.map((f) => f.name),
      });
      toast.success('Campagne creee avec succes');
      navigate(`/recruitment/campaigns/${result.id}`);
    } catch {
      toast.error('Erreur lors de la creation de la campagne');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: {
        const { title, jobTitle, jobDescription, experienceLevel } = form.getValues();
        return title.length >= 3 && jobTitle.length >= 2 && jobDescription.length >= 10 && experienceLevel.length > 0;
      }
      case 1:
        return skills.length > 0;
      case 2:
        return !!form.getValues('culture');
      case 3:
        return true;
      default:
        return true;
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Nouvelle campagne de recrutement" />
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={() => navigate('/recruitment/campaigns')}>
            Annuler
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                  i === step
                    ? 'bg-primary text-primary-foreground font-medium'
                    : i < step
                      ? 'bg-accent text-foreground cursor-pointer hover:bg-accent/80'
                      : 'bg-accent/50 text-muted-foreground cursor-default',
                )}
              >
                <KeenIcon icon={s.icon} style="outline" className="size-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('w-6 h-px', i < step ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Job info */}
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations du poste</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de la campagne</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Chef de projet IT - Q1 2026" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intitule du poste</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Chef de projet senior" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description du poste</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Decrivez les responsabilites, le contexte et les attentes..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'experience</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selectionnez un niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Types de projet</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PROJECT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleProjectType(type)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                            selectedProjectTypes.includes(type)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-transparent text-muted-foreground border-border hover:border-primary/40',
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.projectTypes && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.projectTypes.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Skills */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Competences requises</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez les competences cles et ajustez leur poids relatif (1 = faible, 10 = critique).
                  </p>
                  <SkillsInput value={skills} onChange={setSkills} />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Culture */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Culture de gestion de projet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Selectionnez la culture de gestion de projet qui correspond a votre organisation.
                    Le scenario de simulation sera adapte en consequence.
                  </p>
                  <FormField
                    control={form.control}
                    name="culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CultureSelector
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cultureDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precisions supplementaires (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Decrivez les specificites de votre culture projet..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Document upload zone (US-8.4) */}
                  <div className="space-y-3">
                    <FormLabel>Documents internes (optionnel)</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Ajoutez des documents de reference pour enrichir le scenario (PDF, DOCX). Maximum {MAX_FILES} fichiers, 10 Mo chacun.
                    </p>

                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary/40 hover:bg-accent/30',
                        documents.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : 'border-border',
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        multiple
                        onChange={handleFileSelect}
                      />
                      <KeenIcon icon="folder-up" style="outline" className="size-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez ou deposez vos fichiers ici
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF ou DOCX - {documents.length}/{MAX_FILES} fichiers
                      </p>
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <KeenIcon
                              icon={file.name.endsWith('.pdf') ? 'document' : 'file'}
                              style="outline"
                              className="size-4 text-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} Mo
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="text-destructive hover:text-destructive shrink-0"
                            >
                              <KeenIcon icon="trash" style="outline" className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <KeenIcon icon="information-2" style="outline" className="size-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-xs text-warning">
                        Assurez-vous d'anonymiser les donnees sensibles avant de telecharger vos documents.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Settings */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parametres</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="maxCandidates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre maximum de candidats (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Illimite"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="rounded-lg border border-border bg-accent/30 p-4">
                    <div className="flex items-start gap-3">
                      <KeenIcon icon="information-2" style="outline" className="size-5 text-primary mt-0.5" />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>La campagne sera creee en mode <strong>Brouillon</strong>.</p>
                        <p>
                          Vous pourrez la publier depuis sa page de detail.
                          Un lien unique sera genere pour inviter les candidats.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resume de la campagne</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Informations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Titre</span>
                          <span className="font-medium">{form.getValues('title')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Poste</span>
                          <span className="font-medium">{form.getValues('jobTitle')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Experience</span>
                          <span className="font-medium">
                            {EXPERIENCE_LEVELS.find((l) => l.value === form.getValues('experienceLevel'))?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Culture</span>
                          <span className="font-medium">{form.getValues('culture')}</span>
                        </div>
                        {form.getValues('maxCandidates') && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max candidats</span>
                            <span className="font-medium">{form.getValues('maxCandidates')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Competences ({skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <Badge key={i} variant="primary" appearance="light" size="sm">
                            {s.skill} ({s.weight}/10)
                          </Badge>
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold mt-4">Types de projet</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProjectTypes.map((t) => (
                          <Badge key={t} variant="secondary" appearance="light" size="sm">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {form.getValues('jobDescription')}
                    </p>
                  </div>
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Documents ({documents.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {documents.map((f, i) => (
                          <Badge key={i} variant="secondary" appearance="light" size="sm">
                            <KeenIcon icon="document" style="outline" className="size-3 mr-1" />
                            {f.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goBack}
                disabled={step === 0}
              >
                <KeenIcon icon="arrow-left" style="outline" className="size-4" />
                Precedent
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={goNext}
                  disabled={!canProceed()}
                >
                  Suivant
                  <KeenIcon icon="arrow-right" style="outline" className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" style="outline" className="size-4" />
                      Creer la campagne
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
