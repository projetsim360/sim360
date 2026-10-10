export type ActionItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface ActionItem {
  id: string;
  simulationId: string;
  meetingId: string | null;
  meeting: { id: string; title: string } | null;
  title: string;
  assignee: string | null;
  dueDate: string | null;
  dueLabel: string | null;
  status: ActionItemStatus;
  source: 'MEETING_SUMMARY' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionItemInput {
  title: string;
  assignee?: string;
  dueDate?: string;
  meetingId?: string;
}

export interface UpdateActionItemInput {
  title?: string;
  assignee?: string | null;
  dueDate?: string | null;
  status?: ActionItemStatus;
}
