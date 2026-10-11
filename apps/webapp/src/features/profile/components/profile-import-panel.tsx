import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useUploadCv, useImportLinkedin } from '../api/profile.api';
import type { UserProfile } from '../types/profile.types';
import { useT } from '@/i18n/app/use-t';

interface ProfileImportPanelProps {
  profile?: UserProfile;
}

export function ProfileImportPanel({ profile }: ProfileImportPanelProps) {
  const t = useT();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLinkedinDialog, setShowLinkedinDialog] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinError, setLinkedinError] = useState('');
  const uploadCv = useUploadCv();
  const importLinkedin = useImportLinkedin();

  const hasCv = !!profile?.cvFileUrl || !!profile?.cvData;
  const hasLinkedin = !!profile?.linkedinData;

  const handleFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error(t('onboarding.import.pdfOnly'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('onboarding.import.tooBig'));
        return;
      }
      const fd = new FormData();
      fd.append('cv', file);
      uploadCv.mutate(fd, {
        onSuccess: (data) => {
          const skillCount =
            data && typeof data === 'object' && 'cvData' in data
              ? ((data as UserProfile).cvData as Record<string, unknown>)?.skillCount
              : undefined;
          toast.success(
            skillCount
              ? t('onboarding.import.cvDoneSkills', { count: Number(skillCount) })
              : t('onboarding.import.cvDone'),
          );
        },
        onError: () => toast.error(t('onboarding.import.cvError')),
      });
    },
    [uploadCv, t],
  );

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setLinkedinError(t('onboarding.import.linkedinRequired'));
      return false;
    }
    if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(url.trim())) {
      setLinkedinError(t('onboarding.import.linkedinInvalid'));
      return false;
    }
    setLinkedinError('');
    return true;
  };

  const submitLinkedin = () => {
    if (!validateUrl(linkedinUrl)) return;
    importLinkedin.mutate(
      { linkedinUrl: linkedinUrl.trim() },
      {
        onSuccess: () => {
          toast.success(t('onboarding.import.linkedinDone'));
          setShowLinkedinDialog(false);
          setLinkedinUrl('');
          setLinkedinError('');
        },
        onError: () => toast.error(t('onboarding.import.linkedinError')),
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border border-[var(--brand-100)] bg-[var(--brand-50)] p-4 sm:flex-row sm:items-center',
          isDragOver && 'border-[var(--accent-500)] ring-2 ring-[var(--accent-500)]/20',
          uploadCv.isPending && 'opacity-70',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files);
        }}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--brand-100)] bg-white">
          <KeenIcon icon="file-up" style="duotone" className="text-lg text-[var(--brand-600)]" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[var(--brand-700)]">{t('onboarding.import.title')}</span>
            <Badge variant="secondary" size="xs">{t('onboarding.import.optional')}</Badge>
            {(hasCv || hasLinkedin) && (
              <Badge variant="success" appearance="light" size="xs">{t('onboarding.import.imported')}</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uploadCv.isPending
              ? t('onboarding.import.analyzing')
              : t('onboarding.import.text')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowLinkedinDialog(true)}>
            <KeenIcon icon="linkedin" style="duotone" className="text-sm text-[#0077B5]" />
            LinkedIn
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadCv.isPending}
            onClick={() => document.getElementById('cv-file-input')?.click()}
          >
            <KeenIcon icon="file-up" style="duotone" className="text-sm" />
            {t('onboarding.import.cvButton')}
          </Button>
        </div>
        <input
          id="cv-file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          aria-label={t('onboarding.import.cvAria')}
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      <Dialog open={showLinkedinDialog} onOpenChange={setShowLinkedinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeenIcon icon="linkedin" style="duotone" className="text-xl text-[#0077B5]" />
              {t('onboarding.import.linkedinTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t('onboarding.import.linkedinText')}
            </p>
            <div className="space-y-2">
              <Label htmlFor="linkedin-url">{t('onboarding.import.linkedinUrl')}</Label>
              <Input
                id="linkedin-url"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (linkedinError) setLinkedinError('');
                }}
                placeholder={t('onboarding.import.linkedinPlaceholder')}
                aria-invalid={!!linkedinError}
              />
              {linkedinError && <p className="text-xs text-destructive">{linkedinError}</p>}
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
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={submitLinkedin} disabled={importLinkedin.isPending}>
              {importLinkedin.isPending ? t('onboarding.import.importing') : t('onboarding.import.import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
