import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';

interface DebriefingSectionProps {
  title: string;
  items: string[];
  icon: string;
  iconColor: string;
  className?: string;
}

export function DebriefingSection({
  title,
  items,
  icon,
  iconColor,
  className,
}: DebriefingSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeenIcon icon={icon} style="solid" className={cn('text-base', iconColor)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className={cn('mt-1.5 size-1.5 rounded-full shrink-0', iconColor.replace('text-', 'bg-'))} />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
