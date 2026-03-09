import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import type { NextStep } from '../types/dashboard.types';

interface NextStepCardProps {
  data: NextStep | null;
}

const STEP_CONFIG: Record<
  string,
  { icon: string; getTitle: (count: number) => string; color: string }
> = {
  pending_decisions: {
    icon: 'question-2',
    getTitle: (n) => `Vous avez ${n} decision${n > 1 ? 's' : ''} en attente`,
    color: 'text-primary',
  },
  pending_events: {
    icon: 'flash',
    getTitle: () => 'Un evenement necessite votre attention',
    color: 'text-warning',
  },
  pending_meetings: {
    icon: 'message-text',
    getTitle: () => 'Une reunion est planifiee',
    color: 'text-info',
  },
  pending_deliverables: {
    icon: 'document',
    getTitle: () => 'Un livrable attend d\'etre soumis',
    color: 'text-primary',
  },
  pending_emails: {
    icon: 'sms',
    getTitle: (n) => `Vous avez ${n} email${n > 1 ? 's' : ''} non lu${n > 1 ? 's' : ''}`,
    color: 'text-info',
  },
  debriefing_available: {
    icon: 'teacher',
    getTitle: () => 'Consultez votre debriefing',
    color: 'text-success',
  },
  all_clear: {
    icon: 'check-circle',
    getTitle: () => 'Tout est a jour !',
    color: 'text-success',
  },
};

export function NextStepCard({ data }: NextStepCardProps) {
  const config = data ? STEP_CONFIG[data.type] : STEP_CONFIG['all_clear'];
  const isAllClear = !data || data.type === 'all_clear';

  return (
    <Card className="border-l-4 border-l-primary bg-primary/[0.02]">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 shrink-0">
          <KeenIcon
            icon={config?.icon ?? 'check-circle'}
            style="duotone"
            className={`text-2xl ${config?.color ?? 'text-primary'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
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
              <KeenIcon icon="right" style="solid" className="text-xs ms-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
