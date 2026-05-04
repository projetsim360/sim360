import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Briefcase, LifeBuoy, Keyboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useShellState } from '../state/shell-state-provider';

interface UserMenuProps {
  className?: string;
}

const ITEM_BASE =
  'flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium no-underline transition-colors hover:bg-muted';

export function UserMenu({ className }: UserMenuProps) {
  const { userMenuOpen, setUserMenuOpen } = useShellState();
  const { logout } = useAuth();
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
      aria-label="Menu utilisateur"
      className={cn(
        'fixed right-4 z-60 min-w-[240px] max-w-[calc(100vw-2rem)] rounded-md border border-border bg-card p-2',
        className,
      )}
      style={{
        top: 'calc(64px + 4px)',
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      <Link
        to="/profile/edit"
        role="menuitem"
        onClick={close}
        className={cn(ITEM_BASE, 'text-foreground')}
      >
        <User className="size-4 shrink-0 text-muted-foreground" />
        Mon profil
      </Link>
      <Link
        to="/settings"
        role="menuitem"
        onClick={close}
        className={cn(ITEM_BASE, 'text-foreground')}
      >
        <Settings className="size-4 shrink-0 text-muted-foreground" />
        Paramètres
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={close}
        disabled
        className={cn(ITEM_BASE, 'text-foreground w-full text-left bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed')}
      >
        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
        Mon organisation
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
        Aide &amp; support
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={close}
        disabled
        className={cn(ITEM_BASE, 'text-foreground w-full text-left bg-transparent border-0 disabled:opacity-50 disabled:cursor-not-allowed')}
      >
        <Keyboard className="size-4 shrink-0 text-muted-foreground" />
        Raccourcis clavier
      </button>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className={cn(ITEM_BASE, 'text-[var(--error-700)] w-full text-left bg-transparent border-0')}
      >
        <LogOut className="size-4 shrink-0 text-[var(--error-500)]" />
        Se déconnecter
      </button>
    </div>
  );
}
