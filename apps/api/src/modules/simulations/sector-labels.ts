/** French labels for the Sector enum (prompts, notifications). Keep in sync with prisma `enum Sector`. */
export const SECTOR_LABELS: Record<string, string> = {
  IT: 'Technologies de l’information',
  CONSTRUCTION: 'Construction',
  MARKETING: 'Marketing',
  HEALTHCARE: 'Santé',
  FINANCE: 'Finance',
  CUSTOM: 'Autre',
  ENGINEERING: 'Ingénierie',
  ENERGY: 'Énergie',
  TRANSPORT: 'Transport',
  MANUFACTURING: 'Manufacturier',
  PUBLIC_ADMINISTRATION: 'Administration publique',
  TELECOM: 'Télécommunications',
  AEROSPACE: 'Aéronautique',
  PROFESSIONAL_SERVICES: 'Services professionnels',
  BANKING_INSURANCE: 'Banque et assurance',
  NATURAL_RESOURCES: 'Ressources naturelles',
  LOGISTICS: 'Logistique',
  REAL_ESTATE: 'Immobilier',
  EDUCATION: 'Éducation',
  DIGITAL_TRANSFORMATION: 'Transformation numérique',
  PRODUCT_DEVELOPMENT: 'Développement de produits',
};

export const SECTOR_CODES = Object.keys(SECTOR_LABELS);

export function sectorLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  return SECTOR_LABELS[code] ?? code;
}
