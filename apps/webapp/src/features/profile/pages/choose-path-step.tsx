import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { KeenIcon } from '@/components/keenicons';
import { ArrowLeft, Play } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { SectorSelector } from '../components/sector-selector';
import {
  useProfile,
  useSelectSector,
  useSubmitCustomProject,
  useCompleteOnboarding,
} from '../api/profile.api';
import { SECTORS } from '../types/profile.types';
import type { CustomProjectData } from '../types/profile.types';
import { useTv } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

interface ChoosePathStepProps {
  onBack: () => void;
}

const customProjectSchema = (t: (id: AppMessageKey) => string) =>
  z.object({
    projectName: z.string().min(3, t('onboarding.custom.err.nameMin')).max(100, t('onboarding.custom.err.nameMax')),
    description: z.string().min(20, t('onboarding.custom.err.descMin')).max(1000, t('onboarding.custom.err.descMax')),
    sector: z.string().min(1, t('onboarding.custom.err.sector')),
    teamSize: z
      .number({ error: t('onboarding.custom.err.number') })
      .min(1, t('onboarding.custom.err.teamMin'))
      .max(100, t('onboarding.custom.err.teamMax')),
    duration: z
      .number({ error: t('onboarding.custom.err.number') })
      .min(1, t('onboarding.custom.err.durationMin'))
      .max(36, t('onboarding.custom.err.durationMax')),
  });

type CustomProjectFormValues = z.infer<ReturnType<typeof customProjectSchema>>;

export function ChoosePathStep({ onBack }: ChoosePathStepProps) {
  const tv = useTv();
  const t = useT();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const selectSector = useSelectSector();
  const submitCustomProject = useSubmitCustomProject();
  const completeOnboarding = useCompleteOnboarding();

  const [selectedSector, setSelectedSector] = useState<string>(
    profile?.selectedSector ??
      profile?.suggestedSector ??
      profile?.questionnaireData?.targetDomain ??
      '',
  );
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<CustomProjectData | null>(null);

  const form = useForm<CustomProjectFormValues>({
    resolver: zodResolver(customProjectSchema(t)),
    defaultValues: {
      projectName: '',
      description: '',
      sector: '',
      teamSize: 5,
      duration: 6,
    },
  });

  const suggestedDifficulty =
    profile?.diagnosticData?.suggestedDifficulty ?? profile?.suggestedDifficulty;

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    selectSector.mutate({ sector });
  };

  const handleSubmitCustomProject = (values: CustomProjectFormValues) => {
    const data: CustomProjectData = {
      projectName: values.projectName,
      description: values.description,
      sector: values.sector,
      teamSize: values.teamSize,
      duration: values.duration,
    };

    submitCustomProject.mutate(data, {
      onSuccess: () => {
        toast.success(t('onboarding.custom.saved'));
        setSubmittedProject(data);
        setShowCustomDialog(false);
        form.reset();
      },
      onError: () => {
        toast.error(t('onboarding.custom.saveError'));
      },
    });
  };

  const handleComplete = () => {
    if (!selectedSector && !submittedProject) {
      toast.error(t('onboarding.path.needChoice'));
      return;
    }

    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('onboarding.path.done'));
        navigate('/simulations');
      },
      onError: () => {
        toast.error(t('onboarding.path.doneError'));
      },
    });
  };

  const sectorLabel = tv('domain', submittedProject?.sector);

  return (
    <div className="space-y-6">
      {/* Recap strip */}
      {(profile?.profileType || suggestedDifficulty || (profile?.skills?.length ?? 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--brand-100)] bg-[var(--brand-50)] px-4 py-3">
          <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-600)]">
            {t('onboarding.path.recap')}
          </span>
          {profile?.profileType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              {t('onboarding.path.profile', { value: tv('profileType', profile.profileType) })}
            </span>
          )}
          {suggestedDifficulty && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              {t('onboarding.path.difficulty', { value: tv('difficulty', suggestedDifficulty.toUpperCase()) })}
            </span>
          )}
          {(profile?.skills?.length ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              {t('onboarding.path.skills', { count: profile!.skills!.length })}
            </span>
          )}
        </div>
      )}

      {/* Sector Selection */}
      <div>
        <h3 className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">{t('onboarding.path.sectorTitle')}</h3>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
          {t('onboarding.path.sectorHint')}
        </p>
        <SectorSelector
          value={selectedSector}
          suggestedSector={profile?.diagnosticData?.suggestedSector ?? profile?.suggestedSector}
          onChange={handleSectorChange}
        />
      </div>

      {/* Custom project alternative */}
      <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t('auth.or')}
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[var(--brand-200)] bg-muted/40 p-4 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-100)] bg-white">
          <KeenIcon icon="notepad-edit" style="duotone" className="text-lg text-[var(--brand-600)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--brand-700)]">{t('onboarding.custom.title')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('onboarding.custom.text')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
          <KeenIcon icon="plus" style="duotone" className="text-sm me-1" />
          {t('onboarding.custom.cta')}
        </Button>
      </div>

      {/* Submitted Project Preview */}
      {submittedProject && (
        <Card className="ring-2 ring-primary/20 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <KeenIcon icon="notepad" style="duotone" className="text-lg text-primary" />
                {t('onboarding.custom.submitted')}
              </CardTitle>
              <Badge variant="success" appearance="light" size="sm">
                {t('onboarding.custom.savedBadge')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">{submittedProject.projectName}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {submittedProject.description}
              </p>
            </div>
            <Separator />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <KeenIcon icon="category" style="duotone" className="text-sm text-primary" />
                <span>{sectorLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                <KeenIcon icon="people" style="duotone" className="text-sm text-primary" />
                <span>{t('onboarding.custom.members', { count: submittedProject.teamSize })}</span>
              </div>
              <div className="flex items-center gap-1">
                <KeenIcon icon="calendar" style="duotone" className="text-sm text-primary" />
                <span>{t('onboarding.custom.months', { count: submittedProject.duration })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
            <ArrowLeft className="text-sm me-1" />
            {t('common.back')}
          </Button>
          <Button
            variant="primary"
            className="min-h-[48px] px-6 text-base font-bold"
            onClick={handleComplete}
            disabled={(!selectedSector && !submittedProject) || completeOnboarding.isPending}
          >
            <Play className="text-sm me-1.5" />
            {completeOnboarding.isPending ? t('onboarding.path.finishing') : t('onboarding.path.launch')}
          </Button>
        </div>
        {!selectedSector && !submittedProject && (
          <p className="text-xs text-muted-foreground text-right">
            {t('onboarding.path.needChoiceHint')}
          </p>
        )}
      </div>

      {/* Custom Project Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="notepad-edit" style="duotone" className="text-lg text-primary" />
              {t('onboarding.custom.title')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitCustomProject)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.custom.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('onboarding.custom.namePlaceholder')} aria-label={t('onboarding.custom.name')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.custom.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('onboarding.custom.descriptionPlaceholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.custom.sector')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('onboarding.custom.sectorPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>
                            {tv('domain', sector.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('onboarding.custom.team')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('onboarding.custom.duration')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={36}
                          placeholder="6"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitCustomProject.isPending}
                >
                  {submitCustomProject.isPending ? t('auth.forgot.sending') : t('common.submit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
