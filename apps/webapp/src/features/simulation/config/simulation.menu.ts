import { Play } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const simulationMenuItems: MenuItem[] = [
  {
    title: 'Simulations',
    icon: Play,
    path: '/simulations',
    children: [
      { title: 'Nouvelle simulation', path: '/simulations/new' },
      { title: 'Mes simulations', path: '/simulations' },
    ],
  },
];
