import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { NextStep } from '../types/dashboard.types';

interface NextStepCardProps {
  data: NextStep | null;
}

const STEP_CONFIG: Record<
  string,
  { icon: string; getTitle: (count: number) => string; color: string; bgIcon: string }
> = {
  pending_decisions: {
    icon: 'question-2',
    getTitle: (n) => `Vous avez ${n} decision${n > 1 ? 's' : ''} en attente`,
    color: 'text-[#4b2f95] dark:text-brand-400',
    bgIcon: 'bg-primary/15 dark:bg-primary/20',
  },
  pending_events: {
    icon: 'flash',
    getTitle: () => 'Un evenement necessite votre attention',
    color: 'text-warning',
    bgIcon: 'bg-warning/15 dark:bg-warning/20',
  },
  pending_meetings: {
    icon: 'message-text',
    getTitle: () => 'Une reunion est planifiee',
    color: 'text-info',
    bgIcon: 'bg-info/15 dark:bg-info/20',
  },
  pending_deliverables: {
    icon: 'document',
    getTitle: () => 'Un livrable attend d\'etre soumis',
    color: 'text-[#4b2f95] dark:text-brand-400',
    bgIcon: 'bg-primary/15 dark:bg-primary/20',
  },
  pending_emails: {
    icon: 'sms',
    getTitle: (n) => `Vous avez ${n} email${n > 1 ? 's' : ''} non lu${n > 1 ? 's' : ''}`,
    color: 'text-info',
    bgIcon: 'bg-info/15 dark:bg-info/20',
  },
  debriefing_available: {
    icon: 'teacher',
    getTitle: () => 'Consultez votre debriefing',
    color: 'text-success',
    bgIcon: 'bg-success/15 dark:bg-success/20',
  },
  all_clear: {
    icon: 'check-circle',
    getTitle: () => 'Tout est a jour !',
    color: 'text-success',
    bgIcon: 'bg-success/15 dark:bg-success/20',
  },
};

export function NextStepCard({ data }: NextStepCardProps) {
  const config = data ? STEP_CONFIG[data.type] : STEP_CONFIG['all_clear'];
  const isAllClear = !data || data.type === 'all_clear';

  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="flex items-center gap-4 py-4 px-5">
        <div
          className={cn(
            'flex items-center justify-center size-11 rounded-xl shrink-0',
            config?.bgIcon,
          )}
        >
          <KeenIcon
            icon={config?.icon ?? 'check-circle'}
            style="duotone"
            className={cn('text-xl', config?.color ?? 'text-primary')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
            {isAllClear ? 'Statut' : 'Prochaine etape'}
          </p>
          <h3 className={cn('text-sm font-bold', config?.color ?? 'text-foreground')}>
            {config?.getTitle(data?.count ?? 0) ?? 'Prochaine etape'}
          </h3>
          {data?.simulationName && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {data.simulationName}
            </p>
          )}
        </div>
        {!isAllClear && data && (
          <Button variant="primary" size="sm" asChild className="shrink-0">
            <Link to={data.link}>
              Continuer
              <KeenIcon icon="right" style="duotone" className="text-xs ms-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
