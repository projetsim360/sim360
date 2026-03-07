import { ClipboardList } from '@/components/keenicons/icons';
import type { MenuItem } from '@/config/types';

export const adminReferenceMenuItems: MenuItem[] = [
  {
    title: 'Referentiel',
    icon: ClipboardList,
    path: '/admin/deliverable-templates',
    children: [
      { title: 'Templates livrables', path: '/admin/deliverable-templates' },
      { title: 'Documents reference', path: '/admin/reference-documents' },
    ],
  },
];
