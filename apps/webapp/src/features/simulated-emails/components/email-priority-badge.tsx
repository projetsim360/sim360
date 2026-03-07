import { Badge } from '@/components/ui/badge';
import type { EmailPriority } from '../types/simulated-email.types';

const PRIORITY_CONFIG: Record<
  EmailPriority,
  { label: string; variant: 'destructive' | 'warning' | 'secondary' | 'primary' }
> = {
  URGENT: { label: 'Urgent', variant: 'destructive' },
  HIGH: { label: 'Haute', variant: 'warning' },
  NORMAL: { label: 'Normale', variant: 'secondary' },
  LOW: { label: 'Basse', variant: 'primary' },
};

interface EmailPriorityBadgeProps {
  priority: EmailPriority;
  className?: string;
}

export function EmailPriorityBadge({ priority, className }: EmailPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge variant={config.variant} appearance="light" size="sm" className={className}>
      {config.label}
    </Badge>
  );
}
