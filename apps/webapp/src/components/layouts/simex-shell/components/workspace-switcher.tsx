import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWorkspaceLabel } from '@/lib/user-display';
import { useAuth } from '@/providers/auth-provider';

interface WorkspaceSwitcherProps {
  className?: string;
  collapsed?: boolean;
}

/** "Espace Apprenant" chip — links back to the dashboard (home of the workspace). */
export function WorkspaceSwitcher({ className, collapsed = false }: WorkspaceSwitcherProps) {
  const { user } = useAuth();
  const label = getWorkspaceLabel(user?.role);

  return (
    <Link
      to="/dashboard"
      aria-label={`Espace ${label} — retour au tableau de bord`}
      title="Retour au tableau de bord"
      className={cn(
        'simex-workspace-switch flex w-full items-center gap-2.5 overflow-hidden no-underline',
        'rounded-md border border-[var(--shell-border)] bg-[var(--shell-soft)]',
        'px-3 py-2.5 mb-3',
        'cursor-pointer transition-colors duration-150',
        'hover:bg-[var(--shell-hover)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-400)]',
        collapsed && 'justify-center px-[10px]',
        className,
      )}
    >
      {/* Green presence dot */}
      <span className="size-2 shrink-0 rounded-full bg-[var(--success-500)] shadow-[0_0_0_3px_rgba(16,185,129,.18)]" />

      {/* Label */}
      {!collapsed && (
        <span className="simex-workspace-label flex-1 whitespace-nowrap text-left">
          <span className="block text-[11px] font-semibold uppercase tracking-[1px] text-[var(--shell-fg-muted)]">
            Espace&nbsp;<strong className="font-bold tracking-[0.5px] text-[var(--shell-fg-strong)]">{label}</strong>
          </span>
        </span>
      )}

      {!collapsed && (
        <Home className="simex-workspace-chev ml-auto size-3.5 shrink-0 text-[var(--shell-fg-muted)]" aria-hidden="true" />
      )}
    </Link>
  );
}
