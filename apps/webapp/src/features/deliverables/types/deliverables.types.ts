export type UserDeliverableStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EVALUATED'
  | 'REVISED'
  | 'VALIDATED'
  | 'REJECTED';

export interface UserDeliverable {
  id: string;
  simulationId: string;
  templateId?: string;
  phaseOrder: number;
  title: string;
  type: string;
  content?: string;
  status: UserDeliverableStatus;
  revisionNumber: number;
  maxRevisions: number;
  dueDate?: string;
  submittedAt?: string;
  lastSavedAt?: string;
  meetingId?: string;
  evaluations?: DeliverableEvaluation[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableEvaluation {
  id: string;
  deliverableId: string;
  revisionNumber: number;
  score: number;
  grade: string;
  positives: string[];
  improvements: string[];
  missingElements: string[];
  incorrectElements: string[];
  recommendations: string[];
  pmiOutputsCovered: string[];
  pmiOutputsMissing: string[];
  aiGeneratedCR?: string;
  createdAt: string;
}

export interface DeliverableTemplate {
  id: string;
  title: string;
  type: string;
  phase: string;
  content: string;
  evaluationCriteria: Record<string, unknown>;
  pmiProcess?: string;
  referenceExample?: string;
}

export interface DeliverableFilters {
  phase?: number;
  status?: UserDeliverableStatus;
}

export interface CreateDeliverableDto {
  templateId?: string;
  title: string;
  type: string;
  phaseOrder: number;
}
