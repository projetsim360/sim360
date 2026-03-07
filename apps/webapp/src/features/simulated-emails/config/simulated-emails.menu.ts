import type { MenuConfig } from '@/config/types';
import { Mail } from '@/components/keenicons/icons';

export const simulatedEmailMenuItems: MenuConfig = [
  {
    title: 'Emails',
    icon: Mail,
    path: '/simulations',
    desc: 'Boite de reception simulee',
  },
];
