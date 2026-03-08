import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { KeenIcon } from '@/components/keenicons';
import { Upload, ArrowRight } from '@/components/keenicons/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUploadCv, useImportLinkedin } from '../api/profile.api';
import type { UserProfile } from '../types/profile.types';

interface ProfileImportStepProps {
  onNext: () => void;
  profile?: UserProfile;
}

export function ProfileImportStep({ onNext, profile }: ProfileImportStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLinkedinDialog, setShowLinkedinDialog] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  const uploadCv = useUploadCv();
  const importLinkedin = useImportLinkedin();

  const hasData = !!profile?.cvData || !!profile?.linkedinData || !!profile?.cvFileUrl;

  const handleFileDrop = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      if (file.type !== 'application/pdf') {
        toast.error('Seuls les fichiers PDF sont acceptes.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas depasser 5 Mo.');
        return;
      }

      const formData = new FormData();
      formData.append('cv', file);

      uploadCv.mutate(formData, {
        onSuccess: (data) => {
          const skillCount =
            data && typeof data === 'object' && 'cvData' in data
              ? ((data as UserProfile).cvData as Record<string, unknown>)?.skillCount
              : undefined;
          toast.success(
            skillCount
              ? `CV importe avec succes. ${skillCount} competences detectees.`
              : 'CV importe avec succes.',
          );
        },
        onError: () => {
          toast.error("Erreur lors de l'import du CV.");
        },
      });
    },
    [uploadCv],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileDrop(e.dataTransfer.files);
    },
    [handleFileDrop],
  );

  const validateLinkedinUrl = (url: string): boolean => {
    if (!url.trim()) {
      setLinkedinError('Veuillez saisir une URL LinkedIn.');
      return false;
    }
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    if (!linkedinPattern.test(url.trim())) {
      setLinkedinError('Veuillez saisir une URL LinkedIn valide (ex: https://linkedin.com/in/votre-profil).');
      return false;
    }
    setLinkedinError('');
    return true;
  };

  const handleLinkedinSubmit = () => {
    if (!validateLinkedinUrl(linkedinUrl)) return;

    importLinkedin.mutate(
      { linkedinUrl: linkedinUrl.trim() },
      {
        onSuccess: (data) => {
          const linkedinData = data && typeof data === 'object' && 'linkedinData' in data
            ? (data as UserProfile).linkedinData as Record<string, unknown>
            : undefined;
          const extractedCount = linkedinData
            ? Object.keys(linkedinData).length
            : 0;
          toast.success(
            extractedCount > 0
              ? `Donnees LinkedIn importees avec succes. ${extractedCount} informations extraites.`
              : 'Donnees LinkedIn importees avec succes.',
          );
          setShowLinkedinDialog(false);
          setLinkedinUrl('');
          setLinkedinError('');
        },
        onError: () => {
          toast.error("Erreur lors de l'import LinkedIn.");
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Importez votre profil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Importez vos donnees existantes pour personnaliser votre experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* LinkedIn Card */}
        <Card
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-md',
            profile?.linkedinData && 'ring-2 ring-green-500/30 border-green-500/30',
          )}
          onClick={() => setShowLinkedinDialog(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="linkedin" style="solid" className="text-xl text-[#0077B5]" />
              Importer depuis LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Collez l'URL de votre profil LinkedIn pour importer automatiquement vos experiences et
              competences.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowLinkedinDialog(true);
              }}
            >
              <KeenIcon icon="linkedin" style="solid" className="text-sm me-1" />
              {profile?.linkedinData ? 'Reimporter LinkedIn' : 'Connecter LinkedIn'}
            </Button>
            {profile?.linkedinData && (
              <Badge variant="success" appearance="light" size="sm">
                Donnees importees
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* CV Upload Card */}
        <Card
          className={cn(
            'relative transition-all',
            profile?.cvFileUrl && 'ring-2 ring-green-500/30 border-green-500/30',
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="text-lg text-primary" />
              Uploader un CV (PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/50',
                uploadCv.isPending && 'pointer-events-none opacity-60',
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cv-file-input')?.click()}
            >
              {uploadCv.isPending ? (
                <div className="space-y-3">
                  <KeenIcon icon="loading" style="duotone" className="text-3xl text-primary animate-spin" />
                  <p className="text-sm text-primary font-medium">Analyse du CV en cours...</p>
                  <Progress value={65} className="h-1.5 max-w-[200px] mx-auto" />
                </div>
              ) : (
                <>
                  <KeenIcon
                    icon="file-up"
                    style="duotone"
                    className="text-3xl text-muted-foreground mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Glissez-deposez votre CV ici</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ou cliquez pour parcourir (PDF, max 5 Mo)
                  </p>
                </>
              )}
              <input
                id="cv-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileDrop(e.target.files)}
              />
            </div>
            {profile?.cvFileUrl && !uploadCv.isPending && (
              <Badge variant="success" appearance="light" size="sm">
                CV importe
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {hasData && profile?.cvData && (
        <>
          <Separator />
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-foreground mb-2">Donnees extraites du CV</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {typeof profile.cvData === 'object' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <KeenIcon icon="briefcase" style="duotone" className="text-base text-primary" />
                      <span>
                        Experiences :{' '}
                        {((profile.cvData as Record<string, unknown>).experienceCount as number) ?? '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <KeenIcon icon="star" style="duotone" className="text-base text-primary" />
                      <span>
                        Competences :{' '}
                        {((profile.cvData as Record<string, unknown>).skillCount as number) ?? '-'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {hasData && profile?.linkedinData && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground mb-2">Donnees extraites de LinkedIn</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {typeof profile.linkedinData === 'object' && (
                <div className="flex items-center gap-1.5">
                  <KeenIcon icon="linkedin" style="solid" className="text-base text-[#0077B5]" />
                  <span>
                    {Object.keys(profile.linkedinData).length} informations extraites
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onNext}>
          Je n'ai ni CV ni LinkedIn
        </Button>
        <Button variant="primary" size="sm" onClick={onNext}>
          Continuer
          <ArrowRight className="text-sm ms-1" />
        </Button>
      </div>

      {/* LinkedIn Import Dialog */}
      <Dialog open={showLinkedinDialog} onOpenChange={setShowLinkedinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="linkedin" style="solid" className="text-xl text-[#0077B5]" />
              Importer depuis LinkedIn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Collez l'URL de votre profil LinkedIn. Nous extrairons automatiquement vos experiences,
              competences et formations.
            </p>
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">URL du profil LinkedIn</Label>
              <Input
                id="linkedin-url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (linkedinError) setLinkedinError('');
                }}
                placeholder="https://linkedin.com/in/votre-profil"
                aria-invalid={!!linkedinError}
              />
              {linkedinError && (
                <p className="text-xs text-destructive">{linkedinError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowLinkedinDialog(false);
                setLinkedinUrl('');
                setLinkedinError('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLinkedinSubmit}
              disabled={importLinkedin.isPending}
            >
              {importLinkedin.isPending ? 'Import en cours...' : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
