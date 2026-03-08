import {
  BookOpen,
  Briefcase,
  Cpu,
  FileBarChart,
  HelpCircle,
  LayoutDashboard,
  List,
  Play,
  Settings,
  UserCircle,
} from '@/components/keenicons/icons';
import { type MenuConfig } from './types';
import { simulationMenuItems } from '@/features/simulation/config/simulation.menu';
import { meetingMenuItems } from '@/features/meeting/config/meeting.menu';
import { reportMenuItems } from '@/features/report/config/report.menu';
import { adminReferenceMenuItems } from '@/features/admin-reference/config/admin-reference.menu';
import { simulatedEmailMenuItems } from '@/features/simulated-emails/config/simulated-emails.menu';
import { valorizationMenuItems } from '@/features/valorization/config/valorization.menu';
import { recruitmentMenuItems } from '@/features/recruitment/config/recruitment.menu';

// ---------------------------------------------------------------------------
// Source de vérité unique pour tous les menus de l'application Sim360.
// Chaque layout-N.config.tsx importe depuis ce fichier.
// ---------------------------------------------------------------------------

/** Sidebar accordion — layouts 1,3,5,6,8,10,11,18,19,23,26,27,30 */
export const APP_SIDEBAR_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Utilisation IA',
    icon: Cpu,
    path: '/ai/usage',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  { heading: 'Application' },
  ...simulationMenuItems,
  ...meetingMenuItems,
  ...simulatedEmailMenuItems,
  ...reportMenuItems,
  ...valorizationMenuItems,
  ...recruitmentMenuItems,
  { heading: 'Administration' },
  ...adminReferenceMenuItems,
  { heading: 'Compte' },
  {
    title: 'Mon Profil',
    icon: UserCircle,
    path: '/profile/edit',
    children: [
      { title: 'Editer le profil', path: '/profile/edit' },
      { title: 'Onboarding', path: '/onboarding' },
    ],
  },
  {
    title: 'Paramètres',
    icon: Settings,
    path: '/settings',
    children: [
      { title: 'Général', path: '/settings' },
      { title: 'Layout', path: '/settings/layout' },
    ],
  },
  { heading: 'Support' },
  {
    title: 'Documentation',
    icon: BookOpen,
    path: '#',
  },
  {
    title: 'Aide & Support',
    icon: HelpCircle,
    path: '#',
  },
];

/** Header horizontal — layouts 2,11,18,19,22,23,25,26,32,34 */
export const APP_HEADER_MENU: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Simulations', path: '/simulations', icon: Play },
  { title: 'Réunions', path: '/meetings', icon: UserCircle },
  { title: 'Rapports', path: '/reports', icon: FileBarChart },
  { title: 'Recrutement', path: '/recruitment/campaigns', icon: Briefcase },
  { title: 'Mon Profil', path: '/profile/edit', icon: UserCircle },
  { title: 'Paramètres', path: '/settings', icon: Settings },
];

/** Icon rail / dual sidebars — layouts 3,4,14,16,17,20,21,26,30 */
export const APP_ICON_RAIL_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    rootPath: '/dashboard',
  },
  {
    title: 'Simulations',
    icon: Play,
    path: '/simulations',
    rootPath: '/simulations',
  },
  {
    title: 'Rapports',
    icon: FileBarChart,
    path: '/reports',
    rootPath: '/reports',
  },
  {
    title: 'Recrutement',
    icon: Briefcase,
    path: '/recruitment/campaigns',
    rootPath: '/recruitment',
  },
  { separator: true },
  {
    title: 'Paramètres',
    icon: Settings,
    path: '/settings',
    rootPath: '/settings',
  },
  {
    title: 'Mon Profil',
    icon: UserCircle,
    path: '/profile/edit',
    rootPath: '/profile',
  },
];

/** Mega-menu desktop — layouts 1,7,9 */
export const APP_MEGA_MENU: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard' },
  {
    title: 'Application',
    children: [
      {
        title: 'Simulations',
        children: [
          {
            children: [
              { title: 'Nouvelle simulation', icon: Play, path: '/simulations/new' },
              { title: 'Mes simulations', icon: Play, path: '/simulations' },
            ],
          },
        ],
      },
      {
        title: 'Rapports',
        children: [
          {
            children: [
              { title: "Vue d'ensemble", icon: FileBarChart, path: '/reports' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Compte',
    children: [
      {
        title: 'Mon Compte',
        children: [
          {
            children: [
              { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
              { title: 'Layout', icon: Settings, path: '/settings/layout' },
              { title: 'Préférences', icon: Settings, path: '/settings' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'Support',
    children: [
      {
        title: 'Aide',
        children: [
          { title: 'Documentation', icon: BookOpen, path: '#' },
          { title: 'Aide & Support', icon: HelpCircle, path: '#' },
        ],
      },
    ],
  },
];

/** Mega-menu mobile — layouts 1,7,9 */
export const APP_MEGA_MENU_MOBILE: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard' },
  {
    title: 'Application',
    children: [
      {
        title: 'Simulations',
        children: [
          { title: 'Nouvelle simulation', icon: Play, path: '/simulations/new' },
          { title: 'Mes simulations', icon: Play, path: '/simulations' },
        ],
      },
      {
        title: 'Rapports',
        children: [
          { title: "Vue d'ensemble", icon: FileBarChart, path: '/reports' },
        ],
      },
    ],
  },
  {
    title: 'Compte',
    children: [
      {
        title: 'Mon Compte',
        children: [
          { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
          { title: 'Layout', icon: Settings, path: '/settings/layout' },
          { title: 'Préférences', icon: Settings, path: '/settings' },
        ],
      },
    ],
  },
  {
    title: 'Support',
    children: [
      { title: 'Documentation', icon: BookOpen, path: '#' },
      { title: 'Aide & Support', icon: HelpCircle, path: '#' },
    ],
  },
];

/** Sections "Ressources" — layouts 8,12,13,14,16,20,21,25 */
export const APP_RESOURCES_MENU: MenuConfig = [
  {
    title: 'Ressources',
    children: [
      { title: 'Documentation', path: '#', icon: BookOpen },
      { title: 'Aide & Support', path: '#', icon: HelpCircle },
    ],
  },
];

/** Sections "Espaces / Projets" — layouts 14,16,20,21 */
export const APP_WORKSPACES_MENU: MenuConfig = [
  {
    title: 'Projets',
    children: [
      { title: 'Projet par défaut', path: '#', icon: Briefcase },
    ],
  },
];

/** Toolbars — layouts 14,20 */
export const APP_TOOLBAR_MENU: MenuConfig = [
  { title: "Vue d'ensemble", path: '#', icon: List },
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
];

/** Navbars secondaires — layouts 18,22 */
export const APP_NAVBAR_MENU: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { title: 'Simulations', path: '/simulations', icon: Play },
  { title: 'Rapports', path: '/reports', icon: FileBarChart },
];

// ---------------------------------------------------------------------------
// Utilitaire : conversion MenuConfig → NavConfig (layout-15)
// ---------------------------------------------------------------------------

interface NavItem {
  id: string;
  title?: string;
  icon?: import('@/components/keenicons/icons').IconType;
  path?: string;
  badge?: string;
  pinnable?: boolean;
  pinned?: boolean;
}

export type NavConfig = NavItem[];

/** Convertit un APP_SIDEBAR_MENU en NavConfig pour le layout-15 */
export function toNavConfig(menu: MenuConfig): NavConfig {
  return menu
    .filter((item) => item.title && !item.heading && !item.separator)
    .map((item) => ({
      id: (item.title ?? '').toLowerCase().replace(/\s+/g, '-'),
      title: item.title,
      icon: item.icon,
      path: item.path,
      pinnable: true,
      pinned: true,
    }));
}
