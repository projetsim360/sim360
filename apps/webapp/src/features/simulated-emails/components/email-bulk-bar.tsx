import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';

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
  onArchive,
  onCancel,
  isPending,
  onMarkRead,
}: EmailBulkBarProps) {
  const allSelected = selectedCount === totalCount;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-md bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 border border-[var(--brand-100)] dark:border-[var(--brand-900)]/60">
      <span className="font-semibold text-sm text-[var(--brand-700)] dark:text-[var(--brand-300)]">
        {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>

      {!allSelected && (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs underline text-[var(--brand-700)] dark:text-[var(--brand-300)] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] rounded"
        >
          Tout sélectionner ({totalCount})
        </button>
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
        <span className="hidden sm:inline">Marquer comme lu</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onArchive}
        disabled={isPending}
        className="gap-1.5"
      >
        <KeenIcon icon="archive" style="duotone" className="size-3.5" />
        <span className="hidden sm:inline">Archiver</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isPending}
        className="gap-1"
      >
        <KeenIcon icon="cross" style="solid" className="size-3" />
        <span className="hidden sm:inline">Annuler</span>
      </Button>
    </div>
  );
}
