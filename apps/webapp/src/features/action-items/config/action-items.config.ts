import type { ActionItemStatus } from '../types/action-item.types';
import type { AppMessageKey } from '@/i18n/app/messages';

export const ACTION_STATUS_OPTIONS: Array<{ value: ActionItemStatus; label: AppMessageKey }> = [
  { value: 'TODO', label: 'actions.status.TODO' },
  { value: 'IN_PROGRESS', label: 'actions.status.IN_PROGRESS' },
  { value: 'DONE', label: 'actions.status.DONE' },
  { value: 'CANCELLED', label: 'actions.status.CANCELLED' },
];

export const ACTION_STATUS_TONE: Record<ActionItemStatus, string> = {
  TODO: 'bg-[var(--neutral-100)] text-[var(--neutral-700)]',
  IN_PROGRESS: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
  DONE: 'bg-[var(--success-50)] text-[var(--success-700)]',
  CANCELLED: 'bg-[var(--neutral-50)] text-[var(--neutral-400)] line-through',
};

/** `YYYY-MM-DD` for an <input type="date"> from an ISO string. */
export function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

export function isActionOverdue(item: { dueDate: string | null; status: ActionItemStatus }, now: Date = new Date()): boolean {
  if (!item.dueDate || item.status === 'DONE' || item.status === 'CANCELLED') return false;
  const due = new Date(item.dueDate);
  // Due "today" is not overdue: compare against the end of the due day.
  due.setUTCHours(23, 59, 59, 999);
  return due.getTime() < now.getTime();
}

export function formatDueDate(iso: string, locale = 'fr-CA'): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
