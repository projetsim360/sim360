/** Suggested professional functions; users can still type their own ("Autre"). */
export const JOB_TITLES = [
  'Chef de projet',
  'Gestionnaire de projet',
  'Coordonnateur de projet',
  'Chargé de projet',
  'Planificateur',
  'Estimateur',
  'Contrôleur de projet',
  'Ingénieur de projet',
  'Responsable de chantier',
  'Gestionnaire de programme',
  'Gestionnaire de portefeuille',
  'Analyste de projet',
  'Conseiller en gestion de projet',
  'Responsable PMO',
  'Scrum Master',
  'Product Owner',
  'Gestionnaire d’équipe',
  'Directeur de projet',
] as const;

export const JOB_TITLE_OPTIONS = JOB_TITLES.map((t) => ({ value: t, label: t }));
