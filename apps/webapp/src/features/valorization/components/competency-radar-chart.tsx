import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { CompetencyScores } from '../types/valorization.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const COMPETENCY_KEYS: (keyof CompetencyScores)[] = ['planification', 'communication', 'risques', 'leadership', 'rigueur', 'adaptabilite'];

interface CompetencyRadarChartProps {
  scores: CompetencyScores;
  className?: string;
}

export function CompetencyRadarChart({ scores, className }: CompetencyRadarChartProps) {
  const tv = useTv();
  const t = useT();
  const data = COMPETENCY_KEYS.map((key) => ({
    competency: tv('valo.competency', key),
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
            name={t('valo.competencies')}
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
