import { Badge } from '@/components/ui/badge';
import type { CampaignStatus } from '../types/recruitment.types';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; variant: 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  ACTIVE: { label: 'Active', variant: 'success' },
  CLOSED: { label: 'Cloturee', variant: 'destructive' },
  ARCHIVED: { label: 'Archivee', variant: 'warning' },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      {config.label}
    </Badge>
  );
}
