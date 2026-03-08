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
    profile?.selectedSector ?? profile?.suggestedSector ?? '',
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
        toast.success('Onboarding termine. Bienvenue sur ProjectSim360 !');
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
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Choisissez votre parcours</h2>
        <p className="text-sm text-muted-foreground">
          Selectionnez le secteur dans lequel vous souhaitez realiser votre simulation.
        </p>
      </div>

      {/* Difficulty indicator */}
      {suggestedDifficulty && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Difficulte suggeree</p>
              <p className="text-sm text-muted-foreground">
                Basee sur votre profil et vos competences
              </p>
            </div>
            <Badge variant="primary" appearance="light" size="lg" className="capitalize">
              {suggestedDifficulty}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Sector Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Secteur de simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <SectorSelector
            value={selectedSector}
            suggestedSector={
              profile?.diagnosticData?.suggestedSector ?? profile?.suggestedSector
            }
            onChange={handleSectorChange}
          />
        </CardContent>
      </Card>

      {/* Custom Project Option */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Projet personnalise</p>
            <p className="text-sm text-muted-foreground">
              Vous avez un projet specifique ? Decrivez-le et notre IA generera un scenario adapte.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
            <KeenIcon icon="plus" style="solid" className="text-sm me-1" />
            Proposer un projet
          </Button>
        </CardContent>
      </Card>

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

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="text-sm me-1" />
          Retour
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleComplete}
          disabled={(!selectedSector && !submittedProject) || completeOnboarding.isPending}
        >
          {completeOnboarding.isPending ? 'Finalisation...' : 'Commencer la simulation'}
          <Play className="text-sm ms-1" />
        </Button>
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
                      <Input placeholder="Ex: Migration CRM pour PME" {...field} />
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
