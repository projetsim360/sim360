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

export interface AptitudeAnswer {
  questionId: string;
  answer: string;
}

export interface AptitudeTestData {
  answers: AptitudeAnswer[];
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
  projectName: string;
  description: string;
  sector: string;
  teamSize: number;
  duration: number;
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
  ZERO_EXPERIENCE: 'Débutant absolu',
  BEGINNER: 'Débutant',
  RECONVERSION: 'Reconversion',
  REINFORCEMENT: 'Renforcement',
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'Aucun',
  basic: 'Basique',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export const SECTORS = [
  { value: 'it', label: 'IT / Digital', icon: 'technology-2' },
  { value: 'btp', label: 'BTP / Construction', icon: 'home-2' },
  { value: 'sante', label: 'Santé', icon: 'heart' },
  { value: 'marketing', label: 'Marketing', icon: 'graph-up' },
  { value: 'finance', label: 'Finance', icon: 'chart-simple' },
  { value: 'evenementiel', label: 'Événementiel', icon: 'calendar' },
  { value: 'autre', label: 'Autre', icon: 'element-11' },
] as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Facile',
  MEDIUM: 'Intermédiaire',
  HARD: 'Difficile',
  EXPERT: 'Expert',
};

export function formatDifficulty(value?: string | null): string {
  if (!value) return '';
  return DIFFICULTY_LABELS[value.toUpperCase()] ?? value;
}

export const DOMAINS = [
  { value: 'it', label: 'IT / Digital' },
  { value: 'btp', label: 'BTP / Construction' },
  { value: 'sante', label: 'Santé' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'evenementiel', label: 'Événementiel' },
  { value: 'autre', label: 'Autre' },
] as const;
