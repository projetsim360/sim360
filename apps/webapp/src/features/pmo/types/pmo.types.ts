export interface PmoMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PmoContext {
  simulation: { id: string; status: string; currentPhaseOrder: number };
  scenario: { title: string; sector: string; difficulty: string; objectives: string[]; projectTemplate: Record<string, unknown> };
  currentPhase: { name: string; type: string; status: string; order: number } | null;
  kpis: {
    budget: number;
    schedule: number;
    quality: number;
    teamMorale: number;
    riskLevel: number;
  } | null;
  deliverables: {
    submitted: Array<{ title: string; type: string; status: string; latestScore: number | null; latestGrade: string | null }>;
    pending: Array<{ title: string; type: string; phaseOrder: number; dueDate: string | null }>;
  };
  decisions: Array<{ title: string; selectedOption: number | null; phaseOrder: number }>;
  activeEvents: Array<{ title: string; type: string; severity: string }>;
  templates: Array<{ id: string; title: string; type: string; phase: string }>;
  referenceDocuments: Array<{ id: string; title: string; category: string; phase: string | null }>;
}

export interface PmoHistoryResponse {
  data: PmoMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
