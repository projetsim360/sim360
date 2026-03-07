import { LayoutDashboard, Cpu } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const dashboardMenuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Utilisation IA',
    icon: Cpu,
    path: '/ai/usage',
  },
];
