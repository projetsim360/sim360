import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { CompetencyScores } from '../types/valorization.types';

const COMPETENCY_LABELS: Record<keyof CompetencyScores, string> = {
  planification: 'Planification',
  communication: 'Communication',
  risques: 'Gestion des risques',
  leadership: 'Leadership',
  rigueur: 'Rigueur',
  adaptabilite: 'Adaptabilite',
};

interface CompetencyRadarChartProps {
  scores: CompetencyScores;
  className?: string;
}

export function CompetencyRadarChart({ scores, className }: CompetencyRadarChartProps) {
  const data = (Object.keys(COMPETENCY_LABELS) as (keyof CompetencyScores)[]).map((key) => ({
    competency: COMPETENCY_LABELS[key],
    value: scores[key] ?? 0,
    fullMark: 100,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="competency"
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
          />
          <Radar
            name="Competences"
            dataKey="value"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
