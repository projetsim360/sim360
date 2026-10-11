import { Badge } from '@/components/ui/badge';
import type { UserDeliverableStatus } from '../types/deliverables.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const STATUS_CONFIG: Record<
  UserDeliverableStatus,
  { variant: 'secondary' | 'primary' | 'warning' | 'info' | 'success' | 'destructive' }
> = {
  DRAFT: { variant: 'secondary' },
  SUBMITTED: { variant: 'primary' },
  EVALUATED: { variant: 'warning' },
  REVISED: { variant: 'info' },
  VALIDATED: { variant: 'success' },
  REJECTED: { variant: 'destructive' },
  PENDING_APPROVAL: { variant: 'warning' },
};

interface DeliverableStatusBadgeProps {
  status: UserDeliverableStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function DeliverableStatusBadge({
  status,
  size = 'sm',
}: DeliverableStatusBadgeProps) {
  const tv = useTv();
  const t = useT();
  const config = STATUS_CONFIG[status] || {
    variant: 'secondary' as const,
  };

  return (
    <Badge variant={config.variant} appearance="light" size={size}>
      {tv('deliverableStatus', status)}
    </Badge>
  );
}
