import { Badge } from '@/components/ui/badge';
import type { CandidateStatus } from '../types/recruitment.types';

const STATUS_CONFIG: Record<CandidateStatus, { label: string; variant: 'secondary' | 'primary' | 'success' | 'destructive' | 'info' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  PROFILING: { label: 'Profilage', variant: 'info' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary' },
  COMPLETED: { label: 'Termine', variant: 'success' },
  ABANDONED: { label: 'Abandonne', variant: 'destructive' },
};

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
}

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      {config.label}
    </Badge>
  );
}
