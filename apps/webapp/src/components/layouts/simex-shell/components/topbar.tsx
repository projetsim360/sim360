import { useEffect, useState } from 'react';
import { PanelLeft, Menu, Search, Moon, Sun, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { resolveAssetUrl } from '@/lib/asset-url';
import { roleLabelKey, getUserDisplayName, getUserInitials } from '@/lib/user-display';
import { useAuth } from '@/providers/auth-provider';
import { useShellState } from '../state/shell-state-provider';
import { useT } from '@/i18n/app/use-t';

interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  const t = useT();
  const {
    toggleSidebar,
    toggleSidebarMobile,
    openSearch,
    toggleNotif,
    toggleUserMenu,
    togglePmo,
    notifOpen,
    userMenuOpen,
    pmoOpen,
  } = useShellState();
  const { user } = useAuth();
  const avatarSrc = resolveAssetUrl(user?.avatar);

  // Theme toggle — handle mounted state to avoid hydration mismatch
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header
      className={cn(
        'simex-topbar fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-5',
        'text-[var(--shell-fg,rgba(255,255,255,.78))]',
        className,
      )}
    >
      {/* Left: sidebar toggle + logo */}
      <div
        className="simex-topbar-left flex shrink-0 items-center gap-3 sm:gap-4 overflow-hidden lg:w-[260px]"
        style={{ transition: 'width 220ms var(--ease-out)' }}
      >
        {/* Mobile hamburger — only on < lg */}
        <button
          type="button"
          aria-label={t('shell.topbar.openSidebar')}
          onClick={toggleSidebarMobile}
          className="lg:hidden inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--shell-fg)] transition-colors duration-150 hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]"
        >
          <Menu className="size-[18px]" />
        </button>

        {/* Desktop panel-left — only on lg+ */}
        <button
          type="button"
          aria-label={t('shell.topbar.collapseSidebar')}
          onClick={toggleSidebar}
          className="hidden lg:inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--shell-fg)] transition-colors duration-150 hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]"
        >
          <PanelLeft className="size-[18px]" />
        </button>

        {/* Logo — Simex + dot + pro — visible at all breakpoints */}
        <div className="flex shrink-0 items-center gap-1.5 select-none overflow-hidden">
          <span
            className="simex-logo-text font-display text-[22px] font-extrabold tracking-[-0.01em] text-[var(--shell-fg-strong,#fff)]"
            style={{ transition: 'opacity 150ms var(--ease-out)' }}
          >
            Simex
          </span>
          <span className="size-2 shrink-0 rounded-full bg-[var(--accent-500)]" />
          <span
            className="simex-logo-text font-display text-[22px] font-extrabold tracking-[-0.01em] text-[var(--accent-500)]"
            style={{ transition: 'opacity 150ms var(--ease-out)' }}
          >
            pro
          </span>
        </div>
      </div>

      {/* Search — full pill on md+, icon-only on < md */}
      {/* Icon-only button: mobile/tablet < md */}
      <button
        type="button"
        aria-label={t('shell.topbar.openSearch')}
        onClick={openSearch}
        className="md:hidden inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[var(--shell-border)] bg-[var(--shell-input)] text-[var(--shell-fg-muted)] transition-colors duration-150 hover:border-[var(--accent-500)]"
      >
        <Search className="size-4" />
      </button>

      {/* Full pill: md+ */}
      <button
        type="button"
        aria-label={t('shell.topbar.openSearchShortcut')}
        onClick={openSearch}
        className={cn(
          'hidden md:flex flex-1 max-w-[760px] h-10 cursor-pointer items-center gap-2.5',
          'rounded-md border border-[var(--shell-border)] bg-[var(--shell-input)]',
          'px-3.5 text-sm transition-colors duration-150',
          'hover:border-[var(--accent-500)]',
        )}
      >
        <Search className="size-4 shrink-0 text-[var(--shell-fg-muted)]" />
        <span className="flex-1 text-left text-[var(--shell-fg-muted)] text-sm pointer-events-none select-none">
          {t('shell.search.placeholder')}
        </span>
        <kbd
          className={cn(
            'inline-flex shrink-0 items-center rounded-xs',
            'border border-[var(--shell-border)] bg-[var(--shell-soft)]',
            'px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.03em] text-[var(--shell-fg)]',
          )}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right actions cluster */}
      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        {/* Theme toggle */}
        <button
          type="button"
          aria-label={isDark ? t('shell.topbar.lightTheme') : t('shell.topbar.darkTheme')}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--shell-fg)] transition-colors duration-150 hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]"
        >
          {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>

        {/* Notification bell */}
        <button
          type="button"
          aria-label={t('shell.notifications.title')}
          aria-expanded={notifOpen}
          aria-haspopup="true"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleNotif();
          }}
          className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--shell-fg)] transition-colors duration-150 hover:bg-[var(--shell-hover)] hover:text-[var(--shell-fg-strong)]"
        >
          <Bell className="size-[18px]" />
          {/* Unread dot */}
          <span
            className="absolute right-2 top-[7px] size-2 rounded-full bg-[var(--error-500)]"
            style={{ border: '2px solid var(--shell-bell-ring, var(--brand-700))' }}
          />
        </button>

        {/* Agent PMO pill */}
        <button
          type="button"
          aria-label={t('shell.topbar.assistant')}
          aria-pressed={pmoOpen}
          onClick={(e) => {
            e.stopPropagation();
            togglePmo();
          }}
          className={cn(
            'ml-1 sm:ml-1.5 inline-flex cursor-pointer items-center gap-1.5 sm:gap-2',
            'rounded-full border border-[var(--neutral-100)] bg-white',
            'px-2.5 sm:px-3.5 py-2 text-[13px] font-semibold text-[var(--brand-700)]',
            'transition-transform duration-150 hover:-translate-y-px',
            'hover:shadow-[0_4px_8px_rgba(15,26,46,.08)]',
            pmoOpen && 'shadow-[0_4px_8px_rgba(15,26,46,.12)]',
          )}
        >
          <Sparkles className="size-4 shrink-0 text-[var(--accent-500)]" />
          <span className="hidden sm:inline">{t('shell.topbar.assistant')}</span>
        </button>

        {/* User chip */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={userMenuOpen}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleUserMenu();
          }}
          className={cn(
            'ml-0.5 sm:ml-1 flex cursor-pointer items-center gap-2 sm:gap-2.5',
            'rounded-md border-0 bg-transparent px-1 sm:px-1.5 py-1',
            'transition-colors duration-150 hover:bg-[var(--shell-hover)]',
          )}
        >
          {/* Meta column — hidden on < sm */}
          <div className="hidden sm:flex flex-col items-end gap-px leading-none">
            <span className="max-w-[180px] truncate text-[13px] font-semibold text-[var(--shell-fg-strong)]">
              {getUserDisplayName(user)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--accent-400)]">
              {t(roleLabelKey(user?.role))}
            </span>
          </div>

          {/* Avatar */}
          <Avatar className="size-9 shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={getUserDisplayName(user)} className="object-cover" />}
            <AvatarFallback
              className={cn(
                'size-9 rounded-full text-[13px] font-bold text-white border-0',
                'bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)]',
              )}
            >
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          <ChevronDown className="size-3.5 shrink-0 text-[var(--shell-fg-muted)] hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
