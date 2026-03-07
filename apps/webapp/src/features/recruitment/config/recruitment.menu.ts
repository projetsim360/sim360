import { Briefcase } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const recruitmentMenuItems: MenuItem[] = [
  {
    title: 'Recrutement',
    icon: Briefcase,
    path: '/recruitment/campaigns',
    children: [
      { title: 'Campagnes', path: '/recruitment/campaigns' },
      { title: 'Nouvelle campagne', path: '/recruitment/campaigns/new' },
    ],
  },
];
