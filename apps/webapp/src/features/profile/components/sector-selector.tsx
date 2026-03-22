import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { SECTORS } from '../types/profile.types';

interface SectorSelectorProps {
  value?: string;
  suggestedSector?: string;
  onChange: (sector: string) => void;
  className?: string;
}

export function SectorSelector({
  value,
  suggestedSector,
  onChange,
  className,
}: SectorSelectorProps) {
  const handleKeyDown = useCallback(
    (sectorValue: string) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(sectorValue);
      }
    },
    [onChange],
  );

  return (
    <div
      role="radiogroup"
      aria-label="Selection du secteur de simulation"
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3', className)}
    >
      {SECTORS.map((sector) => {
        const isSelected = value === sector.value;
        const isSuggested = suggestedSector === sector.value;

        return (
          <Card
            key={sector.value}
            role="radio"
            tabIndex={0}
            aria-checked={isSelected}
            aria-label={`${sector.label}${isSuggested ? ' (suggere par l\'IA)' : ''}`}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md relative outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
              !isSelected && 'hover:border-primary/50',
            )}
            onClick={() => onChange(sector.value)}
            onKeyDown={handleKeyDown(sector.value)}
          >
            <CardContent className="flex flex-col items-center justify-center p-5 gap-2.5">
              {isSuggested && (
                <Badge
                  variant="primary"
                  size="xs"
                  className="absolute top-2 right-2"
                >
                  Suggere par l'IA
                </Badge>
              )}
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl transition-colors',
                  isSelected ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <KeenIcon
                  icon={sector.icon}
                  style="duotone"
                  className={cn(
                    'text-2xl transition-colors',
                    isSelected ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-sm font-medium text-center transition-colors',
                  isSelected ? 'text-primary' : 'text-foreground',
                )}
              >
                {sector.label}
              </span>
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
