import {
  ArrowLeft,
  BarChart3,
  CircleHelp,
  Zap,
  MessageSquareText,
  Mail,
  FileText,
  Bot,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Briefcase,
  FileDown,
  ClipboardList,
} from '@/components/keenicons/icons';
import { type MenuConfig } from './types';

// ---------------------------------------------------------------------------
// Menu contextuel affiché quand l'utilisateur est dans une simulation active.
// Le placeholder `:simId` sera remplacé dynamiquement par l'id réel.
// ---------------------------------------------------------------------------

export const SIMULATION_CONTEXT_MENU: MenuConfig = [
  {
    title: 'Retour aux simulations',
    icon: ArrowLeft,
    path: '/simulations',
    isBackLink: true,
  },
  { heading: 'Simulation' },
  {
    title: 'Tableau de bord',
    icon: BarChart3,
    path: '/simulations/:simId',
  },
  {
    title: 'Décisions',
    icon: CircleHelp,
    path: '/simulations/:simId/decisions',
    badgeKey: 'pendingDecisions',
  },
  {
    title: 'Événements',
    icon: Zap,
    path: '/simulations/:simId/events',
    badgeKey: 'pendingEvents',
  },
  {
    title: 'Réunions',
    icon: MessageSquareText,
    path: '/simulations/:simId/meetings',
    badgeKey: 'pendingMeetings',
  },
  {
    title: 'Actions de suivi',
    icon: ClipboardList,
    path: '/simulations/:simId/actions',
  },
  {
    title: 'Emails',
    icon: Mail,
    path: '/simulations/:simId/emails',
    badgeKey: 'unreadEmails',
  },
  {
    title: 'Livrables',
    icon: FileText,
    path: '/simulations/:simId/deliverables',
    badgeKey: 'pendingDeliverables',
  },
  {
    title: 'Agent PMO',
    icon: Bot,
    path: '/simulations/:simId/pmo',
  },
  {
    title: 'Intranet',
    icon: BookOpen,
    path: '/simulations/:simId/intranet',
  },
  {
    title: 'Historique KPI',
    icon: TrendingUp,
    path: '/simulations/:simId/kpis',
  },
  {
    title: 'Timeline',
    icon: Clock,
    path: '/simulations/:simId/timeline',
  },
  { heading: 'Valorisation', showWhen: 'completed' },
  {
    title: 'Debriefing',
    icon: Award,
    path: '/simulations/:simId/debriefing',
    showWhen: 'completed',
  },
  {
    title: 'Portfolio',
    icon: Briefcase,
    path: '/simulations/:simId/portfolio',
    showWhen: 'completed',
  },
  {
    title: 'Suggestions CV',
    icon: FileDown,
    path: '/simulations/:simId/cv-suggestions',
    showWhen: 'completed',
  },
];
