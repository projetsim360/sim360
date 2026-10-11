import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, Decision } from '../types/simulation.types';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

export default function DecisionsListPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    simulationApi
      .getSimulation(id)
      .then(setSim)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const decisions = sim?.decisions ?? [];
  const pending = decisions.filter((d) => d.selectedOption === null);
  const resolved = decisions.filter((d) => d.selectedOption !== null);

  if (loading) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <Skeleton className="h-7 w-48" />
          </ToolbarHeading>
        </Toolbar>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fixed">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">{t('dashboard.priority.decisions')}</h1>
          </ToolbarHeading>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">{t('dashboard.priority.decisions')}</h1>
          <p className="text-sm text-gray-700">
            {t('lists.decisions.summary', { total: decisions.length, pending: pending.length, resolved: resolved.length })}
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {decisions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="question-2"
              title={t('lists.decisions.emptyTitle')}
              description={t('lists.decisions.emptyText')}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-warning flex items-center gap-2">
                <KeenIcon icon="time" style="duotone" className="text-sm" />
                {t('lists.pending', { count: pending.length })}
              </h2>
              {pending.map((dec) => (
                <DecisionCard key={dec.id} decision={dec} simId={id!} />
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-success flex items-center gap-2">
                <KeenIcon icon="check-circle" style="duotone" className="text-sm" />
                {t('lists.decisions.resolved', { count: resolved.length })}
              </h2>
              {resolved.map((dec) => (
                <DecisionCard key={dec.id} decision={dec} simId={id!} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DecisionCard({ decision, simId }: { decision: Decision; simId: string }) {
  const { intlLocale } = useAppLocale();
  const t = useT();
  const isResolved = decision.selectedOption !== null;

  return (
    <Card className={isResolved ? 'opacity-80' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <KeenIcon icon="question-2" style="duotone" className="text-sm text-primary shrink-0" />
              <h3 className="text-sm font-medium truncate">{decision.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {decision.context}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" size="sm">
                {t('dashboard.active.phase', { n: decision.phaseOrder + 1 })}
              </Badge>
              <Badge variant={isResolved ? 'success' : 'warning'} appearance="light" size="sm">
                {isResolved ? t('lists.decisions.resolvedOne') : t('lists.waiting')}
              </Badge>
              {decision.options.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t('lists.decisions.options', { count: decision.options.length })}
                </span>
              )}
              {isResolved && decision.decidedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(decision.decidedAt).toLocaleDateString(intlLocale)}
                </span>
              )}
            </div>
          </div>
          <Button variant={isResolved ? 'outline' : 'primary'} size="sm" asChild>
            <Link to={`/simulations/${simId}/decisions/${decision.id}`}>
              {isResolved ? t('lists.view') : t('lists.decisions.decide')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
