import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';
import type { Scenario } from '../types/simulation.types';

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const DIFFICULTY_PILL: Record<string, string> = {
  BEGINNER: 'bg-[var(--success-50)] text-[var(--success-700)]',
  INTERMEDIATE: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  ADVANCED: 'bg-[var(--error-50)] text-[var(--error-700)]',
  EXPERT: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const TYPE_LABEL: Record<string, string> = {
  GREENFIELD: 'Nouveau projet',
  BROWNFIELD: 'Reprise en cours',
};

const SECTOR_ICONS: Record<string, string> = {
  IT: 'technology-2',
  CONSTRUCTION: 'home',
  MARKETING: 'chart-line',
  HEALTHCARE: 'heart',
  FINANCE: 'dollar',
  CUSTOM: 'element-11',
};

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (s: Scenario) => void;
  recommended?: boolean;
}

export function ScenarioCard({ scenario, onSelect, recommended = false }: ScenarioCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? undefined : staggerItem}>
      <Card
        className="group cursor-pointer border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-300)] motion-reduce:transform-none"
        onClick={() => onSelect(scenario)}
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                <KeenIcon icon={SECTOR_ICONS[scenario.sector] ?? 'element-11'} style="duotone" className="text-sm text-[var(--brand-700)]" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
                {scenario.sector}
              </span>
            </div>
            {recommended && (
              <span className="rounded-full bg-[var(--accent-100)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-700)]">
                Recommandé
              </span>
            )}
          </div>

          <h3 className="font-display text-[15px] font-bold leading-tight text-[var(--brand-700)] transition-colors group-hover:text-[var(--accent-700)]">
            {scenario.title}
          </h3>
          {scenario.description && (
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--neutral-500)]">
              {scenario.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', DIFFICULTY_PILL[scenario.difficulty] ?? 'bg-[var(--brand-50)] text-[var(--brand-700)]')}>
              {DIFFICULTY_LABEL[scenario.difficulty] ?? scenario.difficulty}
            </span>
            {scenario.scenarioType && (
              <span className="rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                {TYPE_LABEL[scenario.scenarioType] ?? scenario.scenarioType}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
