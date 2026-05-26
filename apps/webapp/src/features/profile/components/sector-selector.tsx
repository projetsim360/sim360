import { useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { SECTORS } from '../types/profile.types';
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion';

interface SectorSelectorProps {
  value?: string;
  suggestedSector?: string;
  onChange: (sector: string) => void;
  className?: string;
}

export function SectorSelector({ value, suggestedSector, onChange, className }: SectorSelectorProps) {
  const reduce = useReducedMotion();

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
    <motion.div
      role="radiogroup"
      aria-label="Sélection du secteur de simulation"
      className={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="show"
    >
      {SECTORS.map((sector) => {
        const isSelected = value === sector.value;
        const isSuggested = suggestedSector === sector.value;

        return (
          <motion.div key={sector.value} variants={staggerItem} whileHover={reduce ? undefined : cardHover}>
            <Card
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              aria-label={`${sector.label}${isSuggested ? " (suggéré par l'IA)" : ''}`}
              className={cn(
                'relative h-full cursor-pointer outline-none transition-all hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected && 'border-primary bg-primary/5 ring-2 ring-primary',
                !isSelected && 'hover:border-primary/50',
              )}
              onClick={() => onChange(sector.value)}
              onKeyDown={handleKeyDown(sector.value)}
            >
              <CardContent className="flex flex-col items-center justify-center gap-2.5 p-5">
                {isSuggested && (
                  <Badge variant="primary" size="xs" className="absolute right-2 top-2">
                    Suggéré par l'IA
                  </Badge>
                )}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    isSelected ? 'bg-primary/10' : 'bg-muted',
                  )}
                >
                  <KeenIcon
                    icon={sector.icon}
                    style="duotone"
                    className={cn('text-2xl transition-colors', isSelected ? 'text-primary' : 'text-muted-foreground')}
                  />
                </div>
                <span
                  className={cn(
                    'text-center text-sm font-medium transition-colors',
                    isSelected ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {sector.label}
                </span>
                {isSelected && (
                  <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
