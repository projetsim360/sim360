import { LayoutDashboard, Cpu } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const dashboardMenuItems: MenuItem[] = [
  {
    title: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Utilisation IA',
    icon: Cpu,
    path: '/ai/usage',
  },
];
