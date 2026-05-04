import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';

interface NotifPopoverProps {
  className?: string;
}

export function NotifPopover({ className }: NotifPopoverProps) {
  const { notifOpen, setNotifOpen } = useShellState();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Track unread state (visual only — no persistence)
  const [hasUnread, setHasUnread] = useState(true);

  // Outside-click handler: close when clicking outside this popover
  useEffect(() => {
    if (!notifOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }

    // Use mousedown so it fires before the click on the bell button
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [notifOpen, setNotifOpen]);

  if (!notifOpen) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Notifications"
      className={cn(
        'fixed z-60 min-w-[320px] max-w-[calc(100vw-2rem)] rounded-md border border-border bg-card p-2',
        'right-4 lg:right-[280px]',
        className,
      )}
      style={{
        top: 'calc(64px + 4px)',
        boxShadow: 'var(--elevation-lg)',
      }}
    >
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between border-b border-border px-3 pb-2.5 pt-2.5">
        <span className="font-display text-sm font-bold text-foreground">Notifications</span>
        <button
          type="button"
          onClick={() => setHasUnread(false)}
          className="cursor-pointer border-0 bg-transparent text-xs font-medium text-[var(--accent-600)]"
        >
          Tout marquer lu
        </button>
      </div>

      {/* Notification item 1 */}
      <div
        className="flex cursor-pointer gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-muted"
        onClick={() => setNotifOpen(false)}
      >
        <span
          className={cn(
            'mt-[6px] size-2 shrink-0 rounded-full',
            hasUnread ? 'bg-[var(--accent-500)]' : 'border border-[var(--neutral-200)] bg-transparent',
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[13px] font-semibold text-foreground">
            Nouveau livrable soumis : Charte de projet
          </div>
          <div className="text-xs text-muted-foreground">
            il y a 4 minutes · Déploiement ERP GlobalFinance
          </div>
        </div>
      </div>

      {/* Notification item 2 */}
      <div
        className="flex cursor-pointer gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-muted"
        onClick={() => setNotifOpen(false)}
      >
        <span
          className={cn(
            'mt-[6px] size-2 shrink-0 rounded-full',
            hasUnread ? 'bg-[var(--accent-500)]' : 'border border-[var(--neutral-200)] bg-transparent',
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[13px] font-semibold text-foreground">
            Phase suivante débloquée
          </div>
          <div className="text-xs text-muted-foreground">
            il y a 1 heure · Exécution &amp; redressement
          </div>
        </div>
      </div>

      {/* Notification item 3 — always read */}
      <div
        className="flex cursor-pointer gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-muted"
        onClick={() => setNotifOpen(false)}
      >
        <span className="mt-[6px] size-2 shrink-0 rounded-full border border-[var(--neutral-200)] bg-transparent" />
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 text-[13px] font-semibold text-foreground">
            Feedback IA disponible
          </div>
          <div className="text-xs text-muted-foreground">
            hier · Cadrage périmètre
          </div>
        </div>
      </div>
    </div>
  );
}
