import { Badge } from '@/components/ui/badge';
import type { CampaignStatus } from '../types/recruitment.types';
import { useTv } from '@/i18n/app/use-t';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; variant: 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  DRAFT: { label: 'DRAFT', variant: 'secondary' },
  ACTIVE: { label: 'ACTIVE', variant: 'success' },
  CLOSED: { label: 'CLOSED', variant: 'destructive' },
  ARCHIVED: { label: 'ARCHIVED', variant: 'warning' },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const tv = useTv();
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      {tv('recruit.campaignStatus', config.label)}
    </Badge>
  );
}
