import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_SCENARIO_FILTERS,
  SECTORS,
  filterScenarios,
  getSectorIcon,
  getSectorLabel,
  sectorsPresent,
} from '../../src/features/simulation/config/sectors';

const scenarios = [
  { id: 'a', sector: 'IT', difficulty: 'INTERMEDIATE', scenarioType: 'GREENFIELD' },
  { id: 'b', sector: 'FINANCE', difficulty: 'ADVANCED', scenarioType: 'BROWNFIELD' },
  { id: 'c', sector: 'CONSTRUCTION', difficulty: 'BEGINNER', scenarioType: 'GREENFIELD' },
];

test('the catalogue covers the sectors requested by testers', () => {
  const labels = SECTORS.map((s) => s.label);
  for (const expected of ['Construction', 'Ingénierie', 'Énergie', 'Transport', 'Manufacturier', 'Santé', 'Administration publique', 'Télécommunications', 'Aéronautique', 'Services professionnels', 'Banque et assurance', 'Ressources naturelles', 'Logistique', 'Immobilier', 'Éducation', 'Transformation numérique', 'Développement de produits']) {
    assert.ok(labels.includes(expected), `missing sector ${expected}`);
  }
  assert.equal(new Set(SECTORS.map((s) => s.value)).size, SECTORS.length);
});

test('labels and icons fall back gracefully', () => {
  assert.equal(getSectorLabel('HEALTHCARE'), 'Santé');
  assert.equal(getSectorLabel('UNKNOWN'), 'UNKNOWN');
  assert.equal(getSectorLabel(null), '');
  assert.equal(getSectorIcon('UNKNOWN'), 'element-11');
});

test('filters by sector, level and situation', () => {
  assert.equal(filterScenarios(scenarios, EMPTY_SCENARIO_FILTERS).length, 3);
  assert.deepEqual(filterScenarios(scenarios, { ...EMPTY_SCENARIO_FILTERS, sector: 'FINANCE' }).map((s) => s.id), ['b']);
  assert.deepEqual(filterScenarios(scenarios, { ...EMPTY_SCENARIO_FILTERS, difficulty: 'BEGINNER' }).map((s) => s.id), ['c']);
  assert.deepEqual(filterScenarios(scenarios, { ...EMPTY_SCENARIO_FILTERS, scenarioType: 'GREENFIELD' }).map((s) => s.id), ['a', 'c']);
});

test('only sectors that have scenarios are offered in the filter, in catalogue order', () => {
  assert.deepEqual(sectorsPresent(scenarios).map((s) => s.value), ['CONSTRUCTION', 'FINANCE', 'IT']);
});
