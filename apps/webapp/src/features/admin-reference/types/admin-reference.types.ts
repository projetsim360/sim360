import type { AppMessageKey } from '@/i18n/app/messages';
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

export const PHASE_LABELS: Record<PhaseType, AppMessageKey> = {
  INITIATION: 'admin.phase.INITIATION',
  PLANNING: 'admin.phase.PLANNING',
  EXECUTION: 'admin.phase.EXECUTION',
  MONITORING: 'admin.phase.MONITORING',
  CLOSURE: 'admin.phase.CLOSURE',
};

export const DIFFICULTY_LABELS: Record<DeliverableTemplateDifficulty, AppMessageKey> = {
  DISCOVERY: 'admin.difficulty.DISCOVERY',
  STANDARD: 'admin.difficulty.STANDARD',
  ADVANCED: 'admin.difficulty.ADVANCED',
};

export const CATEGORY_LABELS: Record<ReferenceDocumentCategory, AppMessageKey> = {
  TEMPLATE: 'admin.category.TEMPLATE',
  STANDARD: 'admin.category.STANDARD',
  BEST_PRACTICE: 'admin.category.BEST_PRACTICE',
  GLOSSARY: 'admin.category.GLOSSARY',
};
