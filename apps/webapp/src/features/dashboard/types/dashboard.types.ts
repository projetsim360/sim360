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

// Command Center Dashboard Summary
export interface GettingStarted {
  profileCompleted: boolean;
  firstSimulationLaunched: boolean;
  firstDeliverableSubmitted: boolean;
  firstDebriefingViewed: boolean;
  firstPortfolioShared: boolean;
  completionPercent: number;
}

export interface PendingActions {
  decisions: number;
  events: number;
  meetings: number;
  emails: number;
  deliverables: number;
}

export interface NextStep {
  type: string;
  count: number;
  simulationId?: string;
  simulationName?: string;
  link: string;
}

export interface ActiveSimulationSummary {
  id: string;
  projectName: string;
  scenarioTitle: string;
  currentPhase: number;
  phaseName: string;
  kpis: {
    budget: number;
    schedule: number;
    quality: number;
    morale: number;
    risk: number;
  };
}

export interface RecentActivityItem {
  id: string;
  eventType: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface ScoreEvolutionItem {
  projectName: string;
  score: number;
  completedAt: string;
}

export interface DashboardSummary {
  user: { firstName: string; profileCompleted: boolean };
  stats: {
    activeSimulations: number;
    completedSimulations: number;
    totalSimulations: number;
    averageScore: number | null;
  };
  gettingStarted: GettingStarted;
  nextStep: NextStep | null;
  activeSimulations: ActiveSimulationSummary[];
  pendingActions: PendingActions;
  recentActivity: RecentActivityItem[];
  scoreEvolution: ScoreEvolutionItem[];
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
