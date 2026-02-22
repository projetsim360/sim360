export interface Meeting {
  id: string;
  simulationId: string;
  phaseOrder: number;
  title: string;
  description: string | null;
  type: string;
  objectives: string[];
  durationMinutes: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string | null;
  completedAt: string | null;
  participants: MeetingParticipant[];
  summary: MeetingSummaryRecord | null;
  _count?: { messages: number };
}

export interface MeetingParticipant {
  id: string;
  name: string;
  role: string;
  personality: string | null;
  cooperationLevel: number;
  avatar: string | null;
}

export interface MeetingSummaryRecord {
  id: string;
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{ task: string; assignee: string; deadline?: string }> | null;
  kpiImpact: Record<string, number> | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  participantName?: string;
}

export interface MeetingSummary {
  summary: string;
}

export interface MeetingMessage {
  id: string;
  meetingId: string;
  participantId: string | null;
  content: string;
  role: 'USER' | 'PARTICIPANT' | 'SYSTEM';
  participant?: MeetingParticipant;
  createdAt: string;
}

export interface MeetingDetail extends Meeting {
  messages: MeetingMessage[];
}
