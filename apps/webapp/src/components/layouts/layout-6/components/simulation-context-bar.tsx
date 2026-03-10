import { Link } from 'react-router-dom';
import { useSimulationCounts } from '@/features/simulation/hooks/use-simulation-counts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BarChart3 } from '@/components/keenicons/icons';

interface SimulationContextBarProps {
  simulationId: string;
}

function KpiMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <span className="text-xs text-[#8a7daa] dark:text-white/60 whitespace-nowrap">{label}</span>
      <Progress value={value} className="h-1.5 flex-1 bg-[#eae8ee] dark:bg-white/20" indicatorClassName={color} />
      <span className="text-xs font-medium tabular-nums text-[#4b2f95] dark:text-white/80">{value}%</span>
    </div>
  );
}

export function SimulationContextBar({ simulationId }: SimulationContextBarProps) {
  const { data: counts, isLoading } = useSimulationCounts(simulationId);

  if (isLoading || !counts) return null;

  const kpiBarColor = (v: number) => v >= 70 ? 'bg-success' : v >= 40 ? 'bg-warning' : 'bg-destructive';
  const budgetColor = kpiBarColor(counts.budgetScore);
  const scheduleColor = kpiBarColor(counts.scheduleScore);
  const qualityColor = kpiBarColor(counts.qualityScore);

  return (
    <Link
      to={`/simulations/${simulationId}`}
      className="block border-b border-[#eae8ee] dark:border-white/10 bg-white dark:bg-white/8 hover:bg-white hover:shadow-xs dark:hover:bg-white/10 dark:hover:shadow-none transition-colors"
    >
      <div className="flex items-center justify-between gap-4 px-4 lg:px-5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="size-4 text-[#8a7daa] dark:text-white/70 shrink-0" />
          <span className="text-sm font-medium truncate text-[#4b2f95] dark:text-white">{counts.projectName || 'Simulation'}</span>
          {counts.currentPhase && (
            <Badge variant="info" appearance="light" size="xs">
              {counts.currentPhase}
            </Badge>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <KpiMini label="Budget" value={counts.budgetScore ?? 0} color={budgetColor} />
          <KpiMini label="Delai" value={counts.scheduleScore ?? 0} color={scheduleColor} />
          <KpiMini label="Qualite" value={counts.qualityScore ?? 0} color={qualityColor} />
        </div>
      </div>
    </Link>
  );
}
