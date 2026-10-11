import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { simulationApi } from '../api/simulation.api';
import type { KpiSnapshot } from '@/features/dashboard/types/dashboard.types';
import { useTv } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

const KPI_CONFIG: { key: string; label: AppMessageKey; color: string }[] = [
  { key: 'budget', label: 'kpi.budget', color: 'var(--chart-1)' },
  { key: 'schedule', label: 'kpi.schedule', color: 'var(--chart-3)' },
  { key: 'quality', label: 'kpi.quality', color: 'var(--chart-2)' },
  { key: 'teamMorale', label: 'kpi.morale', color: 'var(--chart-5)' },
  { key: 'riskLevel', label: 'kpi.risk', color: 'var(--chart-4)' },
];

export default function KpiHistoryPage() {
  const tv = useTv();
  const { intlLocale } = useAppLocale();
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const [snapshots, setSnapshots] = useState<KpiSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportPng = useCallback(() => {
    if (!chartRef.current) return;
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `kpi-history-${id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    simulationApi
      .getKpiHistory(id)
      .then(setSnapshots)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const chartData = snapshots.map((s, i) => ({
    index: i,
    label: tv('kpiTrigger', s.trigger),
    phase: `P${s.phaseOrder}`,
    budget: Math.round(s.budget * 10) / 10,
    schedule: Math.round(s.schedule * 10) / 10,
    quality: Math.round(s.quality * 10) / 10,
    teamMorale: Math.round(s.teamMorale * 10) / 10,
    riskLevel: Math.round(s.riskLevel * 10) / 10,
    trigger: s.trigger,
    date: new Date(s.takenAt).toLocaleString(intlLocale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  if (loading) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">{t('cockpit.kpiHistory')}</h1>
          </ToolbarHeading>
        </Toolbar>
        <Card>
          <CardContent className="p-5">
            <Skeleton className="h-5 w-48 mb-4" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">{t('cockpit.kpiHistory')}</h1>
          </ToolbarHeading>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">{t('cockpit.kpiHistory')}</h1>
          {snapshots.length > 0 && (
            <p className="text-sm text-gray-700">{t('kpiHistory.count', { count: snapshots.length })}</p>
          )}
        </ToolbarHeading>
        <ToolbarActions>
          {snapshots.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportPng}>
              <KeenIcon icon="cloud-download" style="duotone" className="text-sm" />
              {t('kpiHistory.exportPng')}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {snapshots.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="chart-simple"
              title={t('kpiHistory.emptyTitle')}
              description={t('kpiHistory.emptyText')}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main chart */}
          <Card className="mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('kpiHistory.chart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRef}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="index"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(_, i) => chartData[i]?.phase ?? ''}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
                          <p className="font-semibold mb-1">
                            {d.label} — {d.phase}
                          </p>
                          <p className="text-muted-foreground mb-2">{d.date}</p>
                          {KPI_CONFIG.map((kpi) => (
                            <div key={kpi.key} className="flex items-center gap-2 py-0.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: kpi.color }} />
                              <span className="text-muted-foreground">{t(kpi.label)} :</span>
                              <span className="font-medium">{d[kpi.key]}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const cfg = KPI_CONFIG.find((k) => k.key === value);
                      return <span className="text-sm">{cfg ? t(cfg.label) : value}</span>;
                    }}
                  />
                  <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" opacity={0.6} />
                  {KPI_CONFIG.map((kpi) => (
                    <Line
                      key={kpi.key}
                      type="monotone"
                      dataKey={kpi.key}
                      stroke={kpi.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Snapshot table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('kpiHistory.details')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">#</TableHead>
                    <TableHead className="text-left">{t('timeline.phase')}</TableHead>
                    <TableHead className="text-left">{t('kpiHistory.trigger')}</TableHead>
                    <TableHead className="text-right">{t('kpi.budget')}</TableHead>
                    <TableHead className="text-right">{t('kpi.schedule')}</TableHead>
                    <TableHead className="text-right">{t('kpi.quality')}</TableHead>
                    <TableHead className="text-right">{t('kpi.morale')}</TableHead>
                    <TableHead className="text-right">{t('kpi.risk')}</TableHead>
                    <TableHead className="text-left">{t('common.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>P{s.phaseOrder}</TableCell>
                      <TableCell>{tv('kpiTrigger', s.trigger)}</TableCell>
                      <TableCell className={`text-right font-medium ${kpiColor(s.budget)}`}>{s.budget}%</TableCell>
                      <TableCell className={`text-right font-medium ${kpiColor(s.schedule)}`}>{s.schedule}%</TableCell>
                      <TableCell className={`text-right font-medium ${kpiColor(s.quality)}`}>{s.quality}%</TableCell>
                      <TableCell className={`text-right font-medium ${kpiColor(s.teamMorale)}`}>{s.teamMorale}%</TableCell>
                      <TableCell className={`text-right font-medium ${kpiColor(s.riskLevel)}`}>{s.riskLevel}%</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(s.takenAt).toLocaleString(intlLocale, {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function kpiColor(value: number): string {
  if (value > 70) return 'text-success';
  if (value >= 40) return 'text-warning';
  return 'text-destructive';
}
