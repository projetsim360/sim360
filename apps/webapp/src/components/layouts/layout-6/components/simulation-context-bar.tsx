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
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <Progress value={value} className="h-1.5 flex-1" indicatorClassName={color} />
      <span className="text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}

export function SimulationContextBar({ simulationId }: SimulationContextBarProps) {
  const { data: counts, isLoading } = useSimulationCounts(simulationId);

  if (isLoading || !counts) return null;

  const budgetColor = counts.budgetScore >= 70 ? 'bg-emerald-500' : counts.budgetScore >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const scheduleColor = counts.scheduleScore >= 70 ? 'bg-emerald-500' : counts.scheduleScore >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const qualityColor = counts.qualityScore >= 70 ? 'bg-emerald-500' : counts.qualityScore >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <Link
      to={`/simulations/${simulationId}`}
      className="block border-b border-input bg-accent/50 hover:bg-accent/70 transition-colors"
    >
      <div className="flex items-center justify-between gap-4 px-4 lg:px-5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <BarChart3 className="size-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{counts.projectName || 'Simulation'}</span>
          <Badge variant="info" appearance="light" size="xs">
            {counts.currentPhase || 'N/A'}
          </Badge>
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
