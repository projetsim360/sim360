import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';

interface EvaluationCardProps {
  title: string;
  icon: string;
  iconColor: string;
  items: string[];
  emptyMessage?: string;
}

export function EvaluationCard({
  title,
  icon,
  iconColor,
  items,
  emptyMessage = 'Aucun element.',
}: EvaluationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <KeenIcon icon={icon} style="solid" className={cn('size-4', iconColor)} />
          {title}
          {items.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({items.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <KeenIcon
                  icon={icon}
                  style="solid"
                  className={cn('size-3.5 shrink-0 mt-0.5', iconColor)}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
