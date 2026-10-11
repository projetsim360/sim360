import { useEffect } from 'react';
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
import { KeenIcon } from '@/components/keenicons';
import { ArrowRight } from '@/components/keenicons/icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSubmitQuestionnaire } from '../api/profile.api';
import { DOMAINS } from '../types/profile.types';
import type { QuestionnaireData, UserProfile } from '../types/profile.types';
import type { OnboardingLiveState } from '../config/onboarding.config';
import { ProfileImportPanel } from '../components/profile-import-panel';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const buildSchema = (t: (id: AppMessageKey) => string) =>
  z.object({
    objective: z.enum(['reinforce', 'reconversion', 'discovery'], {
      error: t('onboarding.profil.err.objective'),
    }),
    targetDomain: z.string().min(1, t('onboarding.profil.err.domain')),
    experienceLevel: z.enum(['none', 'beginner', 'confirmed'], {
      error: t('onboarding.profil.err.experience'),
    }),
    mainMotivation: z
      .string()
      .min(10, t('onboarding.profil.err.motivationMin'))
      .max(500, t('onboarding.profil.err.motivationMax')),
  });

const OBJECTIVES = [
  { value: 'reinforce', icon: 'rocket', label: 'onboarding.profil.obj.reinforce' },
  { value: 'reconversion', icon: 'arrows-circle', label: 'onboarding.profil.obj.reconversion' },
  { value: 'discovery', icon: 'route', label: 'onboarding.profil.obj.discovery' },
] as const;

const EXPERIENCES = [
  { value: 'none', icon: 'book-open', label: 'onboarding.profil.exp.none' },
  { value: 'beginner', icon: 'graph-up', label: 'onboarding.profil.exp.beginner' },
  { value: 'confirmed', icon: 'award', label: 'onboarding.profil.exp.confirmed' },
] as const;

interface ProfilStepProps {
  profile?: UserProfile;
  defaultValues?: QuestionnaireData | null;
  onLiveChange: (live: Partial<OnboardingLiveState>) => void;
  onNext: (data: QuestionnaireData) => void;
}

export function ProfilStep({ profile, defaultValues, onLiveChange, onNext }: ProfilStepProps) {
  const t = useT();
  const submit = useSubmitQuestionnaire();
  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(buildSchema(t)),
    defaultValues: defaultValues ?? {
      objective: undefined as unknown as QuestionnaireData['objective'],
      targetDomain: '',
      experienceLevel: undefined as unknown as QuestionnaireData['experienceLevel'],
      mainMotivation: '',
    },
  });

  const objective = form.watch('objective');
  const targetDomain = form.watch('targetDomain');
  const experienceLevel = form.watch('experienceLevel');

  useEffect(() => {
    onLiveChange({ questionnaire: { objective, targetDomain, experienceLevel } });
  }, [objective, targetDomain, experienceLevel, onLiveChange]);

  const onSubmit = (data: QuestionnaireData) => {
    submit.mutate(data, {
      onSuccess: () => {
        toast.success(t('onboarding.profil.saved'));
        onNext(data);
      },
      onError: () => toast.error(t('onboarding.profil.saveError')),
    });
  };

  return (
    <div className="space-y-7">
      <ProfileImportPanel profile={profile} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <FormField
            control={form.control}
            name="objective"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  {t('onboarding.profil.objective')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    {OBJECTIVES.map((o) => (
                      <OptionCard
                        key={o.value}
                        id={`obj-${o.value}`}
                        value={o.value}
                        icon={o.icon}
                        label={o.label}
                        selected={field.value === o.value}
                      />
                    ))}
                  </RadioGroup>
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
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  {t('onboarding.profil.experience')}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    {EXPERIENCES.map((o) => (
                      <OptionCard
                        key={o.value}
                        id={`exp-${o.value}`}
                        value={o.value}
                        icon={o.icon}
                        label={o.label}
                        selected={field.value === o.value}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  {t('onboarding.profil.domain')}
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('onboarding.profil.domainPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {t(`domain.${d.value}` as AppMessageKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainMotivation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">
                  {t('onboarding.profil.motivation')}
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder={t('onboarding.profil.motivationPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end border-t border-border pt-5">
            <Button type="submit" variant="primary" className="min-h-[44px] px-5" disabled={submit.isPending}>
              {submit.isPending ? t('common.saving') : t('common.continue')}
              <ArrowRight className="text-sm ms-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function OptionCard({
  id,
  value,
  icon,
  label,
  selected,
}: {
  id: string;
  value: string;
  icon: string;
  label: AppMessageKey;
  selected: boolean;
}) {
  const t = useT();
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] motion-reduce:transform-none',
        selected
          ? 'border-[var(--accent-500)] bg-[var(--accent-50)] shadow-sm'
          : 'border-border bg-card hover:border-[var(--brand-300)]',
      )}
    >
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-[9px]',
          selected ? 'bg-[var(--accent-500)] text-white' : 'bg-[var(--brand-50)] text-[var(--brand-600)]',
        )}
      >
        <KeenIcon icon={icon} style="duotone" className="text-base" />
      </span>
      <span className="text-[13px] font-semibold text-[var(--brand-700)]">{t(label)}</span>
      <RadioGroupItem value={value} id={id} className="sr-only" />
    </Label>
  );
}
