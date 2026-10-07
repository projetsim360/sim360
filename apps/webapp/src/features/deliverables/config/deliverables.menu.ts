import type { MenuConfig } from '@/config/types';
import { FileText } from '@/components/keenicons/icons';

export const deliverableMenuItems: MenuConfig = [
  {
    title: 'Livrables',
    icon: FileText,
    path: '/simulations',
    desc: 'Gérez vos livrables de projet',
  },
];
