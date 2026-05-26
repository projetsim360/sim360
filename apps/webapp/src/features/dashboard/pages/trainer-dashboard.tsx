import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardApi } from '../api/dashboard.api';
import { KpiTile } from '../components/kpi-tile';
import type { LearnerSummary } from '../types/dashboard.types';

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'destructive'> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  ABANDONED: 'destructive',
};

const PERIOD_OPTIONS = [
  { key: '', label: 'Toute période' },
  { key: '7d', label: '7 derniers jours' },
  { key: '30d', label: '30 derniers jours' },
  { key: '90d', label: '90 derniers jours' },
];

export default function TrainerDashboardPage() {
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [scenarioSearch, setScenarioSearch] = useState('');
  const [period, setPeriod] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    const params: { scenario?: string; period?: string } = {};
    if (scenarioSearch.trim()) params.scenario = scenarioSearch.trim();
    if (period) params.period = period;

    dashboardApi
      .getTrainerDashboard(Object.keys(params).length > 0 ? params : undefined)
      .then(setLearners)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scenarioSearch, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = learners.filter((l) => {
    if (filter === 'alerts') return l.alertCount > 0;
    if (filter === 'active') return l.activeSimulations > 0;
    return true;
  });

  const totalAlerts = learners.reduce((sum, l) => sum + l.alertCount, 0);
  const activeLearners = learners.filter((l) => l.activeSimulations > 0).length;
  const cohortScore = learners.length
    ? Math.round(learners.reduce((s, l) => s + l.avgScore, 0) / learners.length)
    : null;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Suivi des apprenants' }]}
        title="Suivi des apprenants"
        subtitle={`${learners.length} apprenant${learners.length > 1 ? 's' : ''} · ${totalAlerts} alerte${totalAlerts > 1 ? 's' : ''}`}
      />

      <div className="px-6 pb-8">
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <KpiTile label="Apprenants" value={String(learners.length)} index={0} />
          <KpiTile label="Apprenants actifs" value={String(activeLearners)} index={1} />
          <KpiTile
            label="Score moyen cohorte"
            value={cohortScore != null ? String(cohortScore) : '—'}
            suffix={cohortScore != null ? '/100' : undefined}
            index={2}
          />
          <KpiTile
            label="Alertes"
            value={String(totalAlerts)}
            deltaLabel={totalAlerts > 0 ? 'à surveiller' : 'aucune'}
            tone={totalAlerts > 0 ? 'down' : 'neutral'}
            index={3}
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'active', label: 'Actifs' },
              { key: 'alerts', label: 'Alertes' },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="hidden h-5 w-px bg-border sm:block" />

          <Input
            type="text"
            value={scenarioSearch}
            onChange={(e) => setScenarioSearch(e.target.value)}
            placeholder="Filtrer par scénario..."
            className="w-full sm:w-48"
          />

          <Select value={period || '__all__'} onValueChange={(v) => setPeriod(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Toute période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.key} value={p.key || '__all__'}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-[16px] font-bold text-[var(--brand-700)]">
              Apprenants ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--accent-500)]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--neutral-400)]">Aucun apprenant</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left text-[var(--neutral-500)]">Apprenant</TableHead>
                      <TableHead className="text-center text-[var(--neutral-500)]">Simulations</TableHead>
                      <TableHead className="text-center text-[var(--neutral-500)]">Terminées</TableHead>
                      <TableHead className="text-center text-[var(--neutral-500)]">Score moyen</TableHead>
                      <TableHead className="text-center text-[var(--neutral-500)]">Alertes</TableHead>
                      <TableHead className="text-left text-[var(--neutral-500)]">Dernière simulation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={l.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-100)] text-[10px] font-bold text-[var(--brand-700)]">
                              {l.firstName.charAt(0)}
                              {l.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--brand-700)]">
                                {l.firstName} {l.lastName}
                              </p>
                              <p className="text-[10px] text-[var(--neutral-400)]">{l.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{l.totalSimulations}</TableCell>
                        <TableCell className="text-center">{l.completedSimulations}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${
                              l.avgScore >= 70
                                ? 'text-[var(--success-700)]'
                                : l.avgScore >= 40
                                  ? 'text-[var(--warning-700)]'
                                  : l.avgScore > 0
                                    ? 'text-[var(--error-700)]'
                                    : 'text-[var(--neutral-400)]'
                            }`}
                          >
                            {l.avgScore > 0 ? `${l.avgScore}%` : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {l.alertCount > 0 ? (
                            <Badge variant="destructive" appearance="light" size="xs">
                              {l.alertCount}
                            </Badge>
                          ) : (
                            <span className="text-[var(--neutral-400)]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {l.lastSimulation ? (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={STATUS_VARIANT[l.lastSimulation.status] ?? 'secondary'}
                                appearance="light"
                                size="xs"
                              >
                                {l.lastSimulation.status}
                              </Badge>
                              <span className="max-w-[120px] truncate text-[var(--neutral-500)]">
                                {l.lastSimulation.scenario}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[var(--neutral-400)]">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
