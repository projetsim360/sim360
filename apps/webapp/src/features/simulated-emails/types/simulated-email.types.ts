export type EmailPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
export type EmailStatus = 'UNREAD' | 'READ' | 'RESPONDED' | 'ARCHIVED';

export interface SimulatedEmail {
  id: string;
  simulationId: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  subject: string;
  body: string;
  priority: EmailPriority;
  status: EmailStatus;
  phaseOrder: number;
  triggerType?: string;
  userResponse?: string;
  responseScore?: number;
  responseFeedback?: string;
  respondedAt?: string;
  scheduledAt: string;
  readAt?: string;
  createdAt: string;
}

export interface EmailFilters {
  status?: EmailStatus;
  priority?: EmailPriority;
  phase?: number;
}

export interface RespondToEmailDto {
  response: string;
}
