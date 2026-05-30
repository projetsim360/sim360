import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ============================================================
   Types
   ============================================================ */

export interface BreadcrumbCrumb {
  /** Display label for this crumb. */
  label: string;
  /** Optional route to link to. The last crumb is never linked. */
  to?: string;
}

export interface PageHeaderProps {
  /** Optional breadcrumb trail. The last crumb is rendered as the current page (bold, no link). */
  breadcrumbs?: BreadcrumbCrumb[];
  /** The main page title — Montserrat 800, ~40px. */
  title: string;
  /** Optional subtitle under the title. */
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons, etc.). */
  actions?: ReactNode;
}

/* ============================================================
   PageHeader
   ============================================================ */

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-0">
      {/* ── Breadcrumb ── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs sm:text-sm mb-3"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-2.5">
                {index > 0 && (
                  <span
                    className="text-[var(--neutral-300)] select-none"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="text-foreground font-semibold">{crumb.label}</span>
                ) : crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="text-[var(--neutral-500)] font-medium hover:text-[var(--accent-600)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--neutral-500)] font-medium">{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* ── Page head row: title + actions ── */}
      <div className="flex items-start gap-5 flex-wrap mb-4">
        <div
          className="flex-1 min-w-[280px]"
          data-slot="toolbar-heading"
        >
          <h1
            className={cn(
              'font-display font-extrabold text-[28px] sm:text-[32px] lg:text-[40px] leading-[1.1] tracking-[-0.02em]',
              'text-[var(--brand-700)] text-wrap-balance m-0',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-[var(--neutral-500)] mt-1.5 max-w-[720px] m-0">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 mt-1.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
