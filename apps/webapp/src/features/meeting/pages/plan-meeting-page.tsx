import { useNavigate, useParams } from 'react-router';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { KeenIcon } from '@/components/keenicons';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableCombobox } from '@/components/common/searchable-combobox';
import { SECTORS } from '@/features/simulation/config/sectors';
import { meetingApi } from '../api/meeting.api';
import {
  DEFAULT_CUSTOM_MEETING,
  DURATION_OPTIONS,
  EMPTY_PARTICIPANT,
  PERSONALITY_OPTIONS,
  SENIORITY_OPTIONS,
  customMeetingSchema,
  toCustomMeetingPayload,
  type CustomMeetingFormValues,
} from '../lib/custom-meeting';
import { useTv } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

export default function PlanMeetingPage() {
  const tv = useTv();
  const sectorOptions = SECTORS.filter((s) => s.value !== 'CUSTOM').map((s) => ({ value: tv('sector', s.value), label: tv('sector', s.value) }));
  const t = useT();
  const { simId } = useParams<{ simId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CustomMeetingFormValues>({
    resolver: zodResolver(customMeetingSchema),
    defaultValues: DEFAULT_CUSTOM_MEETING,
  });
  const participants = useFieldArray({ control: form.control, name: 'participants' });

  const createMutation = useMutation({
    mutationFn: (values: CustomMeetingFormValues) => meetingApi.createCustomMeeting(simId!, toCustomMeetingPayload(values)),
    onSuccess: (meeting) => {
      toast.success(t('meetingPlan.done'));
      queryClient.invalidateQueries({ queryKey: ['meetings', simId] });
      navigate(`/meetings/${meeting.id}`);
    },
    onError: (err: Error) => toast.error(err.message || t('meetingPlan.error')),
  });

  if (!simId) return null;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/dashboard' },
          { label: t('dashboard.activity.simulation'), to: `/simulations/${simId}` },
          { label: t('dashboard.priority.meetings'), to: `/simulations/${simId}/meetings` },
          { label: t('meetingPlan.crumb') },
        ]}
        title={t('meetingPlan.title')}
        subtitle={t('meetingPlan.subtitle')}
      />

      <div className="px-4 sm:px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-5">
            {/* Cadre */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base text-[var(--brand-700)]">{t('meetingPlan.frame')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('meetingPlan.subject')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('meetingPlan.subjectPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('scenario.stat.objectives')}</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder={t('meetingPlan.objectivesPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('meetingPlan.objectivesHint')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('scenario.stat.duration')}</FormLabel>
                      <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {t('meetingPlan.minutes', { n: d })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('meetingPlan.format')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEXT">{t('meetingPlan.format.text')}</SelectItem>
                          <SelectItem value="AUDIO">{t('meetingPlan.format.audio')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('meetingPlan.sector')}</FormLabel>
                      <SearchableCombobox
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={sectorOptions}
                        placeholder={t('meetingPlan.sectorPlaceholder')}
                        searchPlaceholder={t('meetingPlan.sectorSearch')}
                        allowCustom
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stakes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('meetingPlan.stakes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder={t('meetingPlan.stakesPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="font-display text-base text-[var(--brand-700)]">
                  {t('meetingPlan.participants', { n: participants.fields.length })}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={participants.fields.length >= 6}
                  onClick={() => participants.append({ ...EMPTY_PARTICIPANT })}
                >
                  <KeenIcon icon="plus" style="solid" />
                  {t('common.add')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {participants.fields.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-[var(--neutral-200)] p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                        {t('meetingPlan.participant', { n: index + 1 })}
                      </span>
                      {participants.fields.length > 1 && (
                        <button
                          type="button"
                          aria-label={t('meetingPlan.removeParticipant', { n: index + 1 })}
                          onClick={() => participants.remove(index)}
                          className="cursor-pointer rounded p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--error-600)]"
                        >
                          <KeenIcon icon="trash" style="duotone" className="text-sm" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <FormField
                        control={form.control}
                        name={`participants.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.field.lastName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('meetingPlan.namePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('wizard.basics.jobTitle')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('meetingPlan.rolePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.seniority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('meetingPlan.seniority')}</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SENIORITY_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {t(o.label)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.personality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('projects.personality')}</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PERSONALITY_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {t(o.label)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.cooperationLevel`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('meetingPlan.cooperation')}</FormLabel>
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {t(`cooperation.${n}` as AppMessageKey)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.communicationStyle`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('meetingPlan.style')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('meetingPlan.stylePlaceholder')} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.objectives`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 lg:col-span-1">
                            <FormLabel>{t('meetingPlan.theirObjectives')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('meetingPlan.theirObjectivesPlaceholder')} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.constraints`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 lg:col-span-1">
                            <FormLabel>{t('meetingPlan.constraints')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('meetingPlan.constraintsPlaceholder')} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                {form.formState.errors.participants?.root?.message && (
                  <p className="text-sm text-destructive">{form.formState.errors.participants.root.message}</p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(`/simulations/${simId}/meetings`)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                <KeenIcon icon="calendar-add" style="duotone" />
                {createMutation.isPending ? t('meetingPlan.submitting') : t('meetingPlan.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
