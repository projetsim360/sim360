import { ClipboardList } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const adminReferenceMenuItems: MenuItem[] = [
  {
    title: 'Référentiel',
    icon: ClipboardList,
    path: '/admin/deliverable-templates',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    children: [
      { title: 'Templates livrables', path: '/admin/deliverable-templates' },
      { title: 'Documents de référence', path: '/admin/reference-documents' },
    ],
  },
];
