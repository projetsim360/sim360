import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { CultureType } from '../types/recruitment.types';

const CULTURE_OPTIONS: Array<{
  value: CultureType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'STRICT',
    label: 'Stricte / Predictive',
    description:
      'Processus rigoureux, planification detaillee, respect strict des delais et du perimetre. Ideal pour les environnements reglementaires.',
    icon: 'shield-tick',
  },
  {
    value: 'AGILE',
    label: 'Agile / Iterative',
    description:
      'Sprints courts, adaptation continue, livraisons incrementales. Favorise la reactivite et le feedback rapide.',
    icon: 'arrows-loop',
  },
  {
    value: 'COLLABORATIVE',
    label: 'Collaborative / Hybride',
    description:
      'Equilibre entre structure et flexibilite. Communication ouverte, prise de decision partagee, focus sur le consensus.',
    icon: 'people',
  },
];

interface CultureSelectorProps {
  value?: CultureType;
  onChange: (culture: CultureType) => void;
  className?: string;
}

export function CultureSelector({ value, onChange, className }: CultureSelectorProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {CULTURE_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/40 hover:bg-accent/50',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-lg p-2.5',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground',
              )}
            >
              <KeenIcon icon={option.icon} style="outline" className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{option.label}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {option.description}
              </p>
            </div>
            {isSelected && (
              <div className="self-end">
                <KeenIcon icon="check-circle" style="solid" className="size-5 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
