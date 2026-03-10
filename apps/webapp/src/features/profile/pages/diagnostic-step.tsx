import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Sparkles } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useProfile, useAnalyzeProfile, useCustomizeSkills } from '../api/profile.api';
import { SkillEditor } from '../components/skill-editor';
import { PROFILE_TYPE_LABELS, SKILL_LEVEL_LABELS } from '../types/profile.types';
import type { SkillGap, ProfileType } from '../types/profile.types';

interface DiagnosticStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PROFILE_TYPE_VARIANT: Record<ProfileType, 'secondary' | 'info' | 'warning' | 'primary'> = {
  ZERO_EXPERIENCE: 'secondary',
  BEGINNER: 'info',
  RECONVERSION: 'warning',
  REINFORCEMENT: 'primary',
};

export function DiagnosticStep({ onNext, onBack }: DiagnosticStepProps) {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const analyzeProfile = useAnalyzeProfile();
  const customizeSkills = useCustomizeSkills();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<SkillGap[]>([]);

  useEffect(() => {
    if (!profile?.diagnosticData) {
      analyzeProfile.mutate(undefined, {
        onError: () => {
          toast.error('Erreur lors de l\'analyse du profil.');
        },
      });
    }
  }, []);

  useEffect(() => {
    if (profile?.skills) {
      setEditedSkills(profile.skills);
    }
  }, [profile?.skills]);

  const diagnostic = profile?.diagnosticData;
  const isAnalyzing = analyzeProfile.isPending;

  const handleSaveSkills = () => {
    customizeSkills.mutate(editedSkills, {
      onSuccess: () => {
        toast.success('Competences mises a jour.');
        setIsCustomizing(false);
      },
      onError: () => {
        toast.error('Erreur lors de la sauvegarde des competences.');
      },
    });
  };

  if (isProfileLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Analyse en cours...</h2>
          <p className="text-sm text-muted-foreground">
            Notre IA analyse votre profil pour generer un diagnostic personnalise.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Votre diagnostic</h2>
        <p className="text-sm text-muted-foreground">
          Voici le resultat de l'analyse de votre profil par notre IA.
        </p>
      </div>

      {/* Profile Type & Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="text-xl text-primary" />
            <div>
              <CardTitle className="text-base">Diagnostic IA</CardTitle>
              {diagnostic?.profileType && (
                <Badge
                  variant={PROFILE_TYPE_VARIANT[diagnostic.profileType]}
                  appearance="light"
                  size="md"
                  className="mt-1"
                >
                  {PROFILE_TYPE_LABELS[diagnostic.profileType]}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostic?.personalizedMessage && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground leading-relaxed">
                {diagnostic.personalizedMessage}
              </p>
            </div>
          )}

          {diagnostic?.summary && (
            <p className="text-sm text-muted-foreground">{diagnostic.summary}</p>
          )}
        </CardContent>
      </Card>

      {/* Skills Gap Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Analyse des competences</CardTitle>
            <Button
              variant={isCustomizing ? 'mono' : 'outline'}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              {isCustomizing ? 'Annuler' : 'Personnaliser'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCustomizing ? (
            <div className="space-y-4">
              <SkillEditor skills={editedSkills} onChange={setEditedSkills} />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSkills}
                  disabled={customizeSkills.isPending}
                >
                  {customizeSkills.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(profile?.skills ?? []).map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{SKILL_LEVEL_LABELS[skill.currentLevel]}</span>
                      <span className="text-muted-foreground/50">→</span>
                      <span>{SKILL_LEVEL_LABELS[skill.targetLevel]}</span>
                    </div>
                  </div>
                  <Progress
                    value={skill.gap}
                    className="h-1.5"
                    indicatorClassName={cn(
                      skill.gap <= 25 && 'bg-success',
                      skill.gap > 25 && skill.gap <= 50 && 'bg-warning',
                      skill.gap > 50 && skill.gap <= 75 && 'bg-[var(--accent-brand)]',
                      skill.gap > 75 && 'bg-destructive',
                    )}
                  />
                </div>
              ))}

              {(!profile?.skills || profile.skills.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune competence detectee. Cliquez sur "Personnaliser" pour ajouter vos competences.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="text-sm me-1" />
          Retour
        </Button>
        <Button variant="primary" size="sm" onClick={onNext}>
          Accepter et continuer
          <ArrowRight className="text-sm ms-1" />
        </Button>
      </div>
    </div>
  );
}
