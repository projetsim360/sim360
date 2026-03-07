import { Award } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const valorizationMenuItems: MenuItem[] = [
  {
    title: 'Valorisation',
    icon: Award,
    path: '/profile/badges',
    children: [
      { title: 'Mes badges', path: '/profile/badges' },
    ],
  },
];
