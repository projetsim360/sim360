import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
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

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-600',
  B: 'text-blue-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  F: 'text-red-600',
};

interface PortfolioDeliverableCardProps {
  deliverable: PortfolioDeliverable;
  className?: string;
}

export function PortfolioDeliverableCard({ deliverable, className }: PortfolioDeliverableCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 min-w-0">
            <KeenIcon icon="document" style="solid" className="text-base text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <CardTitle className="truncate">{deliverable.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{deliverable.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {deliverable.grade && (
              <span className={cn('font-bold text-lg', GRADE_COLORS[deliverable.grade] ?? 'text-gray-600')}>
                {deliverable.grade}
              </span>
            )}
            {deliverable.score != null && (
              <span className="text-sm font-medium text-muted-foreground">
                {deliverable.score}/100
              </span>
            )}
            <Badge
              variant={STATUS_VARIANTS[deliverable.status] ?? 'secondary'}
              appearance="light"
              size="sm"
            >
              {STATUS_LABELS[deliverable.status] ?? deliverable.status}
            </Badge>
            <Button variant="ghost" size="sm" mode="icon">
              <KeenIcon
                icon={expanded ? 'arrow-up' : 'arrow-down'}
                style="solid"
                className="text-xs"
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && deliverable.content && (
        <CardContent className="border-t border-border">
          <div className="prose prose-sm max-w-none text-sm text-gray-700 whitespace-pre-wrap">
            {deliverable.content}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
