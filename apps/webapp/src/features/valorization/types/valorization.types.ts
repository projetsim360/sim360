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

export interface PortfolioDeliverable {
  id: string;
  title: string;
  type: string;
  status: string;
  score?: number;
  grade?: string;
  content?: string;
}

export interface PortfolioData {
  simulation: {
    id: string;
    scenario: { title: string };
    project: { name: string; client: string };
  };
  deliverables: PortfolioDeliverable[];
  globalScore: number;
  completedAt: string;
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
}

export interface BadgeVerification {
  valid: boolean;
  badge?: CompetencyBadge;
  userName?: string;
}
