import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectApi } from '../api/project.api';
import type { Deliverable } from '../types/simulation.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'primary' | 'success' | 'destructive' }> = {
  PENDING: { label: 'En attente', variant: 'secondary' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary' },
  DELIVERED: { label: 'Livre', variant: 'primary' },
  ACCEPTED: { label: 'Accepte', variant: 'success' },
  REJECTED: { label: 'Rejete', variant: 'destructive' },
};

export default function ProjectDeliverablesPage() {
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
        <ToolbarHeading title="Livrables du projet" description={`${accepted}/${deliverables.length} acceptes (${progress}%)`} />
      </Toolbar>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : deliverables.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun livrable</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => {
            const status = STATUS_CONFIG[d.status] ?? { label: d.status, variant: 'secondary' as const };
            return (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium truncate">{d.name}</h3>
                        {d.phaseOrder !== null && (
                          <span className="text-[10px] text-muted-foreground shrink-0">Phase {d.phaseOrder}</span>
                        )}
                      </div>
                      {d.description && (
                        <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                      )}
                    </div>
                    <Badge variant={status.variant} appearance="light" size="sm">
                      {status.label}
                    </Badge>
                  </div>

                  {d.qualityScore !== null && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Qualite :</span>
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
