export interface DashboardStats {
  active: number;
  completed: number;
  total: number;
  avgScore: number;
}

export interface RecentActivity {
  type: 'decision' | 'meeting' | 'event';
  title: string;
  date: string;
  simulationId: string;
  projectName: string;
}

export interface NextActionDecision {
  type: 'decision';
  id: string;
  title: string;
  simulationId: string;
  projectName: string;
  timeLimitSeconds: number | null;
}

export interface NextActionMeeting {
  type: 'meeting';
  id: string;
  title: string;
  status: string;
  simulationId: string;
  projectName: string;
}

export interface NextActionEvent {
  type: 'event';
  id: string;
  title: string;
  severity: string;
  simulationId: string;
  projectName: string;
}

export interface NextActions {
  decisions: NextActionDecision[];
  meetings: NextActionMeeting[];
  events: NextActionEvent[];
}

export interface ActiveSimulation {
  id: string;
  status: string;
  currentPhaseOrder: number;
  project: { name: string };
  scenario: { title: string };
  kpis: {
    budget: number;
    schedule: number;
    quality: number;
    teamMorale: number;
    riskLevel: number;
  } | null;
}

export interface ScoreEvolutionPoint {
  simulationId: string;
  completedAt: string;
  score: number;
}

export interface GlobalDashboard {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  nextActions: NextActions;
  activeSimulations: ActiveSimulation[];
  scoreEvolution: ScoreEvolutionPoint[];
}

export interface KpiSnapshot {
  id: string;
  simulationId: string;
  phaseOrder: number;
  trigger: string;
  triggerId: string | null;
  budget: number;
  schedule: number;
  quality: number;
  teamMorale: number;
  riskLevel: number;
  takenAt: string;
}

export interface LearnerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  totalSimulations: number;
  completedSimulations: number;
  activeSimulations: number;
  avgScore: number;
  alertCount: number;
  lastSimulation: {
    id: string;
    status: string;
    scenario: string;
    updatedAt: string;
  } | null;
}
