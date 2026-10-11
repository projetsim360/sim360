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
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeliverables } from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import type { UserDeliverableStatus, UserDeliverable } from '../types/deliverables.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enCA, fr } from 'date-fns/locale';
import { useTv } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

type DelegationFilter = 'ALL' | 'SELF' | 'DELEGATED' | 'APPROVAL';

const STATUS_OPTIONS: UserDeliverableStatus[] = ['DRAFT', 'SUBMITTED', 'EVALUATED', 'REVISED', 'VALIDATED', 'REJECTED', 'PENDING_APPROVAL'];

export default function DeliverablesListPage() {
  const tv = useTv();
  const { locale } = useAppLocale();
  const dfLocale = locale === 'en' ? enCA : fr;
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [delegationFilter, setDelegationFilter] = useState<DelegationFilter>('ALL');

  const { data: deliverables, isLoading, error } = useDeliverables(id || '');

  const availablePhases = useMemo(() => {
    if (!deliverables) return [];
    return [...new Set(deliverables.map((d) => d.phaseOrder))].sort(
      (a, b) => a - b,
    );
  }, [deliverables]);

  const filtered = useMemo(() => {
    if (!deliverables) return [];
    return deliverables.filter((d: UserDeliverable) => {
      if (filterPhase && d.phaseOrder !== Number(filterPhase)) return false;
      if (filterStatus && d.status !== filterStatus) return false;
      if (delegationFilter === 'SELF' && d.delegationType === 'DELEGATED') return false;
      if (delegationFilter === 'DELEGATED' && d.delegationType !== 'DELEGATED') return false;
      if (delegationFilter === 'APPROVAL' && d.status !== 'PENDING_APPROVAL') return false;
      return true;
    });
  }, [deliverables, filterPhase, filterStatus, delegationFilter]);

  const validatedCount = deliverables?.filter(
    (d) => d.status === 'VALIDATED',
  ).length ?? 0;
  const totalCount = deliverables?.length ?? 0;

  function handleClick(deliverable: { id: string; status: UserDeliverableStatus }) {
    if (
      deliverable.status === 'EVALUATED' ||
      deliverable.status === 'VALIDATED' ||
      deliverable.status === 'REJECTED' ||
      deliverable.status === 'PENDING_APPROVAL'
    ) {
      navigate(`/simulations/${id}/deliverables/${deliverable.id}/evaluation`);
    } else {
      navigate(`/simulations/${id}/deliverables/${deliverable.id}/edit`);
    }
  }

  function getActionLabel(status: UserDeliverableStatus) {
    if (status === 'DRAFT' || status === 'REVISED') return t('deliverables.action.edit');
    if (status === 'SUBMITTED') return t('lists.waiting');
    if (status === 'PENDING_APPROVAL') return t('deliverables.action.approval');
    return t('lists.view');
  }

  if (!id) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('deliverables.title')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('meetings.noSimulation')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={t('deliverables.title')} />
        <ToolbarActions>
          {totalCount > 0 && (
            <Badge variant="success" appearance="light" size="md">
              {t('deliverables.validated', { done: validatedCount, total: totalCount })}
            </Badge>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

        {/* Delegation filter tabs */}
        {deliverables && deliverables.length > 0 && (
          <div className="flex items-center gap-1 mb-4 border-b border-border">
            {(
              [
                { key: 'ALL', label: 'deliverables.tab.all' },
                { key: 'SELF', label: 'deliverables.title' },
                { key: 'DELEGATED', label: 'deliverables.tab.delegated' },
                { key: 'APPROVAL', label: 'deliverableStatus.PENDING_APPROVAL' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={cn(
                  'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  delegationFilter === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
                onClick={() => setDelegationFilter(tab.key)}
              >
                {t(tab.label as AppMessageKey)}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        {deliverables && deliverables.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {availablePhases.length > 1 && (
              <Select
                value={filterPhase || 'ALL'}
                onValueChange={(v) => setFilterPhase(v === 'ALL' ? '' : v)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('meetings.allPhases')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('meetings.allPhases')}</SelectItem>
                  {availablePhases.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {t('dashboard.active.phase', { n: p })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={filterStatus || 'ALL'}
              onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('meetings.allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('meetings.allStatuses')}</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {tv('deliverableStatus', opt)}
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
                {t('meetings.reset')}
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                {(error as Error).message || t('common.loadError')}
              </p>
            </CardContent>
          </Card>
        ) : !deliverables || deliverables.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="document"
                title={t('projects.deliverablesEmptyTitle')}
                description={t('deliverables.emptyText')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((deliverable) => (
              <Card
                key={deliverable.id}
                className="cursor-pointer shadow-none hover:shadow-sm transition-shadow duration-200"
                onClick={() => handleClick(deliverable)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {deliverable.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {tv('deliverableType', deliverable.type)}
                      </p>
                    </div>
                    <DeliverableStatusBadge status={deliverable.status} />
                  </div>

                  {/* Delegation info */}
                  {deliverable.delegationType === 'DELEGATED' &&
                    deliverable.assignedToMember && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <KeenIcon
                          icon="people"
                          style="duotone"
                          className="size-3.5 text-muted-foreground"
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('deliverables.delegatedTo')}{' '}
                          <span className="font-medium text-foreground">
                            {deliverable.assignedToMember.name}
                          </span>{' '}
                          ({deliverable.assignedToMember.role})
                        </span>
                      </div>
                    )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{t('dashboard.active.phase', { n: deliverable.phaseOrder })}</span>
                      {deliverable.evaluations &&
                        deliverable.evaluations.length > 0 && (
                          <span className="font-medium text-foreground">
                            {t('deliverables.score')}{' '}
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
                            { locale: dfLocale },
                          )}
                        </span>
                      )}
                      <span className="text-primary font-medium inline-flex items-center gap-1">
                        {getActionLabel(deliverable.status)}
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
                        {t('deliverables.revision', { n: deliverable.revisionNumber, max: deliverable.maxRevisions })}
                      </p>
                    </div>
                  )}

                  {/* Assign to expert button */}
                  {(deliverable.status === 'DRAFT' || deliverable.status === 'REVISED') &&
                    deliverable.delegationType !== 'DELEGATED' && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/simulations/${id}/deliverables/${deliverable.id}?action=assign`);
                          }}
                        >
                          <KeenIcon icon="people" style="duotone" className="text-xs leading-none" />
                          {t('deliverables.assignExpert')}
                        </Button>
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
