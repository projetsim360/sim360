import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CampaignLinkShareProps {
  slug: string;
  className?: string;
}

export function CampaignLinkShare({ slug, className }: CampaignLinkShareProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/recruitment/join/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Lien copie dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input value={publicUrl} readOnly className="flex-1 text-sm font-mono bg-accent" />
      <Button variant="outline" size="sm" onClick={handleCopy}>
        <KeenIcon
          icon={copied ? 'check' : 'copy'}
          style="duotone"
          className="size-4"
        />
        {copied ? 'Copie' : 'Copier'}
      </Button>
    </div>
  );
}
