import * as React from 'react';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
      {...props}
    >
      <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 mb-4">
        <KeenIcon icon={icon} style="duotone" className="text-2xl text-primary" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Button variant="primary" size="sm" asChild>
              <Link to={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export { EmptyState, type EmptyStateProps, type EmptyStateAction };
