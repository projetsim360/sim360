import { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
        onSuccess: () => {
          toast.success('CV importe avec succes.');
        },
        onError: () => {
          toast.error('Erreur lors de l\'import du CV.');
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

  const handleLinkedinImport = () => {
    importLinkedin.mutate(undefined, {
      onSuccess: () => {
        toast.success('Donnees LinkedIn importees avec succes.');
      },
      onError: () => {
        toast.error('Erreur lors de l\'import LinkedIn.');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Importez votre profil
        </h2>
        <p className="text-sm text-muted-foreground">
          Commencez par importer vos donnees existantes pour personnaliser votre experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LinkedIn Card */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="linkedin" style="solid" className="text-xl text-[#0077B5]" />
              Importer depuis LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connectez votre profil LinkedIn pour importer automatiquement vos experiences
              et competences.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLinkedinImport}
              disabled={importLinkedin.isPending}
              className="w-full"
            >
              {importLinkedin.isPending ? 'Import en cours...' : 'Connecter LinkedIn'}
            </Button>
            {profile?.linkedinData && (
              <Badge variant="success" appearance="light" size="sm">
                Donnees importees
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* CV Upload Card */}
        <Card>
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
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cv-file-input')?.click()}
            >
              <KeenIcon icon="file-up" style="duotone" className="text-3xl text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Glissez-deposez votre CV ici
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou cliquez pour parcourir (PDF, max 5 Mo)
              </p>
              <input
                id="cv-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileDrop(e.target.files)}
              />
            </div>
            {uploadCv.isPending && (
              <p className="text-sm text-muted-foreground text-center">Analyse en cours...</p>
            )}
            {profile?.cvFileUrl && (
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
              <p className="text-sm font-medium text-foreground mb-2">Donnees extraites</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {typeof profile.cvData === 'object' && (
                  <>
                    <span>
                      Experiences detectees : {(profile.cvData as Record<string, unknown>).experienceCount as number ?? '-'}
                    </span>
                    <span>
                      Competences detectees : {(profile.cvData as Record<string, unknown>).skillCount as number ?? '-'}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
        >
          Je n'ai ni CV ni LinkedIn
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNext}
        >
          Continuer
          <ArrowRight className="text-sm ms-1" />
        </Button>
      </div>
    </div>
  );
}
