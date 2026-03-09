import { Fragment } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { useBreadcrumbs, type ResolvedBreadcrumbSegment } from '@/hooks/use-breadcrumbs';

interface BreadcrumbsProps {
  dynamicLabels?: Record<string, string>;
  className?: string;
}

function BreadcrumbsFromSegments({
  segments,
  className,
}: {
  segments: ResolvedBreadcrumbSegment[];
  className?: string;
}) {
  return (
    <nav aria-label="Fil d'ariane" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <Fragment key={index}>
            {segment.path && !isLast ? (
              <Link
                to={segment.path}
                className="text-secondary-foreground hover:text-primary transition-colors"
              >
                {segment.label}
              </Link>
            ) : (
              <span className={cn(isLast ? 'text-mono font-medium' : 'text-secondary-foreground')}>
                {segment.label}
              </span>
            )}
            {!isLast && (
              <KeenIcon
                icon="right"
                style="solid"
                className="size-3 text-muted-foreground shrink-0"
              />
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

export function Breadcrumbs({ dynamicLabels, className }: BreadcrumbsProps) {
  const segments = useBreadcrumbs(dynamicLabels);

  if (!segments) return null;

  return <BreadcrumbsFromSegments segments={segments} className={className} />;
}
