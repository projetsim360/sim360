/** Pure helpers for follow-up actions (kept free of Nest/Prisma for unit tests). */

export const ACTION_ITEM_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;
export type ActionItemStatusValue = (typeof ACTION_ITEM_STATUSES)[number];

export interface SummaryActionItem {
  task?: unknown;
  assignee?: unknown;
  deadline?: unknown;
}

export interface ActionItemSeed {
  title: string;
  assignee: string | null;
  dueDate: Date | null;
  dueLabel: string | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T.*)?$/;

/**
 * Converts the untyped `MeetingSummary.actionItems` JSON produced at meeting completion
 * into rows to insert. Invalid entries are dropped; ISO dates become `dueDate`, any other
 * deadline text is kept as `dueLabel`.
 */
export function seedsFromSummary(json: unknown): ActionItemSeed[] {
  if (!Array.isArray(json)) return [];
  const seeds: ActionItemSeed[] = [];
  for (const raw of json as SummaryActionItem[]) {
    if (!raw || typeof raw !== 'object') continue;
    const title = typeof raw.task === 'string' ? raw.task.trim() : '';
    if (!title) continue;
    const assignee = typeof raw.assignee === 'string' && raw.assignee.trim() ? raw.assignee.trim() : null;
    const deadline = typeof raw.deadline === 'string' ? raw.deadline.trim() : '';
    let dueDate: Date | null = null;
    let dueLabel: string | null = null;
    if (deadline) {
      const parsed = ISO_DATE.test(deadline) ? new Date(deadline) : null;
      if (parsed && !Number.isNaN(parsed.getTime())) dueDate = parsed;
      else dueLabel = deadline;
    }
    seeds.push({ title, assignee, dueDate, dueLabel });
  }
  return seeds;
}

/** True when the action is late: has a due date in the past and is still open. */
export function isOverdue(item: { dueDate: Date | string | null; status: string }, now: Date = new Date()): boolean {
  if (!item.dueDate) return false;
  if (item.status === 'DONE' || item.status === 'CANCELLED') return false;
  return new Date(item.dueDate).getTime() < now.getTime();
}
