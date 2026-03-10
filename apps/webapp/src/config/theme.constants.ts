export const STATUS_VARIANT = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  ACTIVE: 'primary',
  COMPLETED: 'success',
  PAUSED: 'warning',
  ABANDONED: 'destructive',
  CLOSED: 'secondary',
  ARCHIVED: 'secondary',
  PENDING: 'warning',
  PROFILING: 'info',
  SUBMITTED: 'info',
  EVALUATED: 'primary',
  VALIDATED: 'success',
  REJECTED: 'destructive',
  RESPONDED: 'success',
} as const;

export const KPI_LEVEL = {
  high: { bg: 'bg-success', text: 'text-success', label: 'Bon' },
  medium: { bg: 'bg-warning', text: 'text-warning', label: 'Attention' },
  low: { bg: 'bg-destructive', text: 'text-destructive', label: 'Critique' },
} as const;

export function getKpiLevel(value: number) {
  if (value > 70) return KPI_LEVEL.high;
  if (value >= 40) return KPI_LEVEL.medium;
  return KPI_LEVEL.low;
}

export const CULTURE_LABELS: Record<string, { label: string; description: string }> = {
  AGILE: {
    label: 'Agile',
    description: 'Environnement flexible, iterations rapides, retrospectives frequentes.',
  },
  STRICT: {
    label: 'Strict',
    description: 'Processus formel, documentation rigoureuse, validation hierarchique.',
  },
  COLLABORATIVE: {
    label: 'Collaboratif',
    description: 'Travail en equipe, consensus, communication ouverte.',
  },
};

export const KPI_THEME = {
  budget: {
    icon: 'dollar',
    label: 'Budget',
    bg: '',
    iconBg: 'bg-primary/10',
    text: 'text-primary',
    bar: 'bg-primary',
  },
  schedule: {
    icon: 'time',
    label: 'Delai',
    bg: '',
    iconBg: 'bg-[var(--accent-brand)]/10',
    text: 'text-[var(--accent-brand)]',
    bar: 'bg-[var(--accent-brand)]',
  },
  quality: {
    icon: 'medal-star',
    label: 'Qualite',
    bg: '',
    iconBg: 'bg-success/10',
    text: 'text-success',
    bar: 'bg-success',
  },
  teamMorale: {
    icon: 'people',
    label: 'Moral',
    bg: '',
    iconBg: 'bg-warning/10',
    text: 'text-warning',
    bar: 'bg-warning',
  },
  riskLevel: {
    icon: 'shield-cross',
    label: 'Risque',
    bg: '',
    iconBg: 'bg-destructive/10',
    text: 'text-destructive',
    bar: 'bg-destructive',
  },
} as const;

/** Deliverable status → Badge variant mapping */
export const DELIVERABLE_STATUS_VARIANT: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  SUBMITTED: 'info',
  EVALUATED: 'primary',
  VALIDATED: 'success',
  REJECTED: 'destructive',
  REVISION: 'warning',
};

/** Score / grade → semantic variant */
export function getScoreVariant(score: number): 'success' | 'primary' | 'warning' | 'destructive' {
  if (score >= 80) return 'success';
  if (score >= 60) return 'primary';
  if (score >= 40) return 'warning';
  return 'destructive';
}

/** Score / grade → semantic text class */
export function getScoreTextClass(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

/** Difficulty level → Badge variant */
export const DIFFICULTY_VARIANT: Record<string, string> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
  EXPERT: 'destructive',
};

/** Grade letter → semantic text class */
export function getGradeTextClass(grade: string): string {
  switch (grade) {
    case 'A': case 'A+': return 'text-success';
    case 'B': case 'B+': return 'text-primary';
    case 'C': case 'C+': return 'text-warning';
    case 'D': case 'D+': return 'text-[var(--accent-brand)]';
    default: return 'text-destructive';
  }
}

/** Participant connection status → semantic color */
export const CONNECTION_STATUS_COLOR: Record<string, string> = {
  idle: 'bg-muted-foreground',
  connecting: 'bg-warning',
  connected: 'bg-success',
  error: 'bg-destructive',
  closed: 'bg-muted-foreground',
};

