import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useDeliverables } from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import type { UserDeliverableStatus } from '../types/deliverables.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_LABELS: Record<string, string> = {
  CHARTER: 'Charte projet',
  WBS: 'WBS',
  SCHEDULE: 'Planning',
  BUDGET: 'Budget',
  RISK_REGISTER: 'Registre des risques',
  STAKEHOLDER_REGISTER: 'Registre parties prenantes',
  COMMUNICATION_PLAN: 'Plan de communication',
  STATUS_REPORT: 'Rapport d\'avancement',
  MEETING_MINUTES: 'Compte rendu reunion',
  LESSONS_LEARNED: 'Lecons apprises',
  CLOSURE_REPORT: 'Rapport de cloture',
  CUSTOM: 'Personnalise',
};

const STATUS_OPTIONS: { value: UserDeliverableStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SUBMITTED', label: 'Soumis' },
  { value: 'EVALUATED', label: 'Evalue' },
  { value: 'REVISED', label: 'Revise' },
  { value: 'VALIDATED', label: 'Valide' },
  { value: 'REJECTED', label: 'Rejete' },
];

export default function DeliverablesListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: deliverables, isLoading, error } = useDeliverables(id || '');

  const availablePhases = useMemo(() => {
    if (!deliverables) return [];
    return [...new Set(deliverables.map((d) => d.phaseOrder))].sort(
      (a, b) => a - b,
    );
  }, [deliverables]);

  const filtered = useMemo(() => {
    if (!deliverables) return [];
    return deliverables.filter((d) => {
      if (filterPhase && d.phaseOrder !== Number(filterPhase)) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      return true;
    });
  }, [deliverables, filterPhase, filterStatus]);

  const validatedCount = deliverables?.filter(
    (d) => d.status === 'VALIDATED',
  ).length ?? 0;
  const totalCount = deliverables?.length ?? 0;

  function handleClick(deliverable: { id: string; status: UserDeliverableStatus }) {
    if (
      deliverable.status === 'EVALUATED' ||
      deliverable.status === 'VALIDATED' ||
      deliverable.status === 'REJECTED'
    ) {
      navigate(`/simulations/${id}/deliverables/${deliverable.id}/evaluation`);
    } else {
      navigate(`/simulations/${id}/deliverables/${deliverable.id}/edit`);
    }
  }

  if (!id) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Mes livrables" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune simulation selectionnee.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Mes livrables" />
        <ToolbarActions>
          {totalCount > 0 && (
            <Badge variant="success" appearance="light" size="md">
              {validatedCount}/{totalCount} valides
            </Badge>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

        {/* Filters */}
        {deliverables && deliverables.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {availablePhases.length > 1 && (
              <Select
                value={filterPhase || 'ALL'}
                onValueChange={(v) => setFilterPhase(v === 'ALL' ? '' : v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes les phases</SelectItem>
                  {availablePhases.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      Phase {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={filterStatus || 'ALL'}
              onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterPhase || filterStatus) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterPhase('');
                  setFilterStatus('');
                }}
              >
                Reinitialiser
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                {(error as Error).message || 'Erreur lors du chargement.'}
              </p>
            </CardContent>
          </Card>
        ) : !deliverables || deliverables.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <KeenIcon
                icon="document"
                style="duotone"
                className="size-12 text-muted-foreground/30"
              />
              <p className="text-sm text-muted-foreground">
                Aucun livrable pour cette simulation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((deliverable) => (
              <Card
                key={deliverable.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleClick(deliverable)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {deliverable.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {TYPE_LABELS[deliverable.type] ?? deliverable.type}
                      </p>
                    </div>
                    <DeliverableStatusBadge status={deliverable.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>Phase {deliverable.phaseOrder}</span>
                      {deliverable.evaluations &&
                        deliverable.evaluations.length > 0 && (
                          <span className="font-medium text-foreground">
                            Score:{' '}
                            {deliverable.evaluations[
                              deliverable.evaluations.length - 1
                            ].score}
                            /100
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      {deliverable.submittedAt && (
                        <span>
                          {format(
                            new Date(deliverable.submittedAt),
                            'd MMM yyyy',
                            { locale: fr },
                          )}
                        </span>
                      )}
                      <span className="text-primary font-medium inline-flex items-center gap-1">
                        {deliverable.status === 'DRAFT' ||
                        deliverable.status === 'REVISED'
                          ? 'Editer'
                          : deliverable.status === 'SUBMITTED'
                            ? 'En attente'
                            : 'Voir'}
                        <KeenIcon
                          icon="arrow-right"
                          style="duotone"
                          className="size-3"
                        />
                      </span>
                    </div>
                  </div>

                  {/* Revision info */}
                  {deliverable.revisionNumber > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[10px] text-muted-foreground">
                        Revision {deliverable.revisionNumber}/
                        {deliverable.maxRevisions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
