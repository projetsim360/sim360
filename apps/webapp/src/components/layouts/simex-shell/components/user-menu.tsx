import { useEffect, useRef } from 'react';
import { User, Settings, Briefcase, LifeBuoy, Keyboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { userMenuOpen, setUserMenuOpen } = useShellState();
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

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Menu utilisateur"
      className={cn(
        'fixed right-4 z-60 min-w-[240px] rounded-md border border-border bg-card p-2',
        className,
      )}
      style={{
        top: 'calc(64px + 4px)',
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <User className="size-4 shrink-0 text-muted-foreground" />
        Mon profil
      </a>
      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Settings className="size-4 shrink-0 text-muted-foreground" />
        Paramètres
      </a>
      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
        Mon organisation
      </a>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <LifeBuoy className="size-4 shrink-0 text-muted-foreground" />
        Aide &amp; support
      </a>
      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Keyboard className="size-4 shrink-0 text-muted-foreground" />
        Raccourcis clavier
      </a>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <a
        href="#"
        role="menuitem"
        onClick={close}
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-[var(--error-700)] no-underline transition-colors hover:bg-muted"
      >
        <LogOut className="size-4 shrink-0 text-[var(--error-500)]" />
        Se déconnecter
      </a>
    </div>
  );
}
