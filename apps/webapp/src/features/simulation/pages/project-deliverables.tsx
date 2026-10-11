import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectApi } from '../api/project.api';
import type { Deliverable } from '../types/simulation.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const STATUS_CONFIG: Record<string, { variant: 'secondary' | 'primary' | 'success' | 'destructive' }> = {
  PENDING: { variant: 'secondary' },
  IN_PROGRESS: { variant: 'primary' },
  DELIVERED: { variant: 'primary' },
  ACCEPTED: { variant: 'success' },
  REJECTED: { variant: 'destructive' },
};

export default function ProjectDeliverablesPage() {
  const tv = useTv();
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    projectApi
      .getDeliverables(id)
      .then(setDeliverables)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const accepted = deliverables.filter((d) => d.status === 'ACCEPTED').length;
  const progress = deliverables.length > 0 ? Math.round((accepted / deliverables.length) * 100) : 0;

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={t('projects.deliverablesTitle')} description={t('projects.accepted', { done: accepted, total: deliverables.length, pct: progress })} />
      </Toolbar>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : deliverables.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">{t('projects.deliverablesEmptyTitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => {
            const status = STATUS_CONFIG[d.status] ?? { variant: 'secondary' as const };
            return (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium truncate">{d.name}</h3>
                        {d.phaseOrder !== null && (
                          <span className="text-[10px] text-muted-foreground shrink-0">{t('dashboard.active.phase', { n: d.phaseOrder })}</span>
                        )}
                      </div>
                      {d.description && (
                        <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                      )}
                    </div>
                    <Badge variant={status.variant} appearance="light" size="sm">
                      {tv('deliverableStatus', d.status)}
                    </Badge>
                  </div>

                  {d.qualityScore !== null && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{t('projects.quality')}</span>
                      <span className={`font-medium ${d.qualityScore >= 70 ? 'text-success' : d.qualityScore >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {d.qualityScore}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
