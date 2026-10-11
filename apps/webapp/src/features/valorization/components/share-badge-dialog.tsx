import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useShareBadge } from '../api/valorization.api';
import { useT } from '@/i18n/app/use-t';

interface ShareBadgeDialogProps {
  badgeId: string;
  shareToken?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareBadgeDialog({
  badgeId,
  shareToken,
  open,
  onOpenChange,
}: ShareBadgeDialogProps) {
  const t = useT();
  const shareMutation = useShareBadge();
  const [currentShareUrl, setCurrentShareUrl] = useState<string | null>(null);

  const verifyUrl = shareToken
    ? `${window.location.origin}/badges/${badgeId}/verify`
    : currentShareUrl;

  const handleGenerateLink = async () => {
    try {
      const result = await shareMutation.mutateAsync(badgeId);
      setCurrentShareUrl(result.shareUrl || `${window.location.origin}/badges/${badgeId}/verify`);
      toast.success(t('valo.share.generated'));
    } catch {
      toast.error(t('valo.share.error'));
    }
  };

  const handleCopyLink = () => {
    if (verifyUrl) {
      navigator.clipboard.writeText(verifyUrl);
      toast.success(t('valo.copied'));
    }
  };

  const handleShareLinkedIn = () => {
    if (verifyUrl) {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('valo.share.title')}</DialogTitle>
          <DialogDescription>
            {t('valo.share.desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!verifyUrl ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateLink}
              disabled={shareMutation.isPending}
              className="w-full"
            >
              <KeenIcon icon="share" style="duotone" className="text-sm mr-2" />
              {shareMutation.isPending ? t('valo.share.generating') : t('valo.share.generate')}
            </Button>
          ) : (
            <div className="space-y-3">
              {/* URL display */}
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {verifyUrl}
                </span>
                <Button variant="ghost" size="sm" mode="icon" aria-label={t('valo.copyLink')} onClick={handleCopyLink}>
                  <KeenIcon icon="copy" style="duotone" className="text-sm" />
                </Button>
              </div>

              {/* Share actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  <KeenIcon icon="copy" style="duotone" className="text-sm mr-2" />
                  {t('valo.copyLink')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={handleShareLinkedIn}
                >
                  <KeenIcon icon="linkedin" style="duotone" className="text-sm mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
