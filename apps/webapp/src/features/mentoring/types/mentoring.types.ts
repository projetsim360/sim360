export interface MentorReview {
  id: string;
  evaluationId: string;
  mentorId: string;
  humanScore: number;
  leadershipScore: number | null;
  diplomacyScore: number | null;
  postureScore: number | null;
  feedback: string;
  recommendations: string | null;
  createdAt: string;
  deliverable?: {
    title: string;
  };
  score?: number;
  grade?: string;
}

export interface MentoringSession {
  id: string;
  simulationId: string;
  mentorId: string;
  learnerId: string;
  type: string;
  status: string;
  notes: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  messages: MentoringMessage[];
}

export interface MentoringMessage {
  id: string;
  senderId: string;
  role: string;
  content: string;
  createdAt: string;
}
