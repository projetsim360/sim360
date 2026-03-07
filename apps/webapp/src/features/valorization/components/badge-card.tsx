import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { CompetencyBadge } from '../types/valorization.types';

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HARD: 'bg-orange-500',
  EXPERT: 'bg-red-500',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Facile',
  MEDIUM: 'Intermediaire',
  HARD: 'Difficile',
  EXPERT: 'Expert',
};

interface BadgeCardProps {
  badge: CompetencyBadge;
  className?: string;
}

export function BadgeCard({ badge, className }: BadgeCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[badge.difficulty] ?? 'bg-gray-400';

  return (
    <Link to={`/profile/badges/${badge.id}`}>
      <Card
        className={cn(
          'overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
          className,
        )}
      >
        {/* Gradient top bar */}
        <div className={cn('h-1.5 w-full', difficultyColor)} />

        <CardContent className="p-5 space-y-3">
          {/* Score */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{badge.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {badge.scenarioTitle}
              </p>
            </div>
            <div className="flex items-center justify-center shrink-0 size-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {badge.globalScore}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center flex-wrap gap-1.5">
            <Badge variant="secondary" size="sm">
              <KeenIcon icon="category" style="solid" className="text-xs mr-1" />
              {badge.sector}
            </Badge>
            <Badge
              variant="secondary"
              size="sm"
            >
              {DIFFICULTY_LABELS[badge.difficulty] ?? badge.difficulty}
            </Badge>
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            {new Date(badge.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
