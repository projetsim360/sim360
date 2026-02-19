import {
  BookOpen,
  Briefcase,
  FileBarChart,
  HelpCircle,
  LayoutDashboard,
  List,
  Play,
  Settings,
  UserCircle,
} from 'lucide-react';
import { type MenuConfig } from './types';

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
  { heading: 'Application' },
  {
    title: 'Simulations',
    icon: Play,
    path: '#',
    children: [
      { title: 'Nouvelle simulation', path: '#' },
      { title: 'Mes simulations', path: '#' },
      { title: 'Modèles', path: '#' },
    ],
  },
  {
    title: 'Rapports',
    icon: FileBarChart,
    path: '#',
    children: [
      { title: "Vue d'ensemble", path: '#' },
      { title: 'Historique', path: '#' },
    ],
  },
  { heading: 'Compte' },
  {
    title: 'Mon Profil',
    icon: UserCircle,
    path: '/profile/edit',
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
  { title: 'Simulations', path: '#', icon: Play },
  { title: 'Rapports', path: '#', icon: FileBarChart },
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
    path: '#',
    rootPath: '/simulations',
  },
  {
    title: 'Rapports',
    icon: FileBarChart,
    path: '#',
    rootPath: '/reports',
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
              { title: 'Nouvelle simulation', icon: Play, path: '#' },
              { title: 'Mes simulations', icon: Play, path: '#' },
              { title: 'Modèles', icon: Play, path: '#' },
            ],
          },
        ],
      },
      {
        title: 'Rapports',
        children: [
          {
            children: [
              { title: "Vue d'ensemble", icon: FileBarChart, path: '#' },
              { title: 'Historique', icon: FileBarChart, path: '#' },
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
          { title: 'Nouvelle simulation', icon: Play, path: '#' },
          { title: 'Mes simulations', icon: Play, path: '#' },
          { title: 'Modèles', icon: Play, path: '#' },
        ],
      },
      {
        title: 'Rapports',
        children: [
          { title: "Vue d'ensemble", icon: FileBarChart, path: '#' },
          { title: 'Historique', icon: FileBarChart, path: '#' },
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
  { title: 'Simulations', path: '#', icon: Play },
  { title: 'Rapports', path: '#', icon: FileBarChart },
];

// ---------------------------------------------------------------------------
// Utilitaire : conversion MenuConfig → NavConfig (layout-15)
// ---------------------------------------------------------------------------

interface NavItem {
  id: string;
  title?: string;
  icon?: import('lucide-react').LucideIcon;
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
