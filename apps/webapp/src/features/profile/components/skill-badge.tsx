import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SkillLevel } from '../types/profile.types';
import { SKILL_LEVEL_LABELS } from '../types/profile.types';

interface SkillBadgeProps {
  name: string;
  level: SkillLevel;
  className?: string;
}

const LEVEL_VARIANT: Record<SkillLevel, 'secondary' | 'info' | 'warning' | 'success'> = {
  none: 'secondary',
  basic: 'info',
  intermediate: 'warning',
  advanced: 'success',
};

export function SkillBadge({ name, level, className }: SkillBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-foreground">{name}</span>
      <Badge variant={LEVEL_VARIANT[level]} size="sm" appearance="light">
        {SKILL_LEVEL_LABELS[level]}
      </Badge>
    </div>
  );
}
