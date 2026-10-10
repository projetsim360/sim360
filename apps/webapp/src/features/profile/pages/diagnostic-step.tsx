import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { ArrowLeft, ArrowRight, Sparkles } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { useProfile, useAnalyzeProfile, useCustomizeSkills } from '../api/profile.api';
import { SkillEditor } from '../components/skill-editor';
import { SkillDeltaBar } from '../components/skill-delta-bar';
import { PROFILE_TYPE_LABELS, formatDifficulty } from '../types/profile.types';
import type { SkillGap } from '../types/profile.types';

interface DiagnosticStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function DiagnosticStep({ onNext, onBack }: DiagnosticStepProps) {
  const reduce = useReducedMotion();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const analyzeProfile = useAnalyzeProfile();
  const customizeSkills = useCustomizeSkills();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<SkillGap[]>([]);

  useEffect(() => {
    if (!profile?.diagnosticData) {
      analyzeProfile.mutate(undefined, {
        onError: () => toast.error("Erreur lors de l'analyse du profil."),
      });
    }
  }, []);

  useEffect(() => {
    if (profile?.skills) setEditedSkills(profile.skills);
  }, [profile?.skills]);

  const diagnostic = profile?.diagnosticData;
  const isAnalyzing = analyzeProfile.isPending;

  const handleSaveSkills = () => {
    customizeSkills.mutate(editedSkills, {
      onSuccess: () => {
        toast.success('Compétences mises à jour.');
        setIsCustomizing(false);
      },
      onError: () => toast.error('Erreur lors de la sauvegarde des compétences.'),
    });
  };

  if (isProfileLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--brand-100)] bg-[var(--brand-50)] p-8 text-center">
          <span className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-700)] text-white">
            {!reduce && (
              <span className="absolute inset-0 animate-ping rounded-2xl bg-[var(--brand-500)] opacity-30" />
            )}
            <KeenIcon icon="abstract-26" style="duotone" className="relative text-2xl" />
          </span>
          <p className="font-display text-base font-bold text-[var(--brand-700)]">Analyse de votre profil…</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nous évaluons vos compétences et préparons votre diagnostic.
          </p>
          <div className="mx-auto mt-5 max-w-sm space-y-2.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mx-auto h-3 w-4/5" />
            <Skeleton className="mx-auto h-3 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  const hasSkills = !!profile?.skills && profile.skills.length > 0;

  return (
    <div className="space-y-6">
      {/* Hero verdict */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-700), var(--brand-500))' }}
      >
        <Sparkles className="pointer-events-none absolute -right-3 -top-5 text-[120px] opacity-10" />
        <div className="relative flex gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
            <KeenIcon icon="abstract-26" style="duotone" className="text-2xl" />
          </span>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--brand-200)]">
              Profil détecté automatiquement
            </div>
            {diagnostic?.profileType && (
              <div className="mt-1 font-display text-[22px] font-extrabold">
                {PROFILE_TYPE_LABELS[diagnostic.profileType]}
              </div>
            )}
            {diagnostic?.personalizedMessage && (
              <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-[var(--brand-100)]">
                {diagnostic.personalizedMessage}
              </p>
            )}
            {diagnostic?.suggestedDifficulty && (
              <span className="mt-3 inline-block rounded-full bg-[var(--accent-500)] px-3 py-1 text-[10.5px] font-bold">
                Difficulté suggérée : {formatDifficulty(diagnostic.suggestedDifficulty)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {diagnostic?.summary && <p className="text-sm text-muted-foreground">{diagnostic.summary}</p>}

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vos compétences à développer</CardTitle>
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
                <Button variant="primary" size="sm" onClick={handleSaveSkills} disabled={customizeSkills.isPending}>
                  {customizeSkills.isPending ? 'Sauvegarde…' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          ) : hasSkills ? (
            <>
              <div className="mb-4 flex gap-4 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-3.5 rounded-sm bg-[var(--brand-600)]" /> Niveau actuel
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-3.5 rounded-sm"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 4px, var(--accent-100) 4px, var(--accent-100) 8px)',
                    }}
                  />{' '}
                  Écart à combler
                </span>
              </div>
              <div className="space-y-4">
                {profile!.skills!.map((skill, i) => (
                  <SkillDeltaBar
                    key={skill.name}
                    name={skill.name}
                    currentLevel={skill.currentLevel}
                    targetLevel={skill.targetLevel}
                    index={i}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucune compétence détectée. Cliquez sur « Personnaliser » pour ajouter vos compétences.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button variant="ghost" className="min-h-[44px] px-4" onClick={onBack}>
          <ArrowLeft className="text-sm me-1" />
          Retour
        </Button>
        <Button variant="primary" className="min-h-[44px] px-5" onClick={onNext}>
          Accepter et continuer
          <ArrowRight className="text-sm ms-1" />
        </Button>
      </div>
    </div>
  );
}
