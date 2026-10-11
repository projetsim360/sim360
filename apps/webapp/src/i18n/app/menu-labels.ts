import { useCallback } from 'react';
import { useT } from './use-t';
import type { AppMessageKey } from './messages';

/**
 * Menu configs keep their French titles (they also serve as stable ids for accordion state).
 * The shell translates them at render through this table; unknown titles show as written.
 */
export const MENU_LABEL_KEYS: Record<string, AppMessageKey> = {
  'Tableau de bord': 'menu.dashboard',
  Application: 'menu.heading.application',
  Administration: 'menu.heading.administration',
  Compte: 'menu.heading.account',
  Support: 'menu.heading.support',
  Simulations: 'menu.simulations',
  'Mes simulations': 'menu.mySimulations',
  'Nouvelle simulation': 'menu.newSimulation',
  'Mes projets': 'menu.myProjects',
  Emails: 'menu.emails',
  'Boîte de réception': 'menu.inbox',
  'Répondus': 'menu.answered',
  Archives: 'menu.archives',
  Rapports: 'menu.reports',
  "Vue d'ensemble": 'menu.overview',
  Valorisation: 'menu.valorization',
  'Mes badges': 'menu.myBadges',
  Portfolio: 'menu.portfolio',
  Recrutement: 'menu.recruitment',
  Campagnes: 'menu.campaigns',
  'Nouvelle campagne': 'menu.newCampaign',
  Mentorat: 'menu.mentoring',
  'Référentiel': 'menu.reference',
  'Documents de référence': 'menu.referenceDocs',
  'Templates livrables': 'menu.deliverableTemplates',
  'Utilisation IA': 'menu.aiUsage',
  'Paramètres': 'menu.settings',
  Documentation: 'menu.documentation',
  'Aide & Support': 'menu.help',
  'Mon Profil': 'shell.userMenu.profile',
};

export function useMenuLabel() {
  const t = useT();
  return useCallback((title: string | undefined) => {
    if (!title) return '';
    const key = MENU_LABEL_KEYS[title];
    return key ? t(key) : title;
  }, [t]);
}
