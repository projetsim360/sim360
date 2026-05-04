import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  MonitorPlay,
  FileText,
  Inbox,
  Trophy,
  BookOpen,
  LifeBuoy,
  Settings,
  Sparkles,
} from 'lucide-react';

export interface SimexMenuItem {
  label: string;
  icon: LucideIcon;
  path?: string;
  badge?: string | number;
  isActive?: boolean;
}

export interface SimexMenuSection {
  title: string;
  items: SimexMenuItem[];
}

export const SIMEX_SHELL_MENU: SimexMenuSection[] = [
  {
    title: 'Apprentissage',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Simulations', icon: MonitorPlay, path: '/simulations', badge: 3 },
      { label: 'Livrables', icon: FileText, path: '/deliverables' },
      { label: 'Inbox', icon: Inbox, path: '/inbox', badge: 12 },
      { label: 'Portfolio', icon: Trophy, path: '/portfolio' },
    ],
  },
  {
    title: 'Assistance',
    items: [
      { label: 'Glossaire', icon: BookOpen, path: '/glossary' },
      { label: 'Aide', icon: LifeBuoy, path: '/help' },
    ],
  },
  {
    title: 'Compte',
    items: [
      { label: 'Paramètres', icon: Settings, path: '/settings' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { label: 'Agent PMO', icon: Sparkles, path: '/pmo' },
    ],
  },
];
