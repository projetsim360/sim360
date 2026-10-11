import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';
import { useNotificationContext } from '@/providers/notification-provider';
import { useT } from '@/i18n/app/use-t';
import { relativeDateTime } from '@/i18n/app/format';
import { useAppLocale } from '@/providers/locale-provider';

interface NotifPopoverProps {
  className?: string;
}

export function NotifPopover({ className }: NotifPopoverProps) {
  const { notifOpen, setNotifOpen } = useShellState();
  const popoverRef = useRef<HTMLDivElement>(null);

  const t = useT();
  const { intlLocale } = useAppLocale();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const items = (notifications ?? []).filter((n) => !n.archivedAt).slice(0, 6);

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
      aria-label={t('shell.notifications.title')}
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
        <span className="font-display text-sm font-bold text-foreground">{t('shell.notifications.title')}</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            className="cursor-pointer border-0 bg-transparent text-xs font-medium text-[var(--accent-600)]"
          >
            {t('shell.notifications.markAll')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t('shell.notifications.empty')}</p>
      ) : (
        items.map((n) => (
          <button
            key={n.id}
            type="button"
            className="flex w-full cursor-pointer gap-3 rounded-sm border-0 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-muted"
            onClick={() => {
              if (!n.readAt) void markAsRead(n.id);
              setNotifOpen(false);
            }}
          >
            <span
              className={cn(
                'mt-[6px] size-2 shrink-0 rounded-full',
                n.readAt ? 'border border-[var(--neutral-200)] bg-transparent' : 'bg-[var(--accent-500)]',
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="mb-0.5 block text-[13px] font-semibold text-foreground">{n.title}</span>
              {n.body && <span className="mb-0.5 block truncate text-xs text-muted-foreground">{n.body}</span>}
              <span className="block text-xs text-muted-foreground">{relativeDateTime(n.createdAt, intlLocale)}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}
