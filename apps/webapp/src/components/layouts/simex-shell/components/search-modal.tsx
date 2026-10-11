import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, MonitorPlay, PlusCircle, Mail, Award, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';
import { useT } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';

interface SearchModalProps {
  className?: string;
}

const PAGES: { label: AppMessageKey; path: string; icon: typeof Search }[] = [
  { label: 'menu.dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'menu.mySimulations', path: '/simulations', icon: MonitorPlay },
  { label: 'menu.newSimulation', path: '/simulations/new', icon: PlusCircle },
  { label: 'menu.inbox', path: '/emails/inbox', icon: Mail },
  { label: 'menu.myBadges', path: '/profile/badges', icon: Award },
  { label: 'menu.settings', path: '/settings', icon: Settings },
];

/** ⌘K palette: jump to an application page. Arrow keys move, Enter opens, Escape closes. */
export function SearchModal({ className }: SearchModalProps) {
  const { searchOpen, closeSearch } = useShellState();
  const t = useT();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return PAGES.filter((p) => !q || t(p.label).toLocaleLowerCase().includes(q));
  }, [query, t]);

  if (!searchOpen) return null;

  const open = (path: string) => {
    closeSearch();
    navigate(path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      open(results[active].path);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('shell.search.label')}
      className={cn(
        'fixed inset-0 z-[200] flex items-start justify-center bg-[rgba(15,26,46,0.18)] pt-[12vh] backdrop-blur-[6px] backdrop-saturate-[1.2]',
        className,
      )}
      onClick={closeSearch}
    >
      <div
        className="w-[min(640px,92vw)] overflow-hidden rounded-lg border border-border bg-card shadow-[var(--elevation-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-3.5">
          <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t('shell.search.placeholder')}
            aria-label={t('shell.search.label')}
            className="flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-xs border border-border px-[7px] py-[3px] text-[11px] font-semibold text-muted-foreground">
            {t('shell.search.esc')}
          </kbd>
        </div>

        <div className="p-2" role="listbox" aria-label={t('shell.search.pages')}>
          <div className="px-3 py-2 text-[10px] font-bold tracking-[1.2px] text-muted-foreground uppercase">
            {t('shell.search.pages')}
          </div>
          {results.length === 0 && (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">{t('shell.search.empty')}</p>
          )}
          {results.map((page, i) => {
            const Icon = page.icon;
            return (
              <button
                key={page.path}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => open(page.path)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm border-0 px-3 py-2.5 text-left text-sm transition-colors',
                  i === active ? 'bg-[var(--accent-50)] text-[var(--accent-700)]' : 'bg-transparent text-foreground',
                )}
              >
                <Icon className={cn('size-4 shrink-0', i === active ? 'text-[var(--accent-600)]' : 'text-muted-foreground')} aria-hidden="true" />
                {t(page.label)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↑</kbd>
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↓</kbd>
            {t('shell.search.navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↵</kbd>
            {t('shell.search.open')}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">{t('shell.search.esc')}</kbd>
            {t('shell.search.close')}
          </span>
        </div>
      </div>
    </div>
  );
}
