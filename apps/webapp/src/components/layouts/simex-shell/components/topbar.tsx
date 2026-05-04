import { PanelLeft, Search, Moon, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 px-5',
        'bg-[var(--brand-700)] text-white',
        className,
      )}
    >
      {/* Left: sidebar toggle + logo */}
      <div className="flex w-[260px] shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Replier la barre latérale"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white/78 transition-colors duration-150 hover:bg-white/8 hover:text-white"
        >
          <PanelLeft className="size-[18px]" />
        </button>

        <Logo onDark />
      </div>

      {/* Search pill trigger — full flex-1, max-w-[760px] */}
      <button
        type="button"
        aria-label="Ouvrir la recherche"
        className={cn(
          'flex flex-1 max-w-[760px] h-10 cursor-pointer items-center gap-2.5',
          'rounded-md border border-white/10 bg-white/8',
          'px-3.5 text-sm transition-colors duration-150',
          'hover:border-[var(--accent-500)]',
        )}
      >
        <Search className="size-4 shrink-0 text-white/55" />
        <span className="flex-1 text-left text-white/55 text-sm pointer-events-none select-none">
          Rechercher pages, livrables, candidats…
        </span>
        <kbd
          className={cn(
            'inline-flex shrink-0 items-center rounded-xs',
            'border border-white/10 bg-white/6',
            'px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.03em] text-white/78',
          )}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right actions cluster */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Theme toggle (visual only, LOT A) */}
        <button
          type="button"
          aria-label="Thème"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white/78 transition-colors duration-150 hover:bg-white/8 hover:text-white"
        >
          <Moon className="size-[18px]" />
        </button>

        {/* Notification bell with red dot */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white/78 transition-colors duration-150 hover:bg-white/8 hover:text-white"
        >
          <Bell className="size-[18px]" />
          {/* Red unread dot */}
          <span
            className="absolute right-2 top-[7px] size-2 rounded-full bg-[var(--error-500)]"
            style={{ border: '2px solid var(--brand-700)' }}
          />
        </button>

        {/* Agent PMO pill */}
        <button
          type="button"
          className={cn(
            'ml-1.5 inline-flex cursor-pointer items-center gap-2',
            'rounded-full border border-[var(--neutral-100)] bg-white',
            'px-3.5 py-2 text-[13px] font-semibold text-[var(--brand-700)]',
            'transition-transform duration-150 hover:-translate-y-px',
            'hover:shadow-[0_4px_8px_rgba(15,26,46,.08)]',
          )}
        >
          <Sparkles className="size-4 shrink-0 text-[var(--accent-500)]" />
          Agent PMO
        </button>

        {/* User chip: meta (right-aligned) + Avatar + chevron */}
        <button
          type="button"
          aria-haspopup="true"
          className={cn(
            'ml-1 flex cursor-pointer items-center gap-2.5',
            'rounded-md border-0 bg-transparent px-1.5 py-1',
            'transition-colors duration-150 hover:bg-white/8',
          )}
        >
          {/* Meta column — text right-aligned */}
          <div className="flex flex-col items-end gap-px leading-none">
            <span className="text-[13px] font-semibold text-white">Admin Sim360</span>
            <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--accent-400)]">
              Mentor
            </span>
          </div>

          {/* Avatar — orange gradient */}
          <Avatar className="size-9 shrink-0">
            <AvatarFallback
              className={cn(
                'size-9 rounded-full text-[13px] font-bold text-white border-0',
                'bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)]',
              )}
            >
              AS
            </AvatarFallback>
          </Avatar>

          <ChevronDown className="size-3.5 shrink-0 text-white/55" />
        </button>
      </div>
    </header>
  );
}
