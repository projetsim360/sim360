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

const SECTOR_OPTIONS = SECTORS.filter((s) => s.value !== 'CUSTOM').map((s) => ({ value: s.label, label: s.label }));

const COOPERATION_LABELS: Record<number, string> = {
  1: '1 — très réticent',
  2: '2 — réservé',
  3: '3 — neutre',
  4: '4 — favorable',
  5: '5 — très coopératif',
};

export default function PlanMeetingPage() {
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
      toast.success('Réunion planifiée');
      queryClient.invalidateQueries({ queryKey: ['meetings', simId] });
      navigate(`/meetings/${meeting.id}`);
    },
    onError: (err: Error) => toast.error(err.message || 'Impossible de planifier la réunion'),
  });

  if (!simId) return null;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Tableau de bord', to: '/dashboard' },
          { label: 'Simulation', to: `/simulations/${simId}` },
          { label: 'Réunions', to: `/simulations/${simId}/meetings` },
          { label: 'Planifier' },
        ]}
        title="Planifier une réunion"
        subtitle="Choisissez le sujet, les objectifs, la durée et composez la table : rôles, personnalités et niveaux hiérarchiques."
      />

      <div className="px-4 sm:px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-5">
            {/* Cadre */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base text-[var(--brand-700)]">Cadre de la réunion</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Sujet</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. : arbitrage budgétaire du lot 2" {...field} />
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
                      <FormLabel>Objectifs</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder={'Un objectif par ligne\nEx. : valider le budget révisé'} {...field} />
                      </FormControl>
                      <FormDescription>Un objectif par ligne (6 au maximum).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée</FormLabel>
                      <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {d} minutes
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
                      <FormLabel>Format</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEXT">Écrite</SelectItem>
                          <SelectItem value="AUDIO">Vocale</SelectItem>
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
                      <FormLabel>Secteur d'activité</FormLabel>
                      <SearchableCombobox
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={SECTOR_OPTIONS}
                        placeholder="Secteur de la simulation (par défaut)"
                        searchPlaceholder="Rechercher ou saisir un secteur…"
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
                      <FormLabel>Enjeux à traiter</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Ex. : dépassement de 12 % sur le lot 2, fournisseur en retard de 3 semaines, comité de direction vendredi."
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
                  Participants ({participants.fields.length}/6)
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={participants.fields.length >= 6}
                  onClick={() => participants.append({ ...EMPTY_PARTICIPANT })}
                >
                  <KeenIcon icon="plus" style="solid" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {participants.fields.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-[var(--neutral-200)] p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                        Participant {index + 1}
                      </span>
                      {participants.fields.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Retirer le participant ${index + 1}`}
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
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : Sophie Martin" {...field} />
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
                            <FormLabel>Fonction</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : directrice financière" {...field} />
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
                            <FormLabel>Niveau hiérarchique</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SENIORITY_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
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
                            <FormLabel>Personnalité</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PERSONALITY_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
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
                            <FormLabel>Engagement</FormLabel>
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {COOPERATION_LABELS[n]}
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
                            <FormLabel>Style de communication</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : direct et chiffré" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.objectives`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 lg:col-span-1">
                            <FormLabel>Ses objectifs</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : limiter le dépassement à 5 %" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`participants.${index}.constraints`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 lg:col-span-1">
                            <FormLabel>Ses contraintes</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : gel des embauches" {...field} />
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
                Annuler
              </Button>
              <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                <KeenIcon icon="calendar-add" style="duotone" />
                {createMutation.isPending ? 'Planification…' : 'Planifier la réunion'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
