export interface KpiValues {
  budget: number;
  schedule: number;
  quality: number;
  teamMorale: number;
  riskLevel: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string | null;
  objectives: string[];
  sector: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDurationHours: number;
  competencies: string[];
  phases: { id: string; name: string; type: string; order: number }[];
  _count?: { simulations: number };
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  availability: number;
  morale: number;
  avatar: string | null;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED';
  qualityScore: number | null;
  phaseOrder: number | null;
}

export interface Project {
  id: string;
  name: string;
  client: string | null;
  sector: string;
  description: string | null;
  initialBudget: number;
  currentBudget: number;
  status: string;
  teamMembers: ProjectTeamMember[];
  deliverables: Deliverable[];
}

export interface SimulationPhase {
  order: number;
  name: string;
  type: string;
  status: 'LOCKED' | 'ACTIVE' | 'COMPLETED';
  startedAt: string | null;
  completedAt: string | null;
}

export interface DecisionOption {
  label: string;
  description: string;
  kpiImpact: Partial<KpiValues>;
}

export interface Decision {
  id: string;
  phaseOrder: number;
  title: string;
  context: string;
  options: DecisionOption[];
  selectedOption: number | null;
  decidedAt: string | null;
  kpiImpact: Partial<KpiValues> | null;
  timeLimitSeconds: number | null;
}

export interface RandomEvent {
  id: string;
  phaseOrder: number;
  type: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  options: DecisionOption[];
  selectedOption: number | null;
  resolvedAt: string | null;
}

export interface SimulationKpi extends KpiValues {
  id: string;
}

export interface SimulationMeeting {
  id: string;
  phaseOrder: number;
  title: string;
  description: string | null;
  type: string;
  objectives: string[];
  durationMinutes: number;
  mode: 'TEXT' | 'AUDIO';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string | null;
  completedAt: string | null;
  participants: Array<{ id: string; name: string; role: string; avatar: string | null }>;
  summary: { id: string; summary: string } | null;
  _count?: { messages: number };
}

export interface Simulation {
  id: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  currentPhaseOrder: number;
  startedAt: string | null;
  completedAt: string | null;
  project: Project;
  scenario: { id: string; title: string; difficulty: string; sector: string };
  kpis: SimulationKpi | null;
  phases: SimulationPhase[];
  decisions: Decision[];
  randomEvents: RandomEvent[];
  meetings?: SimulationMeeting[];
}

export interface TimelineEntry {
  type: string;
  date: string;
  title: string;
  data: Record<string, unknown>;
}
