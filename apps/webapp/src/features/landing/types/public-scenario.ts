/** Shape returned by `GET /public/scenarios` (published scenarios, public fields only). */
export interface PublicScenario {
  id: string;
  title: string;
  description: string | null;
  sector: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  scenarioType: string;
  estimatedDurationHours: number;
  requiredPlan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  competencies: string[];
  objectives: string[];
  phaseCount: number;
}
