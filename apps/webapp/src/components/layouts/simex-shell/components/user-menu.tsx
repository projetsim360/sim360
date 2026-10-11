import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Briefcase, LifeBuoy, Keyboard, LogOut, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { getUserDisplayName } from '@/lib/user-display';
import { useShellState } from '../state/shell-state-provider';
import { useT } from '@/i18n/app/use-t';
import { useAppLocale } from '@/providers/locale-provider';
import { APP_LOCALES } from '@/i18n/app/locale';

interface UserMenuProps {
  className?: string;
}

const ITEM_BASE =
  'flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium no-underline transition-colors hover:bg-muted';

export function UserMenu({ className }: UserMenuProps) {
  const { userMenuOpen, setUserMenuOpen } = useShellState();
  const { user, logout } = useAuth();
  const t = useT();
  const { locale, setLocale } = useAppLocale();
  const menuRef = useRef<HTMLDivElement>(null);

  // Outside-click handler: close when clicking outside this menu
  useEffect(() => {
    if (!userMenuOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [userMenuOpen, setUserMenuOpen]);

  if (!userMenuOpen) return null;

  function close() {
    setUserMenuOpen(false);
  }

  async function handleLogout() {
    close();
    await logout();
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={t('shell.userMenu.label')}
      className={cn(
        'fixed right-4 z-60 min-w-[240px] max-w-[calc(100vw-2rem)] rounded-md border border-border bg-card p-2',
        className,
      )}
      style={{
        top: 'calc(64px + 4px)',
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      {/* Identity */}
      <div className="px-3 pb-2 pt-1.5">
        <div className="truncate text-[13.5px] font-semibold text-foreground">{getUserDisplayName(user)}</div>
        {user?.email && <div className="truncate text-xs text-muted-foreground">{user.email}</div>}
      </div>
      <div className="mx-1 mb-1.5 h-px bg-border" />

      <Link
        to="/settings"
        role="menuitem"
        onClick={close}
        className={cn(ITEM_BASE, 'text-foreground')}
      >
        <User className="size-4 shrink-0 text-muted-foreground" />
        {t('shell.userMenu.profile')}
      </Link>
      <Link
        to="/settings"
        role="menuitem"
        onClick={close}
        className={cn(ITEM_BASE, 'text-foreground')}
      >
        <Settings className="size-4 shrink-0 text-muted-foreground" />
        {t('shell.userMenu.settings')}
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={close}
        disabled
        className={cn(ITEM_BASE, 'text-foreground w-full text-left bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed')}
      >
        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
        {t('shell.userMenu.organization')}
      </button>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <button
        type="button"
        role="menuitem"
        onClick={close}
        disabled
        className={cn(ITEM_BASE, 'text-foreground w-full text-left bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed')}
      >
        <LifeBuoy className="size-4 shrink-0 text-muted-foreground" />
        {t('shell.userMenu.help')}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={close}
        disabled
        className={cn(ITEM_BASE, 'text-foreground w-full text-left bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed')}
      >
        <Keyboard className="size-4 shrink-0 text-muted-foreground" />
        {t('shell.userMenu.shortcuts')}
      </button>

      {/* Language */}
      <div className="mx-1 my-1.5 h-px bg-border" />
      <div className="flex items-center gap-3 px-3 py-1.5 text-[13.5px] text-foreground" role="group" aria-label={t('shell.userMenu.language')}>
        <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1">{t('shell.userMenu.language')}</span>
        <div className="flex rounded-md border border-border p-0.5">
          {APP_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={locale === l}
              lang={l}
              onClick={() => setLocale(l)}
              className={cn(
                'rounded px-2 py-0.5 text-xs font-semibold uppercase transition-colors',
                locale === l ? 'bg-[var(--accent-500)] text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className={cn(ITEM_BASE, 'text-[var(--error-700)] w-full text-left bg-transparent border-0')}
      >
        <LogOut className="size-4 shrink-0 text-[var(--error-500)]" />
        {t('shell.userMenu.signOut')}
      </button>
    </div>
  );
}
