import { Briefcase } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const recruitmentMenuItems: MenuItem[] = [
  {
    title: 'Recrutement',
    icon: Briefcase,
    path: '/recruitment/campaigns',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
    children: [
      { title: 'Campagnes', path: '/recruitment/campaigns' },
      { title: 'Nouvelle campagne', path: '/recruitment/campaigns/new' },
    ],
  },
];
