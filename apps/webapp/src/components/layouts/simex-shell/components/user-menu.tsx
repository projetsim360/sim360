import { User, Settings, Briefcase, LifeBuoy, Keyboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  return (
    // LOT A: hidden — LOT B will toggle
    <div
      className={cn(
        'hidden absolute right-4 z-60 min-w-[240px] rounded-md border border-border bg-card p-2',
        className,
      )}
      style={{
        top: 'calc(64px - 4px)',
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <User className="size-4 shrink-0 text-muted-foreground" />
        Mon profil
      </a>
      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Settings className="size-4 shrink-0 text-muted-foreground" />
        Paramètres
      </a>
      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Briefcase className="size-4 shrink-0 text-muted-foreground" />
        Mon organisation
      </a>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <LifeBuoy className="size-4 shrink-0 text-muted-foreground" />
        Aide &amp; support
      </a>
      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-foreground no-underline transition-colors hover:bg-muted"
      >
        <Keyboard className="size-4 shrink-0 text-muted-foreground" />
        Raccourcis clavier
      </a>

      {/* Separator */}
      <div className="mx-1 my-1.5 h-px bg-border" />

      <a
        href="#"
        className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13.5px] font-medium text-[var(--error-700)] no-underline transition-colors hover:bg-muted"
      >
        <LogOut className="size-4 shrink-0 text-[var(--error-500)]" />
        Se déconnecter
      </a>
    </div>
  );
}
