import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceSwitcherProps {
  className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 overflow-hidden',
        'rounded-md border border-white/10 bg-white/6',
        'px-3 py-2.5 mb-3',
        'cursor-pointer transition-colors duration-150',
        'hover:bg-white/10',
        className,
      )}
    >
      {/* Green presence dot */}
      <span
        className="size-2 shrink-0 rounded-full bg-[var(--success-500)]"
        style={{ boxShadow: '0 0 0 3px rgba(16,185,129,.18)' }}
      />

      {/* Label */}
      <span className="flex-1 whitespace-nowrap text-left">
        <span className="block text-[11px] font-semibold uppercase tracking-[1px] text-white/55">
          Espace&nbsp;<strong className="font-bold tracking-[0.5px] text-white">Apprenant</strong>
        </span>
      </span>

      {/* Chevron */}
      <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-white/55" />
    </button>
  );
}
