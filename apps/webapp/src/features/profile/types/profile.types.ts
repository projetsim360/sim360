export type ProfileType = 'ZERO_EXPERIENCE' | 'BEGINNER' | 'RECONVERSION' | 'REINFORCEMENT';
export type SkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  userId: string;
  linkedinData?: Record<string, unknown>;
  cvData?: Record<string, unknown>;
  cvFileUrl?: string;
  questionnaireData?: QuestionnaireData;
  aptitudeTestData?: AptitudeTestData;
  profileType?: ProfileType;
  diagnosticData?: DiagnosticData;
  skills?: SkillGap[];
  suggestedSector?: string;
  selectedSector?: string;
  suggestedDifficulty?: string;
  customProjectData?: Record<string, unknown>;
  onboardingStep?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireData {
  objective: 'reinforce' | 'reconversion' | 'discovery';
  targetDomain: string;
  experienceLevel: 'none' | 'beginner' | 'confirmed';
  mainMotivation: string;
}

export interface AptitudeTestData {
  answers: Record<string, unknown>;
  scores?: { logic: number; prioritization: number; organization: number };
}

export interface DiagnosticData {
  profileType: ProfileType;
  summary: string;
  personalizedMessage: string;
  suggestedSector: string;
  suggestedDifficulty: string;
}

export interface SkillGap {
  name: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  gap: number;
}

export interface CustomProjectData {
  name: string;
  description: string;
  sector: string;
  constraints?: string;
}

export interface ProfileAdaptation {
  pmoTone: 'patient' | 'bienveillant' | 'professionnel' | 'exigeant';
  pmoExplanationLevel: 'detailed' | 'constructive' | 'direct' | 'minimal';
  pmoProactiveInterventions: boolean;
  pmoInterventionFrequency: 'every_step' | 'regular' | 'on_demand' | 'silent';
  maxRevisions: number;
  activePmiProcessCount: { min: number; max: number };
  maxRollbacks: number;
  pedagogicQuestions: boolean;
  showGlossaryTooltips: boolean;
}

export const PMO_TONE_LABELS: Record<ProfileAdaptation['pmoTone'], string> = {
  patient: 'Patient',
  bienveillant: 'Bienveillant',
  professionnel: 'Professionnel',
  exigeant: 'Exigeant',
};

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  ZERO_EXPERIENCE: 'Debutant absolu',
  BEGINNER: 'Debutant',
  RECONVERSION: 'Reconversion',
  REINFORCEMENT: 'Renforcement',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'Aucun',
  basic: 'Basique',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
};

export const SECTORS = [
  { value: 'it', label: 'IT / Digital', icon: 'technology-2' },
  { value: 'btp', label: 'BTP / Construction', icon: 'home-2' },
  { value: 'sante', label: 'Sante', icon: 'heart' },
  { value: 'marketing', label: 'Marketing', icon: 'graph-up' },
  { value: 'finance', label: 'Finance', icon: 'chart-simple' },
  { value: 'evenementiel', label: 'Evenementiel', icon: 'calendar' },
  { value: 'autre', label: 'Autre', icon: 'element-11' },
] as const;

export const DOMAINS = [
  { value: 'it', label: 'IT / Digital' },
  { value: 'btp', label: 'BTP / Construction' },
  { value: 'sante', label: 'Sante' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'evenementiel', label: 'Evenementiel' },
  { value: 'autre', label: 'Autre' },
] as const;
