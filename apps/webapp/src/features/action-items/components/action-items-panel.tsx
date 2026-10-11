import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableCombobox } from '@/components/common/searchable-combobox';
import { cn } from '@/lib/utils';
import { useActionItems } from '../hooks/use-action-items';
import {
  ACTION_STATUS_OPTIONS,
  ACTION_STATUS_TONE,
  formatDueDate,
  isActionOverdue,
  toDateInputValue,
} from '../config/action-items.config';
import type { ActionItem, ActionItemStatus } from '../types/action-item.types';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

interface ActionItemsPanelProps {
  simulationId: string;
  /** Restrict to (and attach new actions to) one meeting. */
  meetingId?: string;
  /** Names offered as owners (meeting participants). "Chef de projet" is always offered. */
  assigneeSuggestions?: string[];
  title?: string;
  /** Show which meeting each action comes from (simulation-wide view). */
  showMeeting?: boolean;
}


export function ActionItemsPanel({
  simulationId,
  meetingId,
  assigneeSuggestions = [],
  title,
  showMeeting = false,
}: ActionItemsPanelProps) {
  const { intlLocale } = useAppLocale();
  const t = useT();
  const { query, create, update, remove } = useActionItems(simulationId, meetingId);
  const items = query.data ?? [];

  const assigneeOptions = useMemo(() => {
    const names = new Set<string>([t('actions.pmLabel'), ...assigneeSuggestions]);
    for (const it of items) if (it.assignee) names.add(it.assignee);
    return [...names].map((n) => ({ value: n, label: n }));
  }, [assigneeSuggestions, items, t]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftAssignee, setDraftAssignee] = useState('');
  const [draftDue, setDraftDue] = useState('');
  const [toDelete, setToDelete] = useState<ActionItem | null>(null);

  const openCount = items.filter((i) => i.status === 'TODO' || i.status === 'IN_PROGRESS').length;

  const submit = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) return;
    create.mutate(
      {
        title: trimmed,
        assignee: draftAssignee || undefined,
        dueDate: draftDue || undefined,
        meetingId,
      },
      {
        onSuccess: () => {
          setDraftTitle('');
          setDraftAssignee('');
          setDraftDue('');
        },
      },
    );
  };

  const patch = (item: ActionItem, input: Parameters<typeof update.mutate>[0]['input']) =>
    update.mutate({ id: item.id, input });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
          <KeenIcon icon="clipboard" style="duotone" className="size-4 text-[var(--accent-500)]" />
          {title ?? t('actions.title')}
          <span className="inline-flex items-center justify-center rounded-full bg-[var(--accent-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent-700)]">
            {openCount} ouverte{openCount > 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {query.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        )}

        {query.isError && (
          <p className="text-sm text-destructive">{t('actions.loadError')}</p>
        )}

        {!query.isLoading && items.length === 0 && !query.isError && (
          <p className="text-sm text-[var(--neutral-500)]">
            {t('actions.empty')}
          </p>
        )}

        {items.map((item) => {
          const overdue = isActionOverdue(item);
          const closed = item.status === 'DONE' || item.status === 'CANCELLED';
          return (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                overdue ? 'border-[var(--error-200)] bg-[var(--error-50)]/40' : 'border-[var(--neutral-200)]',
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  aria-label={closed ? t('actions.reopen') : t('actions.markDone')}
                  onClick={() => patch(item, { status: closed ? 'TODO' : 'DONE' })}
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border',
                    item.status === 'DONE'
                      ? 'border-[var(--success-500)] bg-[var(--success-500)] text-white'
                      : 'border-[var(--neutral-300)] bg-transparent hover:border-[var(--accent-500)]',
                  )}
                >
                  {item.status === 'DONE' && <KeenIcon icon="check" style="outline" className="text-xs" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium text-foreground break-words', closed && 'text-[var(--neutral-500)] line-through')}>
                    {item.title}
                  </p>
                  {showMeeting && item.meeting && (
                    <p className="mt-0.5 text-[11px] text-[var(--neutral-500)]">{t('actions.meetingColon', { title: item.meeting.title })}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={t('actions.delete')}
                  onClick={() => setToDelete(item)}
                  className="shrink-0 cursor-pointer rounded p-1 text-[var(--neutral-400)] hover:bg-[var(--neutral-100)] hover:text-[var(--error-600)]"
                >
                  <KeenIcon icon="trash" style="duotone" className="text-sm" />
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <SearchableCombobox
                  value={item.assignee ?? ''}
                  onChange={(v) => patch(item, { assignee: v || null })}
                  options={assigneeOptions}
                  placeholder={t('actions.owner')}
                  searchPlaceholder={t('actions.ownerSearch')}
                  allowCustom
                  customLabel={(q) => t('actions.assignTo', { name: q })}
                  className="h-8 text-xs"
                />
                <div className="flex flex-col gap-0.5">
                  <Input
                    type="date"
                    aria-label={t('actions.due')}
                    value={toDateInputValue(item.dueDate)}
                    onChange={(e) => patch(item, { dueDate: e.target.value || null })}
                    className={cn('h-8 text-xs', overdue && 'border-[var(--error-400)] text-[var(--error-700)]')}
                  />
                  {!item.dueDate && item.dueLabel && (
                    <span className="text-[10px] text-[var(--neutral-500)]">Suggestion : {item.dueLabel}</span>
                  )}
                  {overdue && item.dueDate && (
                    <span className="text-[10px] font-semibold text-[var(--error-700)]">
                      {t('actions.overdueSince', { date: formatDueDate(item.dueDate, intlLocale) })}
                    </span>
                  )}
                </div>
                <Select value={item.status} onValueChange={(v) => patch(item, { status: v as ActionItemStatus })}>
                  <SelectTrigger aria-label={t('actions.statusLabel')} className={cn('h-8 text-xs', ACTION_STATUS_TONE[item.status])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {t(opt.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}

        {/* New action */}
        <form
          className="rounded-lg border border-dashed border-[var(--neutral-300)] p-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            aria-label={t('actions.new')}
            placeholder={t('actions.newPh')}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            maxLength={500}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_160px_auto]">
            <SearchableCombobox
              value={draftAssignee}
              onChange={setDraftAssignee}
              options={assigneeOptions}
              placeholder={t('actions.owner')}
              searchPlaceholder={t('actions.ownerSearch')}
              allowCustom
              customLabel={(q) => t('actions.assignTo', { name: q })}
            />
            <Input type="date" aria-label={t('actions.due')} value={draftDue} onChange={(e) => setDraftDue(e.target.value)} />
            <Button type="submit" variant="primary" size="sm" disabled={!draftTitle.trim() || create.isPending}>
              <KeenIcon icon="plus" style="solid" />
              {t('common.add')}
            </Button>
          </div>
        </form>
      </CardContent>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>« {toDelete?.title} » sera définitivement supprimée.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) remove.mutate(toDelete.id);
                setToDelete(null);
              }}
            >
              {t('actions.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
