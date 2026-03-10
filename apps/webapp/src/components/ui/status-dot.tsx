import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#8b8694',
  IN_PROGRESS: '#4b2f95',
  ACTIVE: '#4b2f95',
  COMPLETED: '#5da387',
  PAUSED: '#d4a04a',
  ABANDONED: '#c75a5a',
  PENDING: '#d4a04a',
  PROFILING: '#8a7daa',
  SUBMITTED: '#8a7daa',
  EVALUATED: '#4b2f95',
  VALIDATED: '#5da387',
  REJECTED: '#c75a5a',
  CLOSED: '#8b8694',
  ARCHIVED: '#8b8694',
  RESPONDED: '#5da387',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  ACTIVE: 'Active',
  COMPLETED: 'Terminee',
  PAUSED: 'En pause',
  ABANDONED: 'Abandonnee',
  PENDING: 'En attente',
  PROFILING: 'Profilage',
  SUBMITTED: 'Soumis',
  EVALUATED: 'Evalue',
  VALIDATED: 'Valide',
  REJECTED: 'Rejete',
  CLOSED: 'Cloturee',
  ARCHIVED: 'Archivee',
  RESPONDED: 'Repondu',
};

interface StatusDotProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusDot({ status, label, size = 'md', className }: StatusDotProps) {
  const color = STATUS_COLORS[status] || '#8b8694';
  const displayLabel = label || STATUS_LABELS[status] || status;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={cn('inline-flex items-center gap-1.5', textSize, 'font-medium', className)}>
      <span
        className={cn(dotSize, 'rounded-full shrink-0')}
        style={{ backgroundColor: color }}
      />
      <span style={{ color }}>{displayLabel}</span>
    </span>
  );
}
