export interface RecruitmentCampaign {
  id: string;
  title: string;
  slug: string;
  status: CampaignStatus;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: SkillWeight[];
  experienceLevel: string;
  projectTypes: string[];
  culture: CultureType;
  cultureDescription?: string;
  maxCandidates?: number;
  publishedAt?: string;
  closedAt?: string;
  generatedScenarioId?: string;
  _count?: { candidates: number };
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export type CultureType = 'STRICT' | 'AGILE' | 'COLLABORATIVE';

export interface SkillWeight {
  skill: string;
  weight: number;
}

export interface CandidateResult {
  id: string;
  campaignId: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string };
  simulationId?: string;
  status: CandidateStatus;
  currentPhase?: number;
  abandonedPhase?: number;
  globalScore?: number;
  hardSkillsScore?: number;
  softSkillsScore?: number;
  reliabilityScore?: number;
  adaptabilityScore?: number;
  leadershipScore?: number;
  competencyScores?: Record<string, number>;
  report360?: Report360;
  aiJustification?: string;
  strengths: string[];
  weaknesses: string[];
  matchPercentage?: number;
  interviewGuide?: InterviewQuestion[];
  startedAt?: string;
  completedAt?: string;
}

export type CandidateStatus = 'PENDING' | 'PROFILING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface Report360 {
  hardSkills: { score: number; details: string };
  softSkills: { score: number; details: string };
  reliability: { score: number; details: string };
  adaptability: { score: number; details: string };
  leadership: { score: number; details: string };
}

export interface InterviewQuestion {
  question: string;
  context: string;
  expectedInsight: string;
}

export interface CampaignDashboard {
  totalCandidates: number;
  pending: number;
  inProgress: number;
  completed: number;
  abandoned: number;
  completionRate: number;
  averageScore: number | null;
}

export interface CampaignPublicInfo {
  title: string;
  companyName: string;
  jobTitle: string;
  description: string;
  estimatedDuration: string;
  isOpen: boolean;
}

export interface ShortlistResult {
  candidates: Array<CandidateResult & { justification: string }>;
  totalCandidates: number;
  criteria: string;
}

export interface ComparisonResult {
  candidateA: CandidateResult;
  candidateB: CandidateResult;
  aiAnalysis: string;
  recommendation: string;
}

export interface CreateCampaignDto {
  title: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: SkillWeight[];
  experienceLevel: string;
  projectTypes: string[];
  culture: CultureType;
  cultureDescription?: string;
  maxCandidates?: number;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
