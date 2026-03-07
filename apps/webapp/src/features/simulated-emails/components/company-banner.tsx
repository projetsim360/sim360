import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';

interface CompanyBannerProps {
  companyName: string;
  sector?: string;
  culture?: string;
  className?: string;
}

export function CompanyBanner({
  companyName,
  sector,
  culture,
  className,
}: CompanyBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10',
        className,
      )}
    >
      {/* Logo placeholder */}
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
        <KeenIcon icon="abstract-26" style="solid" className="size-6" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{companyName}</h3>
        {sector && (
          <p className="text-sm text-muted-foreground">{sector}</p>
        )}
      </div>

      {culture && (
        <Badge variant="primary" appearance="light" size="sm">
          {culture}
        </Badge>
      )}
    </div>
  );
}
