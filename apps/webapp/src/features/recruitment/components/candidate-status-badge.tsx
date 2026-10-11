import { Badge } from '@/components/ui/badge';
import type { CandidateStatus } from '../types/recruitment.types';
import { useTv } from '@/i18n/app/use-t';

const STATUS_CONFIG: Record<CandidateStatus, { label: string; variant: 'secondary' | 'primary' | 'success' | 'destructive' | 'info' }> = {
  PENDING: { label: 'PENDING', variant: 'secondary' },
  PROFILING: { label: 'PROFILING', variant: 'info' },
  IN_PROGRESS: { label: 'IN_PROGRESS', variant: 'primary' },
  COMPLETED: { label: 'COMPLETED', variant: 'success' },
  ABANDONED: { label: 'ABANDONED', variant: 'destructive' },
};

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
}

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
  const tv = useTv();
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} appearance="light" size="sm">
      {tv('recruit.candidateStatus', config.label)}
    </Badge>
  );
}
