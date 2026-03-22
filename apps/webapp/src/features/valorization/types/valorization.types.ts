export interface CompetencyScores {
  planification: number;
  communication: number;
  risques: number;
  leadership: number;
  rigueur: number;
  adaptabilite: number;
}

export interface CvSuggestions {
  experienceLines: string[];
  skillsToHighlight: string[];
  cvDraft?: string;
  firstCvDraft?: string;
}

export interface CompetencyBadge {
  id: string;
  userId: string;
  simulationId: string;
  title: string;
  description: string;
  scenarioTitle: string;
  sector: string;
  difficulty: string;
  globalScore: number;
  competencyScores: CompetencyScores;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  debriefingSummary?: string;
  cvSuggestions?: CvSuggestions;
  shareToken?: string;
  isPublic: boolean;
  durationMinutes?: number;
  createdAt: string;
}

export interface PortfolioDeliverableEvaluation {
  id: string;
  revisionNumber: number;
  score: number | null;
  grade: string | null;
  positives: string[];
  improvements: string[];
  missingElements: string[];
  recommendations: string[];
  createdAt: string;
}

export interface PortfolioDeliverable {
  id: string;
  title: string;
  type: string;
  phaseOrder: number;
  status: string;
  revisionNumber: number;
  content?: string | null;
  evaluation: PortfolioDeliverableEvaluation | null;
  /** Computed shorthand for evaluation.score */
  score?: number | null;
  /** Computed shorthand for evaluation.grade */
  grade?: string | null;
}

export interface PortfolioData {
  simulation: {
    id: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    totalDurationMinutes: number | null;
    scenario: { id: string; title: string; sector: string; difficulty: string; description: string | null };
    project: { id: string; name: string; client: string | null; sector: string; description: string | null };
  };
  scenario: { id: string; title: string; sector: string; difficulty: string; description: string | null };
  kpis: { budget: number; schedule: number; quality: number; teamMorale: number; riskLevel: number } | null;
  phases: { id: string; name: string; order: number; status: string }[];
  badge: CompetencyBadge | null;
  deliverables: PortfolioDeliverable[];
  meetings: { id: string; title: string; status: string; phaseOrder: number }[];
  decisions: { id: string; title: string; selectedOption: number | null; phaseOrder: number }[];
  stats: {
    totalDeliverables: number;
    evaluatedDeliverables: number;
    validatedDeliverables: number;
    averageDeliverableScore: number | null;
    totalMeetings: number;
    completedMeetings: number;
    totalDecisions: number;
    phasesCompleted: number;
    totalPhases: number;
  };
}

export interface DebriefingData {
  simulationId: string;
  scenarioTitle: string;
  projectName: string;
  globalScore: number;
  competencyScores: CompetencyScores;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  debriefingSummary: string;
  completedAt: string;
  closureMeetingCompleted?: boolean;
}

export interface BadgeVerification {
  valid: boolean;
  badge?: CompetencyBadge;
  userName?: string;
}
