import { FileBarChart } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const reportMenuItems: MenuItem[] = [
  {
    title: 'Rapports',
    icon: FileBarChart,
    path: '/reports',
    children: [
      { title: "Vue d'ensemble", path: '/reports' },
    ],
  },
];
