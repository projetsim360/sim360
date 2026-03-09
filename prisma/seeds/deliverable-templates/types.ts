export interface EvaluationCriterion {
  label: string;
  description: string;
  maxPoints: number;
}

export interface EvaluationSection {
  id: string;
  name: string;
  weight: number; // percentage, all sections sum to 100
  criteria: EvaluationCriterion[];
}

export interface EvaluationCriteria {
  sections: EvaluationSection[];
  passingScore: number;
  maxScore: number;
  pmiOutputs: string[];
}

export type PhaseType = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSURE';
export type Difficulty = 'DISCOVERY' | 'STANDARD' | 'ADVANCED';

export interface DeliverableTemplateData {
  id: string; // deterministic: "seed-tpl-{type}"
  title: string;
  type: string;
  phase: PhaseType;
  description: string;
  content: string; // Markdown with {{placeholders}}
  evaluationCriteria: EvaluationCriteria;
  pmiProcess: string; // e.g. "4.1"
  difficulty: Difficulty;
  referenceExample: string; // Markdown "perfect deliverable"
}
