import { Badge } from '@/components/ui/badge';
import type { UserDeliverableStatus } from '../types/deliverables.types';

const STATUS_CONFIG: Record<
  UserDeliverableStatus,
  { label: string; variant: 'secondary' | 'primary' | 'warning' | 'info' | 'success' | 'destructive' }
> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  SUBMITTED: { label: 'Soumis', variant: 'primary' },
  EVALUATED: { label: 'Evalue', variant: 'warning' },
  REVISED: { label: 'Revise', variant: 'info' },
  VALIDATED: { label: 'Valide', variant: 'success' },
  REJECTED: { label: 'Rejete', variant: 'destructive' },
};

interface DeliverableStatusBadgeProps {
  status: UserDeliverableStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function DeliverableStatusBadge({
  status,
  size = 'sm',
}: DeliverableStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    variant: 'secondary' as const,
  };

  return (
    <Badge variant={config.variant} appearance="light" size={size}>
      {config.label}
    </Badge>
  );
}
