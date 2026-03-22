import { Users } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const mentoringMenuItems: MenuItem[] = [
  {
    title: 'Mentorat',
    icon: Users,
    path: '/mentoring',
    children: [
      { title: 'Tableau de bord', path: '/mentoring' },
    ],
  },
];
