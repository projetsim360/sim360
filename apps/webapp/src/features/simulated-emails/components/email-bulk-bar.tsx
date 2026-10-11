import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/app/use-t';

interface EmailBulkBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function EmailBulkBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onMarkRead,
  onArchive,
  onCancel,
  isPending,
}: EmailBulkBarProps) {
  const t = useT();
  const allSelected = selectedCount === totalCount;

  return (
    <div
      role="toolbar"
      aria-label={t('emails.bulkActions')}
      className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-md bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 border border-[var(--brand-100)] dark:border-[var(--brand-900)]/60"
    >
      <span
        aria-live="polite"
        aria-atomic="true"
        className="font-semibold text-sm text-[var(--brand-700)] dark:text-[var(--brand-300)]"
      >
        {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>

      {!allSelected && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="text-xs text-[var(--brand-700)] dark:text-[var(--brand-300)] h-auto p-0 underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]"
        >
          Tout sélectionner ({totalCount})
        </Button>
      )}

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={onMarkRead}
        disabled={isPending}
        className="gap-1.5"
      >
        <KeenIcon icon="sms-open" style="duotone" className="size-3.5" />
        <span className="hidden sm:inline">{t('emails.markRead')}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onArchive}
        disabled={isPending}
        className="gap-1.5"
      >
        <KeenIcon icon="archive" style="duotone" className="size-3.5" />
        <span className="hidden sm:inline">{t('emails.archive')}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isPending}
        className="gap-1"
      >
        <KeenIcon icon="cross" style="solid" className="size-3" />
        <span className="hidden sm:inline">{t('common.cancel')}</span>
      </Button>
    </div>
  );
}
