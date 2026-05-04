import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from './workspace-switcher';
import { useShellState } from '../state/shell-state-provider';
import { useAuth } from '@/providers/auth-provider';
import { APP_SIDEBAR_MENU } from '@/config/menu.config';
import type { MenuItem, MenuConfig, UserRole } from '@/config/types';

// ---------------------------------------------------------------------------
// Active state helpers
// ---------------------------------------------------------------------------

function isItemActive(item: MenuItem, pathname: string): boolean {
  if (item.path && item.path !== '#' && item.path === pathname) return true;
  if (item.rootPath && pathname.startsWith(item.rootPath)) return true;
  if (item.children?.some((child) => isItemActive(child, pathname))) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Role-based filtering
// ---------------------------------------------------------------------------

function filterByRole(items: MenuConfig, userRole: string | undefined): MenuConfig {
  const result: MenuItem[] = [];
  let i = 0;

  while (i < items.length) {
    const item = items[i];

    if (item.heading !== undefined) {
      // Collect everything until the next heading
      const headingItem = item;
      const sectionItems: MenuItem[] = [];
      i++;
      while (i < items.length && items[i].heading === undefined) {
        sectionItems.push(items[i]);
        i++;
      }

      // Skip the heading+section entirely if heading has roles and user isn't authorized
      if (headingItem.roles && headingItem.roles.length > 0) {
        if (!userRole || !headingItem.roles.includes(userRole as UserRole)) {
          continue;
        }
      }

      // Filter items within the section by their own roles
      const visibleItems = sectionItems.filter((si) => {
        if (!si.roles || si.roles.length === 0) return true;
        return userRole && si.roles.includes(userRole as UserRole);
      });

      // Only add heading if there are visible items under it
      if (visibleItems.length > 0) {
        result.push(headingItem);
        result.push(...visibleItems);
      }
    } else {
      // Regular item (no heading)
      if (!item.roles || item.roles.length === 0) {
        result.push(item);
      } else if (userRole && item.roles.includes(userRole as UserRole)) {
        result.push(item);
      }
      i++;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Accordion state initialization
// ---------------------------------------------------------------------------

function buildInitialAccordionState(
  items: MenuConfig,
  pathname: string,
): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const item of items) {
    if (item.children && item.title) {
      state[item.title] = isItemActive(item, pathname);
    }
  }
  return state;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionHeadingProps {
  label: string;
}

function SectionHeading({ label }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'simex-nav-title px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[1.2px]',
        'text-[var(--shell-fg-faint)] whitespace-nowrap overflow-hidden',
      )}
    >
      {label}
    </div>
  );
}

interface NavItemProps {
  item: MenuItem;
  pathname: string;
  sidebarCollapsed: boolean;
  accordionState: Record<string, boolean>;
  onToggleAccordion: (title: string) => void;
}

function NavItem({ item, pathname, sidebarCollapsed, accordionState, onToggleAccordion }: NavItemProps) {
  const active = isItemActive(item, pathname);
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const isOpen = hasChildren && item.title ? (accordionState[item.title] ?? false) : false;
  const Icon = item.icon;

  const itemClasses = cn(
    'simex-nav-item relative mb-0.5 flex items-center gap-3 overflow-hidden',
    'rounded-md px-3 py-2.5',
    'text-sm font-medium no-underline',
    'cursor-pointer transition-colors duration-150',
    sidebarCollapsed && 'justify-center px-[10px]',
    active
      ? 'bg-[var(--accent-500)] text-white'
      : 'text-[var(--shell-fg)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]',
  );

  const iconClasses = cn(
    'size-[18px] shrink-0',
    active ? 'text-white' : 'text-[var(--shell-fg-muted)]',
  );

  const badgeClasses = cn(
    'simex-nav-badge shrink-0 rounded-full px-[7px] py-0.5 text-[11px] font-bold leading-none',
    active
      ? 'bg-black/18 text-white'
      : 'bg-[var(--shell-soft)] text-[var(--shell-fg)]',
  );

  // Accordion parent — click toggles open/closed
  if (hasChildren && item.title) {
    return (
      <div>
        <button
          type="button"
          data-tip={item.title}
          onClick={() => onToggleAccordion(item.title!)}
          className={cn(itemClasses, 'w-full text-left')}
        >
          {Icon && <Icon className={iconClasses} />}
          {!sidebarCollapsed && (
            <>
              <span className="simex-nav-label flex-1 whitespace-nowrap">{item.title}</span>
              {item.badge !== undefined && (
                <span className={badgeClasses}>{item.badge}</span>
              )}
              <ChevronRight
                className={cn(
                  'size-3.5 shrink-0 transition-transform duration-200',
                  active ? 'text-white/70' : 'text-[var(--shell-fg-faint)]',
                  isOpen && 'rotate-90',
                )}
              />
            </>
          )}
        </button>

        {/* Children — only shown when expanded and sidebar is not collapsed */}
        {!sidebarCollapsed && isOpen && (
          <div className="ml-8 mt-0.5 flex flex-col gap-0.5 pb-1">
            {item.children!.map((child) => {
              const childActive = isItemActive(child, pathname);
              const isHashLink = !child.path || child.path === '#';

              const childClasses = cn(
                'block rounded-md px-3 py-2 text-xs font-medium no-underline',
                'cursor-pointer transition-colors duration-150 whitespace-nowrap',
                childActive
                  ? 'bg-[var(--accent-500)]/15 text-[var(--accent-500)]'
                  : 'text-[var(--shell-fg-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]',
              );

              if (isHashLink) {
                return (
                  <a
                    key={child.title ?? child.path}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className={childClasses}
                  >
                    {child.title}
                  </a>
                );
              }

              return (
                <Link
                  key={child.title ?? child.path}
                  to={child.path!}
                  className={childClasses}
                >
                  {child.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Regular leaf item
  const isHashLink = !item.path || item.path === '#';

  const innerContent = (
    <>
      {Icon && <Icon className={iconClasses} />}
      {!sidebarCollapsed && (
        <>
          <span className="simex-nav-label flex-1 whitespace-nowrap">{item.title}</span>
          {item.badge !== undefined && (
            <span className={badgeClasses}>{item.badge}</span>
          )}
        </>
      )}
    </>
  );

  if (isHashLink) {
    return (
      <a
        href="#"
        data-tip={item.title}
        onClick={(e) => e.preventDefault()}
        className={itemClasses}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <Link
      to={item.path!}
      data-tip={item.title}
      className={itemClasses}
    >
      {innerContent}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed } = useShellState();
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Filter menu by role
  const visibleItems = filterByRole(APP_SIDEBAR_MENU, user?.role);

  // Accordion open/close state — keyed by item title
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(() =>
    buildInitialAccordionState(visibleItems, pathname),
  );

  // Auto-expand accordion parents when the active route changes (never auto-closes)
  useEffect(() => {
    setAccordionState((prev) => {
      const next = { ...prev };
      for (const item of visibleItems) {
        if (item.children && item.title && isItemActive(item, pathname)) {
          next[item.title] = true;
        }
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.role]);

  function handleToggleAccordion(title: string) {
    setAccordionState((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <aside
      aria-expanded={!sidebarCollapsed}
      className={cn(
        'simex-sidebar fixed left-0 z-20 flex flex-col overflow-y-auto',
        'text-[var(--shell-fg)] px-3.5 py-4',
        className,
      )}
      style={{
        top: '64px',
        height: 'calc(100vh - 64px)',
        width: sidebarCollapsed ? '72px' : '260px',
      }}
    >
      {/* Workspace switcher */}
      <WorkspaceSwitcher collapsed={sidebarCollapsed} />

      {/* CTA: Lancer une simulation */}
      <Link
        to="/simulations/new"
        className={cn(
          'simex-cta-launch flex w-full items-center gap-2.5 overflow-hidden',
          'rounded-md border-0 bg-[var(--accent-500)] text-white',
          'px-3.5 py-3 mb-[18px]',
          'text-sm font-semibold no-underline',
          'transition-colors duration-200 hover:bg-[var(--accent-600)]',
          sidebarCollapsed && 'px-3 justify-center',
        )}
      >
        <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-white/18">
          <Play className="size-[11px]" />
        </span>
        {!sidebarCollapsed && (
          <span className="simex-cta-label">Lancer une simulation</span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-0">
        {visibleItems.map((item, idx) => {
          if (item.heading) {
            // Hide section titles when collapsed
            if (sidebarCollapsed) return null;
            return <SectionHeading key={`heading-${idx}`} label={item.heading} />;
          }

          return (
            <NavItem
              key={item.title ?? item.path ?? idx}
              item={item}
              pathname={pathname}
              sidebarCollapsed={sidebarCollapsed}
              accordionState={accordionState}
              onToggleAccordion={handleToggleAccordion}
            />
          );
        })}
      </nav>

      {/* Sidebar footer card — hidden when collapsed */}
      {!sidebarCollapsed && (
        <div
          className={cn(
            'simex-sidebar-card relative mt-auto overflow-hidden rounded-md border border-[var(--shell-border)] p-4',
            'bg-gradient-to-b from-[var(--shell-soft)] to-transparent',
          )}
        >
          {/* Orange radial decorator */}
          <span
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full"
            style={{
              background: 'radial-gradient(circle at center, var(--accent-500) 0%, transparent 65%)',
              opacity: 0.35,
            }}
          />

          <div className="relative z-10">
            <p className="mb-1.5 font-display text-sm font-bold text-[var(--shell-fg-strong)]">
              Mode coach activé
            </p>
            <p className="mb-3 text-[12px] leading-[1.45] text-[var(--shell-fg-muted)]">
              Feedback IA détaillé après chaque livrable, accès au plan de progression personnalisé.
            </p>
            <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--shell-fg)]">
              <Sparkles className="size-3.5 text-[var(--accent-400)]" />
              Inclus avec votre offre
            </div>
            <button
              type="button"
              className={cn(
                'block w-full rounded-md border-0 bg-[var(--accent-500)] px-0 py-2.5',
                'text-center text-[13px] font-semibold text-white',
                'cursor-pointer transition-colors duration-150 hover:bg-[var(--accent-600)]',
              )}
            >
              Découvrir
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
