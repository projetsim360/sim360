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
import type { AppMessageKey } from '@/i18n/app/messages';
import { useTv } from '@/i18n/app/use-t';
import { Msg } from '@/i18n/app/msg';
import { useT } from '@/i18n/app/use-t';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const campaignSchema = z.object({
  title: z.string().min(3, 'recruit.form.titleMin'),
  jobTitle: z.string().min(2, 'recruit.form.jobRequired'),
  jobDescription: z.string().min(10, 'recruit.form.descMin'),
  experienceLevel: z.string().min(1, 'recruit.form.levelRequired'),
  projectTypes: z.array(z.string()).min(1, 'recruit.form.typeRequired'),
  culture: z.enum(['STRICT', 'AGILE', 'COLLABORATIVE']),
  cultureDescription: z.string().optional(),
  maxCandidates: z.number().min(1).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS: Array<{ label: AppMessageKey; icon: string }> = [
  { label: 'recruit.wizard.info', icon: 'document' },
  { label: 'recruit.wizard.skills', icon: 'award' },
  { label: 'recruit.wizard.culture', icon: 'people' },
  { label: 'recruit.wizard.settings', icon: 'setting-2' },
  { label: 'recruit.wizard.summary', icon: 'check' },
];

const EXPERIENCE_LEVELS: Array<{ value: string; label: AppMessageKey }> = [
  { value: 'JUNIOR', label: 'recruit.level.JUNIOR' },
  { value: 'INTERMEDIATE', label: 'recruit.level.INTERMEDIATE' },
  { value: 'SENIOR', label: 'recruit.level.SENIOR' },
  { value: 'EXPERT', label: 'recruit.level.EXPERT' },
];

/** Values are stored as-is on the campaign; only the label is translated. */
const PROJECT_TYPES: Array<{ value: string; label: AppMessageKey }> = [
  { value: 'IT / Digital', label: 'recruit.pt.it' },
  { value: 'Construction / BTP', label: 'recruit.pt.construction' },
  { value: 'Industrie', label: 'recruit.pt.industry' },
  { value: 'Consulting', label: 'recruit.pt.consulting' },
  { value: 'Marketing', label: 'recruit.pt.marketing' },
  { value: 'R&D', label: 'recruit.pt.rd' },
  { value: 'Transformation', label: 'recruit.pt.transformation' },
  { value: 'Infrastructure', label: 'recruit.pt.infrastructure' },
];

const projectTypeLabel = (value: string) => PROJECT_TYPES.find((p) => p.value === value)?.label;

export default function CreateCampaignPage() {
  const tv = useTv();
  const t = useT();
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
        toast.error(t('recruit.files.max', { n: MAX_FILES }));
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(t('recruit.files.format', { name: file.name }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('recruit.files.size', { name: file.name }));
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
      toast.success(t('recruit.created'));
      navigate(`/recruitment/campaigns/${result.id}`);
    } catch {
      toast.error(t('recruit.createError'));
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
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={t('recruit.newCampaignTitle')} />
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={() => navigate('/recruitment/campaigns')}>
            {t('common.cancel')}
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Step indicators */}
        <div className="flex items-center justify-start gap-2 mb-8 overflow-x-auto pb-1 sm:justify-center">
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
                <KeenIcon icon={s.icon} style="duotone" className="size-4" />
                <span className="hidden sm:inline">{t(s.label)}</span>
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
                  <CardTitle>{t('recruit.form.jobInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruit.form.campaignTitle')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('recruit.form.campaignTitlePh')} {...field} />
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
                        <FormLabel>{t('recruit.form.jobTitle')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('recruit.form.jobTitlePh')} {...field} />
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
                        <FormLabel>{t('recruit.form.jobDesc')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('recruit.form.jobDescPh')}
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
                        <FormLabel>{t('settings.profile.experience')}</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('recruit.form.levelPh')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {t(level.label)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>{t('recruit.form.projectTypes')}</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PROJECT_TYPES.map(({ value: type, label }) => (
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
                          {t(label)}
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.projectTypes && (
                      <p className="text-sm text-destructive mt-1">
                        {t(form.formState.errors.projectTypes.message as AppMessageKey)}
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
                  <CardTitle>{t('recruit.form.requiredSkills')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez les compétences clés et ajustez leur poids relatif (1 = faible, 10 = critique).
                  </p>
                  <SkillsInput value={skills} onChange={setSkills} />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Culture */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('recruit.form.culture')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    {t('recruit.form.cultureDesc')}
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
                        <FormLabel>{t('recruit.form.cultureMore')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('recruit.form.cultureMorePh')}
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
                    <FormLabel>{t('recruit.form.docs')}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez des documents de référence pour enrichir le scénario (PDF, DOCX). Maximum {MAX_FILES} fichiers, 10 Mo chacun.
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
                      <KeenIcon icon="folder-up" style="duotone" className="size-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t('recruit.files.drop')}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('recruit.files.count', { n: documents.length, max: MAX_FILES })}
                      </p>
                    </div>

                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 rounded-lg border border-border p-3">
                            <KeenIcon
                              icon={file.name.endsWith('.pdf') ? 'document' : 'file'}
                              style="duotone"
                              className="size-4 text-primary shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('recruit.files.mb', { n: (file.size / 1024 / 1024).toFixed(2) })}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="text-destructive hover:text-destructive shrink-0"
                            >
                              <KeenIcon icon="trash" style="duotone" className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <KeenIcon icon="information-2" style="duotone" className="size-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-sm text-warning">
                        {t('recruit.files.anonymize')}
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
                  <CardTitle>{t('recruit.wizard.settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="maxCandidates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('recruit.form.maxCandidates')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder={t('recruit.form.unlimited')}
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
                      <KeenIcon icon="information-2" style="duotone" className="size-5 text-primary mt-0.5" />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><Msg id="recruit.form.draftNote" values={{ b: (chunks) => <strong>{chunks}</strong> }} /></p>
                        <p>
                          {t('recruit.form.publishNote')}
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
                  <CardTitle>{t('recruit.form.summaryTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">{t('recruit.wizard.info')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('recruit.col.title')}</span>
                          <span className="font-medium">{form.getValues('title')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('recruit.col.job')}</span>
                          <span className="font-medium">{form.getValues('jobTitle')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('recruit.form.experience')}</span>
                          <span className="font-medium">
                            {tv('recruit.level', form.getValues('experienceLevel'))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('recruit.wizard.culture')}</span>
                          <span className="font-medium">{tv('recruit.culture', form.getValues('culture'))}</span>
                        </div>
                        {form.getValues('maxCandidates') && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('recruit.form.maxCandidatesShort')}</span>
                            <span className="font-medium">{form.getValues('maxCandidates')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Compétences ({skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <Badge key={i} variant="primary" appearance="light" size="sm">
                            {s.skill} ({s.weight}/10)
                          </Badge>
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold mt-4">{t('recruit.form.projectTypes')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProjectTypes.map((pt) => (
                          <Badge key={pt} variant="secondary" appearance="light" size="sm">
                            {projectTypeLabel(pt) ? t(projectTypeLabel(pt)!) : pt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{t('onboarding.custom.description')}</h4>
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
                            <KeenIcon icon="document" style="duotone" className="size-3 mr-1" />
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
                <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
                {t('common.previous')}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={goNext}
                  disabled={!canProceed()}
                >
                  {t('common.next')}
                  <KeenIcon icon="arrow-right" style="duotone" className="size-4" />
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
                      {t('mentoring.creating')}
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" style="duotone" className="size-4" />
                      {t('recruit.createBtn')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
    </div>
  );
}
