import { useState, useEffect } from 'react';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { aiUsageApi } from '../api/ai-usage.api';
import type { AiQuota, AiBilling } from '../api/ai-usage.api';

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(n: number, currency: string): string {
  return `${n.toFixed(4)} ${currency}`;
}

function formatCostShort(n: number, currency: string): string {
  if (n >= 1) return `${n.toFixed(2)} ${currency}`;
  if (n >= 0.01) return `${n.toFixed(3)} ${currency}`;
  return `${n.toFixed(4)} ${currency}`;
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return 'text-destructive';
  if (percent >= 70) return 'text-warning';
  return 'text-success';
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return 'bg-destructive';
  if (percent >= 70) return 'bg-warning';
  return 'bg-primary';
}

const OPERATION_LABELS: Record<string, string> = {
  complete: 'Completion generique',
  meeting_respond: 'Reponse reunion (controller)',
  meeting_stream: 'Reponse reunion (stream)',
  meeting_summary: 'Resume reunion',
  meeting_structured_summary: 'Resume structure',
  decision_evaluate: 'Evaluation decision',
  phase_report: 'Rapport de phase',
  final_report: 'Rapport final',
  event_description: 'Description evenement',
};

export default function TokenUsagePage() {
  const [quota, setQuota] = useState<AiQuota | null>(null);
  const [billing, setBilling] = useState<AiBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([aiUsageApi.getQuota(), aiUsageApi.getBilling()])
      .then(([q, b]) => {
        setQuota(q);
        setBilling(b);
      })
      .catch((err) => setError(err.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Utilisation IA" />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Utilisation IA" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inputPercent = quota
    ? Math.min(100, Math.round((quota.currentMonthInput / quota.monthlyInputLimit) * 100))
    : 0;
  const outputPercent = quota
    ? Math.min(100, Math.round((quota.currentMonthOutput / quota.monthlyOutputLimit) * 100))
    : 0;

  const periodLabel = billing?.periodStart
    ? new Date(billing.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';

  const currency = billing?.currency ?? 'USD';

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Utilisation IA" />
      </Toolbar>

      {/* Period + margin badge */}
      {periodLabel && (
        <div className="flex items-center gap-2 mb-5">
          <Badge variant="primary" appearance="light" size="sm">
            Periode : {periodLabel}
          </Badge>
          {billing && (
            <Badge variant="secondary" appearance="light" size="sm">
              Marge : {billing.marginPercent}%
            </Badge>
          )}
        </div>
      )}

      {/* Billing total + stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Cout total"
          value={billing ? `${billing.totalCost.toFixed(2)}` : '0'}
          sub={currency}
          color="text-foreground"
        />
        <StatCard
          label="Tokens entree"
          value={formatTokens(quota?.currentMonthInput ?? 0)}
          sub={`/ ${formatTokens(quota?.monthlyInputLimit ?? 0)}`}
          color={getUsageColor(inputPercent)}
        />
        <StatCard
          label="Tokens sortie"
          value={formatTokens(quota?.currentMonthOutput ?? 0)}
          sub={`/ ${formatTokens(quota?.monthlyOutputLimit ?? 0)}`}
          color={getUsageColor(outputPercent)}
        />
        <StatCard
          label="Appels IA"
          value={String(billing?.totalCalls ?? 0)}
          color="text-primary"
        />
        <StatCard
          label="Cout / appel"
          value={billing && billing.totalCalls > 0
            ? `${(billing.totalCost / billing.totalCalls).toFixed(4)}`
            : '0'}
          sub={currency}
          color="text-muted-foreground"
        />
      </div>

      {/* Quota progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="arrow-down" style="duotone" className="size-4" />
              Quota entree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatTokens(quota?.currentMonthInput ?? 0)} utilises
                </span>
                <span className={`font-semibold ${getUsageColor(inputPercent)}`}>
                  {inputPercent}%
                </span>
              </div>
              <Progress value={inputPercent} className="h-2.5" indicatorClassName={getProgressColor(inputPercent)} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>Limite : {formatTokens(quota?.monthlyInputLimit ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="arrow-up" style="duotone" className="size-4" />
              Quota sortie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatTokens(quota?.currentMonthOutput ?? 0)} utilises
                </span>
                <span className={`font-semibold ${getUsageColor(outputPercent)}`}>
                  {outputPercent}%
                </span>
              </div>
              <Progress value={outputPercent} className="h-2.5" indicatorClassName={getProgressColor(outputPercent)} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>Limite : {formatTokens(quota?.monthlyOutputLimit ?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost by model */}
      {billing && billing.byModel.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="setting-2" style="duotone" className="size-4" />
              Cout par modele
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Modele</TableHead>
                    <TableHead className="text-right">Entree</TableHead>
                    <TableHead className="text-right">Sortie</TableHead>
                    <TableHead className="text-right">Appels</TableHead>
                    <TableHead className="text-right">Cout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.byModel.map((row) => (
                    <TableRow key={row.model}>
                      <TableCell className="font-mono text-[11px]">{row.model}</TableCell>
                      <TableCell className="text-right">{formatTokens(row.inputTokens)}</TableCell>
                      <TableCell className="text-right">{formatTokens(row.outputTokens)}</TableCell>
                      <TableCell className="text-right">{row.calls}</TableCell>
                      <TableCell className="text-right font-medium">{formatCostShort(row.cost, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost by operation */}
      {billing && billing.byOperation.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="category" style="duotone" className="size-4" />
              Cout par operation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Operation</TableHead>
                    <TableHead className="text-right">Entree</TableHead>
                    <TableHead className="text-right">Sortie</TableHead>
                    <TableHead className="text-right">Appels</TableHead>
                    <TableHead className="text-right">Cout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.byOperation.map((row) => (
                    <TableRow key={row.operation}>
                      <TableCell>{OPERATION_LABELS[row.operation] ?? row.operation}</TableCell>
                      <TableCell className="text-right">{formatTokens(row.inputTokens)}</TableCell>
                      <TableCell className="text-right">{formatTokens(row.outputTokens)}</TableCell>
                      <TableCell className="text-right">{row.calls}</TableCell>
                      <TableCell className="text-right font-medium">{formatCostShort(row.cost, currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost by simulation/project */}
      {billing && billing.bySimulation.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="chart-line" style="duotone" className="size-4" />
              Cout par projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Projet</TableHead>
                    <TableHead className="text-left">Scenario</TableHead>
                    <TableHead className="text-right">Entree</TableHead>
                    <TableHead className="text-right">Sortie</TableHead>
                    <TableHead className="text-right">Appels</TableHead>
                    <TableHead className="text-right">Cout</TableHead>
                    <TableHead className="text-right">Part</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billing.bySimulation.map((row) => {
                    const share = billing.totalCost > 0
                      ? Math.round((row.cost / billing.totalCost) * 100)
                      : 0;
                    return (
                      <TableRow key={row.simulationId}>
                        <TableCell className="font-medium">{row.projectName}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-[160px]">
                          {row.scenarioTitle}
                        </TableCell>
                        <TableCell className="text-right">{formatTokens(row.inputTokens)}</TableCell>
                        <TableCell className="text-right">{formatTokens(row.outputTokens)}</TableCell>
                        <TableCell className="text-right">{row.calls}</TableCell>
                        <TableCell className="text-right font-medium">{formatCostShort(row.cost, currency)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={share} className="h-1.5 w-12" />
                            <span className="text-muted-foreground w-8 text-right">{share}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeenIcon icon="information-2" style="duotone" className="size-4" />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Les couts sont calcules automatiquement a partir du tarif de chaque modele IA
                avec une marge de {billing?.marginPercent ?? 30}%.
              </p>
              <p>
                Les quotas sont reinitialises au debut de chaque mois.
                Le cout affiche correspond a la periode en cours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}
