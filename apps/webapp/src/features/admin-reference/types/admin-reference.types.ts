export type PhaseType = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSURE';
export type DeliverableTemplateDifficulty = 'DISCOVERY' | 'STANDARD' | 'ADVANCED';
export type ReferenceDocumentCategory = 'TEMPLATE' | 'STANDARD' | 'BEST_PRACTICE' | 'GLOSSARY';

export interface DeliverableTemplate {
  id: string;
  tenantId: string;
  title: string;
  type: string;
  phase: PhaseType;
  description?: string;
  content: string;
  evaluationCriteria: Record<string, unknown>;
  pmiProcess?: string;
  difficulty: DeliverableTemplateDifficulty;
  referenceExample?: string;
  version: number;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliverableTemplateDto {
  title: string;
  type: string;
  phase: PhaseType;
  description?: string;
  content: string;
  evaluationCriteria: Record<string, unknown>;
  pmiProcess?: string;
  difficulty: DeliverableTemplateDifficulty;
  referenceExample?: string;
}

export interface UpdateDeliverableTemplateDto extends Partial<CreateDeliverableTemplateDto> {}

export interface ReferenceDocument {
  id: string;
  tenantId: string;
  title: string;
  category: ReferenceDocumentCategory;
  phase?: PhaseType;
  pmiProcess?: string;
  content: string;
  term?: string;
  example?: string;
  version: number;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferenceDocumentDto {
  title: string;
  category: ReferenceDocumentCategory;
  phase?: PhaseType;
  pmiProcess?: string;
  content: string;
  term?: string;
  example?: string;
}

export interface UpdateReferenceDocumentDto extends Partial<CreateReferenceDocumentDto> {}

export interface DeliverableTemplateFilters {
  phase?: PhaseType;
  type?: string;
  difficulty?: DeliverableTemplateDifficulty;
  isActive?: boolean;
  search?: string;
}

export interface ReferenceDocumentFilters {
  category?: ReferenceDocumentCategory;
  phase?: PhaseType;
  isActive?: boolean;
  search?: string;
}

export const PHASE_LABELS: Record<PhaseType, string> = {
  INITIATION: 'Initialisation',
  PLANNING: 'Planification',
  EXECUTION: 'Execution',
  MONITORING: 'Suivi et Controle',
  CLOSURE: 'Cloture',
};

export const DIFFICULTY_LABELS: Record<DeliverableTemplateDifficulty, string> = {
  DISCOVERY: 'Decouverte',
  STANDARD: 'Standard',
  ADVANCED: 'Avance',
};

export const CATEGORY_LABELS: Record<ReferenceDocumentCategory, string> = {
  TEMPLATE: 'Template',
  STANDARD: 'Standard',
  BEST_PRACTICE: 'Bonne pratique',
  GLOSSARY: 'Glossaire',
};
