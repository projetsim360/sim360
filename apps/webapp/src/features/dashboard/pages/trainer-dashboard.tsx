import { useState, useEffect, useCallback } from 'react';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardApi } from '../api/dashboard.api';
import type { LearnerSummary } from '../types/dashboard.types';

const STATUS_VARIANT: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  ABANDONED: 'destructive',
};

const PERIOD_OPTIONS = [
  { key: '', label: 'Toute periode' },
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

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Vue formateur" />
      </Toolbar>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Apprenants" value={String(learners.length)} color="text-primary" />
        <StatCard
          label="Simulations actives"
          value={String(learners.reduce((s, l) => s + l.activeSimulations, 0))}
          color="text-success"
        />
        <StatCard
          label="Score moyen"
          value={
            learners.length > 0
              ? `${Math.round(learners.reduce((s, l) => s + l.avgScore, 0) / learners.length)}%`
              : '-'
          }
          color="text-foreground"
        />
        <StatCard
          label="Alertes"
          value={String(totalAlerts)}
          color={totalAlerts > 0 ? 'text-destructive' : 'text-success'}
        />
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Status filter chips */}
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

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Scenario search */}
        <Input
          type="text"
          value={scenarioSearch}
          onChange={(e) => setScenarioSearch(e.target.value)}
          placeholder="Filtrer par scenario..."
          className="w-48"
        />

        {/* Period filter */}
        <Select value={period || '__all__'} onValueChange={(v) => setPeriod(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Toute periode" />
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

      {/* Learner table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Apprenants ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucun apprenant</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Apprenant</TableHead>
                    <TableHead className="text-center">Simulations</TableHead>
                    <TableHead className="text-center">Terminees</TableHead>
                    <TableHead className="text-center">Score moyen</TableHead>
                    <TableHead className="text-center">Alertes</TableHead>
                    <TableHead className="text-left">Derniere simulation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                            {l.firstName.charAt(0)}{l.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{l.firstName} {l.lastName}</p>
                            <p className="text-[10px] text-muted-foreground">{l.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{l.totalSimulations}</TableCell>
                      <TableCell className="text-center">{l.completedSimulations}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${
                          l.avgScore >= 70 ? 'text-success'
                          : l.avgScore >= 40 ? 'text-warning'
                          : l.avgScore > 0 ? 'text-destructive'
                          : 'text-muted-foreground'
                        }`}>
                          {l.avgScore > 0 ? `${l.avgScore}%` : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {l.alertCount > 0 ? (
                          <Badge variant="destructive" appearance="light" size="xs">
                            {l.alertCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {l.lastSimulation ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={STATUS_VARIANT[l.lastSimulation.status] as any ?? 'secondary'}
                              appearance="light"
                              size="xs"
                            >
                              {l.lastSimulation.status}
                            </Badge>
                            <span className="text-muted-foreground truncate max-w-[120px]">
                              {l.lastSimulation.scenario}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}
