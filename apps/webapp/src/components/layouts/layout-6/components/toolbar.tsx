import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR_COMPACT } from '@/config/layout-6.config';
import { MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

export interface ToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  /** Custom heading markup (h1 + subtitle). Takes precedence over title/description. */
  children?: ReactNode;
}

function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pb-5">
      {children}
    </div>
  );
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center flex-wrap gap-1.5 lg:gap-3.5">
      {children}
    </div>
  );
}

function ToolbarBreadcrumbs() {
  const { pathname } = useLocation();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items: MenuItem[] = getBreadcrumb(MENU_SIDEBAR_COMPACT);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const active = item.path ? isActive(item.path) : false;

        return (
          <Fragment key={index}>
            {item.path ? (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-1',
                  active
                    ? 'text-mono'
                    : 'text-secondary-foreground hover:text-primary',
                )}
              >
                {item.title}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? 'text-mono' : 'text-secondary-foreground',
                )}
              >
                {item.title}
              </span>
            )}
            {!isLast && <span className="text-muted-foreground">/</span>}
          </Fragment>
        );
      })}
    </div>
  );
}

const ToolbarHeading = ({ title = '', description, children }: ToolbarHeadingProps) => {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR_COMPACT);

  // Pages that pass their own <h1>/<p> used to see them silently dropped.
  if (children) {
    return (
      <div data-slot="toolbar-heading" className="flex flex-col gap-1">
        {children}
      </div>
    );
  }

  return (
    <div data-slot="toolbar-heading" className="flex flex-col md:flex-row md:items-center flex-wrap gap-1 lg:gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-medium text-lg text-mono">{title || item?.title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <ToolbarBreadcrumbs />
    </div>
  );
};

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };
