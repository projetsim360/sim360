import { type LucideIcon } from '@/components/keenicons/icons';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface MenuItem {
  title?: string;
  desc?: string;
  img?: string;
  icon?: LucideIcon;
  path?: string;
  rootPath?: string;
  childrenIndex?: number;
  heading?: string;
  children?: MenuConfig;
  disabled?: boolean;
  collapse?: boolean;
  collapseTitle?: string;
  expandTitle?: string;
  badge?: string;
  separator?: boolean;
  /** Roles autorisés à voir cet item. Si absent, visible par tous. */
  roles?: UserRole[];
  /** Lien de retour (ex: "Retour aux simulations") — rendu spécial avec flèche */
  isBackLink?: boolean;
  /** Clé pour afficher un badge compteur dynamique (ex: 'pendingDecisions') */
  badgeKey?: string;
  /** Condition d'affichage : 'always' (défaut) ou 'completed' (simulation terminée) */
  showWhen?: 'always' | 'completed';
}

export type MenuConfig = MenuItem[];
