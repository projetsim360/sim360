export type UserDeliverableStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EVALUATED'
  | 'REVISED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'PENDING_APPROVAL';

export type DeliverableDelegationType = 'SELF_PRODUCED' | 'DELEGATED';

export interface DeliverableApproval {
  id: string;
  deliverableId: string;
  reviewerMemberId: string | null;
  reviewerRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment: string | null;
  reviewedAt: string | null;
}

export interface ApprovalStatus {
  chain: Array<{
    role: string;
    memberId: string;
    memberName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comment?: string;
  }> | null;
  approvals: DeliverableApproval[];
  status: string;
}

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
  delegationType: DeliverableDelegationType;
  assignedToMemberId: string | null;
  assignedToMember: {
    id: string;
    name: string;
    role: string;
    expertise: string;
    personality: string;
  } | null;
  assignedToRole: string | null;
  approvalChain: any | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
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
