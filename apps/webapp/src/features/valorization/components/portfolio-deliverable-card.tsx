import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { getGradeTextClass } from '@/config/theme.constants';
import type { PortfolioDeliverable } from '../types/valorization.types';

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Termine',
  IN_PROGRESS: 'En cours',
  PENDING: 'En attente',
  REJECTED: 'Rejete',
};

const STATUS_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'destructive'> = {
  COMPLETED: 'success',
  IN_PROGRESS: 'info',
  PENDING: 'warning',
  REJECTED: 'destructive',
};


interface PortfolioDeliverableCardProps {
  deliverable: PortfolioDeliverable;
  className?: string;
}

export function PortfolioDeliverableCard({ deliverable, className }: PortfolioDeliverableCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="cursor-pointer" role="button" tabIndex={0} onClick={() => setExpanded(!expanded)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <KeenIcon icon="document" style="duotone" className="text-base text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <CardTitle className="truncate">{deliverable.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{deliverable.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(deliverable.evaluation?.grade ?? deliverable.grade) && (
              <span className={cn('font-bold text-lg', getGradeTextClass(deliverable.evaluation?.grade ?? deliverable.grade ?? ''))}>
                {deliverable.evaluation?.grade ?? deliverable.grade}
              </span>
            )}
            {(deliverable.evaluation?.score ?? deliverable.score) != null && (
              <span className="text-sm font-medium text-muted-foreground">
                {deliverable.evaluation?.score ?? deliverable.score}/100
              </span>
            )}
            <Badge
              variant={STATUS_VARIANTS[deliverable.status] ?? 'secondary'}
              appearance="light"
              size="sm"
            >
              {STATUS_LABELS[deliverable.status] ?? deliverable.status}
            </Badge>
            <Button variant="ghost" size="sm" mode="icon" aria-label="Voir les details">
              <KeenIcon
                icon={expanded ? 'arrow-up' : 'arrow-down'}
                style="duotone"
                className="text-xs"
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && deliverable.content && (
        <CardContent className="border-t border-border">
          <div className="prose prose-sm max-w-none text-sm text-foreground whitespace-pre-wrap">
            {deliverable.content}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
