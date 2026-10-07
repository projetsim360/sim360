/** Sector catalogue (mirrors prisma `enum Sector`). Single source for labels and icons in the webapp. */
export interface SectorOption {
  value: string;
  label: string;
  icon: string;
}

export const SECTORS: SectorOption[] = [
  { value: 'CONSTRUCTION', label: 'Construction', icon: 'home' },
  { value: 'ENGINEERING', label: 'Ingénierie', icon: 'setting-2' },
  { value: 'ENERGY', label: 'Énergie', icon: 'electricity' },
  { value: 'TRANSPORT', label: 'Transport', icon: 'bus' },
  { value: 'MANUFACTURING', label: 'Manufacturier', icon: 'cube-2' },
  { value: 'HEALTHCARE', label: 'Santé', icon: 'heart' },
  { value: 'PUBLIC_ADMINISTRATION', label: 'Administration publique', icon: 'bank' },
  { value: 'TELECOM', label: 'Télécommunications', icon: 'satellite' },
  { value: 'AEROSPACE', label: 'Aéronautique', icon: 'airplane' },
  { value: 'PROFESSIONAL_SERVICES', label: 'Services professionnels', icon: 'briefcase' },
  { value: 'BANKING_INSURANCE', label: 'Banque et assurance', icon: 'dollar' },
  { value: 'FINANCE', label: 'Finance', icon: 'dollar' },
  { value: 'NATURAL_RESOURCES', label: 'Ressources naturelles', icon: 'tree' },
  { value: 'LOGISTICS', label: 'Logistique', icon: 'delivery' },
  { value: 'REAL_ESTATE', label: 'Immobilier', icon: 'home-2' },
  { value: 'EDUCATION', label: 'Éducation', icon: 'teacher' },
  { value: 'IT', label: 'Technologies de l’information', icon: 'technology-2' },
  { value: 'DIGITAL_TRANSFORMATION', label: 'Transformation numérique', icon: 'rocket' },
  { value: 'PRODUCT_DEVELOPMENT', label: 'Développement de produits', icon: 'abstract-26' },
  { value: 'MARKETING', label: 'Marketing', icon: 'chart-line' },
  { value: 'CUSTOM', label: 'Autre / personnalisé', icon: 'element-11' },
];

const BY_VALUE = new Map(SECTORS.map((s) => [s.value, s]));

export function getSectorLabel(value: string | null | undefined): string {
  if (!value) return '';
  return BY_VALUE.get(value)?.label ?? value;
}

export function getSectorIcon(value: string | null | undefined): string {
  return (value && BY_VALUE.get(value)?.icon) || 'element-11';
}

/** Sectors that actually have at least one scenario, in catalogue order. */
export function sectorsPresent(scenarios: Array<{ sector: string }>): SectorOption[] {
  const present = new Set(scenarios.map((s) => s.sector));
  return SECTORS.filter((s) => present.has(s.value));
}

export interface ScenarioFilters {
  sector: string; // 'ALL' or a Sector value
  difficulty: string; // 'ALL' or a Difficulty value
  scenarioType: string; // 'ALL' | 'GREENFIELD' | 'BROWNFIELD'
}

export const EMPTY_SCENARIO_FILTERS: ScenarioFilters = { sector: 'ALL', difficulty: 'ALL', scenarioType: 'ALL' };

export function filterScenarios<T extends { sector: string; difficulty: string; scenarioType?: string | null }>(
  scenarios: T[],
  filters: ScenarioFilters,
): T[] {
  return scenarios.filter(
    (s) =>
      (filters.sector === 'ALL' || s.sector === filters.sector) &&
      (filters.difficulty === 'ALL' || s.difficulty === filters.difficulty) &&
      (filters.scenarioType === 'ALL' || (s.scenarioType ?? 'GREENFIELD') === filters.scenarioType),
  );
}
