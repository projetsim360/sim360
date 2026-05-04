import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceSwitcherProps {
  className?: string;
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ className, collapsed = false }: WorkspaceSwitcherProps) {
  return (
    <button
      type="button"
      className={cn(
        'simex-workspace-switch flex w-full items-center gap-2.5 overflow-hidden',
        'rounded-md border border-[var(--shell-border)] bg-[var(--shell-soft)]',
        'px-3 py-2.5 mb-3',
        'cursor-pointer transition-colors duration-150',
        'hover:bg-[var(--shell-hover)]',
        collapsed && 'justify-center px-[10px]',
        className,
      )}
    >
      {/* Green presence dot */}
      <span
        className="size-2 shrink-0 rounded-full bg-[var(--success-500)]"
        style={{ boxShadow: '0 0 0 3px rgba(16,185,129,.18)' }}
      />

      {/* Label */}
      {!collapsed && (
        <span className="simex-workspace-label flex-1 whitespace-nowrap text-left">
          <span className="block text-[11px] font-semibold uppercase tracking-[1px] text-[var(--shell-fg-muted)]">
            Espace&nbsp;<strong className="font-bold tracking-[0.5px] text-[var(--shell-fg-strong)]">Apprenant</strong>
          </span>
        </span>
      )}

      {/* Chevron */}
      {!collapsed && (
        <ChevronsUpDown className="simex-workspace-chev ml-auto size-3.5 shrink-0 text-[var(--shell-fg-muted)]" />
      )}
    </button>
  );
}
