import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScoreEvolutionItem } from '../types/dashboard.types';

export function ScoreEvolutionCard({
  data,
  loading,
}: {
  data: ScoreEvolutionItem[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Performance
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">Évolution du score</h4>

        {loading ? (
          <Skeleton className="h-[220px] rounded-lg" />
        ) : data.length < 2 ? (
          <EmptyState
            icon="graph-up"
            title="Pas encore de données"
            description="Terminez au moins deux simulations pour visualiser l'évolution de votre score."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data.map((p) => ({
                name: p.projectName,
                date: new Date(p.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                score: p.score,
              }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--neutral-400)' }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--neutral-200)',
                  backgroundColor: '#fff',
                  color: 'var(--brand-700)',
                }}
                formatter={(value: number) => [`${value}%`, 'Score']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent-500)"
                fill="var(--accent-500)"
                fillOpacity={0.12}
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--accent-500)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
