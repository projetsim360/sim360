import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { Link } from 'react-router-dom';
import { Settings, BarChart3, Users } from '@/components/keenicons/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api/dashboard.api';
import type { GlobalDashboard } from '../types/dashboard.types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<GlobalDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '';
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  useEffect(() => {
    dashboardApi
      .getGlobalDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Tableau de bord" />
      </Toolbar>

      <div className="grid gap-5 lg:gap-7.5">
        {/* Welcome + Stats row */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="flex items-center gap-4 py-5">
                <Avatar className="size-16">
                  {user?.avatar ? (
                    <AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} className="size-16" />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">Bienvenue, {user?.firstName} !</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  {user?.role && (
                    <Badge variant="primary" appearance="light" size="sm" className="mt-1.5">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" asChild className="hidden sm:flex">
                  <Link to="/profile/edit">
                    <Settings className="size-4" />
                    Mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 h-full items-stretch">
              <StatCard
                label="En cours"
                value={loading ? '-' : String(data?.stats.active ?? 0)}
                color="text-primary"
                bgColor="bg-primary/10"
              />
              <StatCard
                label="Terminees"
                value={loading ? '-' : String(data?.stats.completed ?? 0)}
                color="text-success"
                bgColor="bg-success/10"
              />
              <StatCard
                label="Total"
                value={loading ? '-' : String(data?.stats.total ?? 0)}
                color="text-foreground"
                bgColor="bg-muted"
              />
              <StatCard
                label="Score moyen"
                value={loading ? '-' : `${data?.stats.avgScore ?? 0}%`}
                color="text-warning"
                bgColor="bg-warning/10"
              />
            </div>
          </div>
        </div>

        {/* Active simulations + Next actions */}
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5 items-stretch">
          {/* Active simulations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="size-4" />
                  Simulations en cours
                </CardTitle>
                <Button variant="link" size="sm" asChild>
                  <Link to="/simulations">Voir tout</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : !data?.activeSimulations.length ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">Aucune simulation en cours</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/simulations/new">Demarrer une simulation</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.activeSimulations.map((sim) => (
                    <Link
                      key={sim.id}
                      to={`/simulations/${sim.id}`}
                      className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium truncate">{sim.project.name}</h4>
                          <p className="text-sm text-muted-foreground">{sim.scenario.title}</p>
                        </div>
                        {sim.kpis && <MiniKpis kpis={sim.kpis} />}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="size-4" />
                Prochaines actions
                {data && (
                  <Badge variant="warning" appearance="light" size="sm">
                    {(data.nextActions.decisions.length + data.nextActions.meetings.length + data.nextActions.events.length)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : !data || (data.nextActions.decisions.length + data.nextActions.meetings.length + data.nextActions.events.length) === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Aucune action en attente</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {data.nextActions.decisions.map((d) => (
                    <Link
                      key={d.id}
                      to={`/simulations/${d.simulationId}/decisions/${d.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <KeenIcon icon="question-2" style="filled" className="text-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-[10px] text-muted-foreground">{d.projectName}</p>
                      </div>
                      <span className="text-[10px] text-primary shrink-0">Decision</span>
                    </Link>
                  ))}
                  {data.nextActions.events.map((e) => (
                    <Link
                      key={e.id}
                      to={`/simulations/${e.simulationId}/events/${e.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <KeenIcon icon="flash" style="filled" className="text-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground">{e.projectName}</p>
                      </div>
                      <Badge
                        variant={e.severity === 'CRITICAL' ? 'destructive' : e.severity === 'HIGH' ? 'warning' : 'info'}
                        appearance="light"
                        size="xs"
                      >
                        {e.severity}
                      </Badge>
                    </Link>
                  ))}
                  {data.nextActions.meetings.map((m) => (
                    <Link
                      key={m.id}
                      to={`/meetings/${m.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <KeenIcon icon="message-text" style="filled" className="text-lg shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.projectName}</p>
                      </div>
                      <span className="text-[10px] text-primary shrink-0">
                        {m.status === 'IN_PROGRESS' ? 'Reprendre' : 'Demarrer'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Score evolution chart */}
        {data && data.scoreEvolution && data.scoreEvolution.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="size-4" />
                Evolution du score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={data.scoreEvolution.map((p) => ({
                    date: new Date(p.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                    score: p.score,
                  }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activite recente</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : !data?.recentActivity.length ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucune activite recente</p>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((a, i) => (
                  <Link
                    key={i}
                    to={`/simulations/${a.simulationId}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <KeenIcon
                      icon={a.type === 'decision' ? 'question-2' : a.type === 'meeting' ? 'message-text' : 'flash'}
                      style="filled"
                      className="text-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.projectName}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bgColor }: { label: string; value: string; color: string; bgColor: string }) {
  return (
    <Card className={bgColor}>
      <CardContent className="flex flex-col items-center justify-center py-4 h-full">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}

function MiniKpis({ kpis }: { kpis: { budget: number; schedule: number; quality: number; teamMorale: number; riskLevel: number } }) {
  const bars = [
    { value: kpis.budget, label: 'B' },
    { value: kpis.schedule, label: 'D' },
    { value: kpis.quality, label: 'Q' },
  ];

  return (
    <div className="flex items-end gap-0.5 shrink-0">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-col items-center gap-0.5">
          <div className="w-3 h-6 bg-muted rounded-sm overflow-hidden flex flex-col justify-end">
            <div
              className={`w-full rounded-sm transition-all ${
                b.value > 70 ? 'bg-success' : b.value >= 40 ? 'bg-warning' : 'bg-destructive'
              }`}
              style={{ height: `${Math.min(100, Math.max(5, b.value))}%` }}
            />
          </div>
          <span className="text-[8px] text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
