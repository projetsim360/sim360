/**
 * Legal identity shown on the legal notice and privacy pages.
 * Values marked "to complete" must be filled by the company before launch; the pages
 * render them as-is so nothing is invented.
 */
export const LEGAL_ENTITY = {
  name: 'Simex pro',
  /** Legal form and Québec enterprise number (NEQ). */
  neq: 'NEQ : à compléter',
  address: 'Adresse : à compléter, Québec, Canada',
  email: 'hello@simex.pro',
  /** Personne responsable de la protection des renseignements personnels (Loi 25). */
  privacyOfficer: 'Responsable de la protection des renseignements personnels : à compléter',
  /** Hosting provider of the platform. */
  host: 'OVHcloud (Canada)',
  /** Third parties that process data on our behalf. */
  processors: ['Anthropic (participants simulés et retours)', 'OpenAI (réunions vocales)', 'Resend (courriels transactionnels)'],
  lastUpdated: '2026-10-11',
} as const;
