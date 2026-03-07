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
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {SECTORS.map((sector) => {
        const isSelected = value === sector.value;
        const isSuggested = suggestedSector === sector.value;

        return (
          <Card
            key={sector.value}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md relative',
              isSelected && 'ring-2 ring-primary border-primary',
              !isSelected && 'hover:border-primary/50',
            )}
            onClick={() => onChange(sector.value)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
              {isSuggested && (
                <Badge
                  variant="primary"
                  size="xs"
                  className="absolute top-2 right-2"
                >
                  Suggere par l'IA
                </Badge>
              )}
              <KeenIcon
                icon={sector.icon}
                style="duotone"
                className={cn(
                  'text-3xl',
                  isSelected ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium text-center',
                  isSelected ? 'text-primary' : 'text-foreground',
                )}
              >
                {sector.label}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
