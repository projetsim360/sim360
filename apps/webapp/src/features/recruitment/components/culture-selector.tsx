import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { CultureType } from '../types/recruitment.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const CULTURE_OPTIONS: Array<{
  value: CultureType;
  label: AppMessageKey;
  description: AppMessageKey;
  icon: string;
}> = [
  {
    value: 'STRICT',
    label: 'recruit.culture.STRICT',
    description: 'recruit.culture.STRICT.desc',
    icon: 'shield-tick',
  },
  {
    value: 'AGILE',
    label: 'recruit.culture.AGILE',
    description: 'recruit.culture.AGILE.desc',
    icon: 'arrows-loop',
  },
  {
    value: 'COLLABORATIVE',
    label: 'recruit.culture.COLLABORATIVE',
    description: 'recruit.culture.COLLABORATIVE.desc',
    icon: 'people',
  },
];

interface CultureSelectorProps {
  value?: CultureType;
  onChange: (culture: CultureType) => void;
  className?: string;
}

export function CultureSelector({ value, onChange, className }: CultureSelectorProps) {
  const t = useT();
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
              <KeenIcon icon={option.icon} style="duotone" className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{t(option.label)}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {t(option.description)}
              </p>
            </div>
            {isSelected && (
              <div className="self-end">
                <KeenIcon icon="check-circle" style="duotone" className="size-5 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
