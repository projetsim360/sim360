import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Play } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { SectorSelector } from '../components/sector-selector';
import {
  useProfile,
  useSelectSector,
  useSubmitCustomProject,
  useCompleteOnboarding,
} from '../api/profile.api';
import type { CustomProjectData } from '../types/profile.types';

interface ChoosePathStepProps {
  onBack: () => void;
}

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
  const [customProject, setCustomProject] = useState<CustomProjectData>({
    name: '',
    description: '',
    sector: '',
  });

  const suggestedDifficulty = profile?.diagnosticData?.suggestedDifficulty ?? profile?.suggestedDifficulty;

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    selectSector.mutate({ sector });
  };

  const handleSubmitCustomProject = () => {
    if (!customProject.name || !customProject.description) {
      toast.error('Veuillez remplir le nom et la description du projet.');
      return;
    }

    submitCustomProject.mutate(customProject, {
      onSuccess: () => {
        toast.success('Projet personnalise enregistre.');
        setShowCustomDialog(false);
      },
      onError: () => {
        toast.error('Erreur lors de l\'enregistrement du projet.');
      },
    });
  };

  const handleComplete = () => {
    if (!selectedSector) {
      toast.error('Veuillez selectionner un secteur.');
      return;
    }

    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        toast.success('Onboarding termine. Bienvenue sur ProjectSim360 !');
        navigate('/simulations');
      },
      onError: () => {
        toast.error('Erreur lors de la finalisation de l\'onboarding.');
      },
    });
  };

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
              <p className="text-xs text-muted-foreground">
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
            suggestedSector={profile?.diagnosticData?.suggestedSector ?? profile?.suggestedSector}
            onChange={handleSectorChange}
          />
        </CardContent>
      </Card>

      {/* Custom Project Option */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Projet personnalise</p>
            <p className="text-xs text-muted-foreground">
              Vous avez un projet specifique ? Decrivez-le et notre IA generera un scenario adapte.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCustomDialog(true)}>
            Proposer un projet
          </Button>
        </CardContent>
      </Card>

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
          disabled={!selectedSector || completeOnboarding.isPending}
        >
          {completeOnboarding.isPending ? 'Finalisation...' : 'Commencer la simulation'}
          <Play className="text-sm ms-1" />
        </Button>
      </div>

      {/* Custom Project Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proposer un projet personnalise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom du projet</Label>
              <Input
                value={customProject.name}
                onChange={(e) =>
                  setCustomProject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Migration CRM pour PME"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={customProject.description}
                onChange={(e) =>
                  setCustomProject((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Decrivez votre projet, ses objectifs et contraintes..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Input
                value={customProject.sector}
                onChange={(e) =>
                  setCustomProject((prev) => ({ ...prev, sector: e.target.value }))
                }
                placeholder="Ex: IT, Construction, Sante..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCustomDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitCustomProject}
              disabled={submitCustomProject.isPending}
            >
              {submitCustomProject.isPending ? 'Envoi...' : 'Soumettre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
