import type { MenuConfig } from '@/config/types';
import { Mail } from '@/components/keenicons/icons';

export const simulatedEmailMenuItems: MenuConfig = [
  {
    title: 'Emails',
    icon: Mail,
    path: '/emails/inbox',
    children: [
      { title: 'Boîte de réception', path: '/emails/inbox' },
      { title: 'Répondus', path: '/emails/responded' },
      { title: 'Archives', path: '/emails/archived' },
    ],
  },
];
