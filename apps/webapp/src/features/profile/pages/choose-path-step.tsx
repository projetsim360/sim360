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
import { SECTORS, PROFILE_TYPE_LABELS } from '../types/profile.types';
import type { CustomProjectData } from '../types/profile.types';

interface ChoosePathStepProps {
  onBack: () => void;
}

const customProjectSchema = z.object({
  projectName: z
    .string()
    .min(3, 'Le nom du projet doit contenir au moins 3 caracteres.')
    .max(100, 'Le nom du projet ne doit pas depasser 100 caracteres.'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caracteres.')
    .max(1000, 'La description ne doit pas depasser 1000 caracteres.'),
  sector: z.string().min(1, 'Veuillez selectionner un secteur.'),
  teamSize: z
    .number({ invalid_type_error: 'Veuillez saisir un nombre.' })
    .min(1, 'L\'equipe doit avoir au moins 1 membre.')
    .max(100, 'L\'equipe ne peut pas depasser 100 membres.'),
  duration: z
    .number({ invalid_type_error: 'Veuillez saisir un nombre.' })
    .min(1, 'La duree doit etre d\'au moins 1 mois.')
    .max(36, 'La duree ne peut pas depasser 36 mois.'),
});

type CustomProjectFormValues = z.infer<typeof customProjectSchema>;

export function ChoosePathStep({ onBack }: ChoosePathStepProps) {
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
    resolver: zodResolver(customProjectSchema),
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
        toast.success('Projet personnalise enregistre avec succes.');
        setSubmittedProject(data);
        setShowCustomDialog(false);
        form.reset();
      },
      onError: () => {
        toast.error("Erreur lors de l'enregistrement du projet.");
      },
    });
  };

  const handleComplete = () => {
    if (!selectedSector && !submittedProject) {
      toast.error('Veuillez selectionner un secteur ou proposer un projet.');
      return;
    }

    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        toast.success('Onboarding termine. Bienvenue sur Simex pro !');
        navigate('/simulations');
      },
      onError: () => {
        toast.error("Erreur lors de la finalisation de l'onboarding.");
      },
    });
  };

  const sectorLabel = SECTORS.find((s) => s.value === submittedProject?.sector)?.label ?? submittedProject?.sector;

  return (
    <div className="space-y-6">
      {/* Recap strip */}
      {(profile?.profileType || suggestedDifficulty || (profile?.skills?.length ?? 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--brand-100)] bg-[var(--brand-50)] px-4 py-3">
          <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-600)]">
            Votre parcours
          </span>
          {profile?.profileType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              Profil : {PROFILE_TYPE_LABELS[profile.profileType]}
            </span>
          )}
          {suggestedDifficulty && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold capitalize text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              Difficulté : {suggestedDifficulty}
            </span>
          )}
          {(profile?.skills?.length ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-100)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-700)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-500)]" />
              {profile!.skills!.length} compétences ciblées
            </span>
          )}
        </div>
      )}

      {/* Sector Selection */}
      <div>
        <h3 className="font-display text-[14.5px] font-bold text-[var(--brand-700)]">Secteur de votre simulation</h3>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
          Basé sur votre domaine et l'analyse IA — modifiable.
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
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[var(--brand-200)] bg-muted/40 p-4 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-100)] bg-white">
          <KeenIcon icon="notepad-edit" style="duotone" className="text-lg text-[var(--brand-600)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--brand-700)]">Proposer un projet personnalisé</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Décrivez votre propre projet, notre IA génère un scénario sur mesure.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
          <KeenIcon icon="plus" style="duotone" className="text-sm me-1" />
          Décrire mon projet
        </Button>
      </div>

      {/* Submitted Project Preview */}
      {submittedProject && (
        <Card className="ring-2 ring-primary/20 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <KeenIcon icon="notepad" style="duotone" className="text-lg text-primary" />
                Projet soumis
              </CardTitle>
              <Badge variant="success" appearance="light" size="sm">
                Enregistre
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
                <span>{submittedProject.teamSize} membres</span>
              </div>
              <div className="flex items-center gap-1">
                <KeenIcon icon="calendar" style="duotone" className="text-sm text-primary" />
                <span>{submittedProject.duration} mois</span>
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
            Retour
          </Button>
          <Button
            variant="primary"
            className="min-h-[48px] px-6 text-base font-bold"
            onClick={handleComplete}
            disabled={(!selectedSector && !submittedProject) || completeOnboarding.isPending}
          >
            <Play className="text-sm me-1.5" />
            {completeOnboarding.isPending ? 'Finalisation…' : 'Lancer ma simulation'}
          </Button>
        </div>
        {!selectedSector && !submittedProject && (
          <p className="text-xs text-muted-foreground text-right">
            Selectionnez un secteur ou proposez un projet pour continuer.
          </p>
        )}
      </div>

      {/* Custom Project Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="notepad-edit" style="duotone" className="text-lg text-primary" />
              Proposer un projet personnalise
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitCustomProject)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du projet</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Migration CRM pour PME" aria-label="Titre du projet personnalise" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Decrivez votre projet, ses objectifs et contraintes..."
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
                    <FormLabel>Secteur</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectionnez un secteur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>
                            {sector.label}
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
                      <FormLabel>Taille de l'equipe</FormLabel>
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
                      <FormLabel>Duree (mois)</FormLabel>
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
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitCustomProject.isPending}
                >
                  {submitCustomProject.isPending ? 'Envoi...' : 'Soumettre'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
