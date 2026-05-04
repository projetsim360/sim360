import { Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSwitcher } from './workspace-switcher';
import { SIMEX_SHELL_MENU } from '../config/menu';
import { useShellState } from '../state/shell-state-provider';

// Hardcoded active item for LOT A/B — wired via useLocation() in LOT D
const ACTIVE_PATH = '/simulations';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed } = useShellState();

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
      <button
        type="button"
        className={cn(
          'simex-cta-launch flex w-full items-center gap-2.5 overflow-hidden',
          'rounded-md border-0 bg-[var(--accent-500)] text-white',
          'px-3.5 py-3 mb-[18px]',
          'text-sm font-semibold cursor-pointer',
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
      </button>

      {/* Navigation sections */}
      <nav className="flex flex-col gap-0">
        {SIMEX_SHELL_MENU.map((section) => (
          <div key={section.title} className="mb-3.5">
            {/* Section title */}
            <div
              className={cn(
                'simex-nav-title px-3 pb-2 pt-1.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-[var(--shell-fg-faint)] whitespace-nowrap overflow-hidden',
                sidebarCollapsed && 'text-center text-[9px] px-0',
              )}
            >
              {section.title}
            </div>

            {/* Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === ACTIVE_PATH;
              const isAgentPmo = item.path === '/pmo';

              return (
                <a
                  key={item.label}
                  href={item.path}
                  data-tip={item.label}
                  className={cn(
                    'simex-nav-item relative mb-0.5 flex items-center gap-3 overflow-hidden',
                    'rounded-md px-3 py-2.5',
                    'text-sm font-medium no-underline',
                    'cursor-pointer transition-colors duration-150',
                    sidebarCollapsed && 'justify-center px-[10px]',
                    isActive
                      ? 'bg-[var(--accent-500)] text-white'
                      : 'text-[var(--shell-fg)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-[18px] shrink-0',
                      isActive
                        ? 'text-white'
                        : isAgentPmo
                        ? 'text-[var(--accent-400)]'
                        : 'text-[var(--shell-fg-muted)]',
                    )}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="simex-nav-label flex-1 whitespace-nowrap">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'simex-nav-badge shrink-0 rounded-full px-[7px] py-0.5 text-[11px] font-bold leading-none',
                            isActive
                              ? 'bg-black/18 text-white'
                              : 'bg-[var(--shell-soft)] text-[var(--shell-fg)]',
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              );
            })}
          </div>
        ))}
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
