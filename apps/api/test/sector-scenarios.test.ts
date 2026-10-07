import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECTOR_SCENARIOS } from '../../../prisma/seeds/scenarios/sector-scenarios';
import { SECTOR_CODES } from '../src/modules/simulations/sector-labels';

test('six new sectors are covered, none of them IT/finance', () => {
  const sectors = SECTOR_SCENARIOS.map((s) => s.sector);
  assert.equal(new Set(sectors).size, 6);
  for (const s of sectors) {
    assert.ok(s, 'sector undefined: run `pnpm db:generate` first');
    assert.ok(SECTOR_CODES.includes(s), `unknown sector ${s}`);
    assert.notEqual(s, 'IT');
    assert.notEqual(s, 'FINANCE');
  }
});

test('ids are unique and every scenario has 5 phases with a meeting', () => {
  assert.equal(new Set(SECTOR_SCENARIOS.map((s) => s.id)).size, SECTOR_SCENARIOS.length);
  for (const sc of SECTOR_SCENARIOS) {
    assert.equal(sc.phases.length, 5, sc.id);
    assert.equal(sc.project.deliverables.length, 5, sc.id);
    for (const ph of sc.phases) {
      assert.ok(ph.meeting.participants.length >= 2, `${sc.id}/${ph.name}`);
      for (const p of ph.meeting.participants) {
        assert.ok(['EXECUTIVE', 'SENIOR', 'INTERMEDIATE', 'JUNIOR'].includes(p.seniority));
        assert.ok(p.cooperationLevel >= 1 && p.cooperationLevel <= 5);
      }
    }
  }
});

test('decisions and events are well-formed', () => {
  for (const sc of SECTOR_SCENARIOS) {
    for (const ph of sc.phases) {
      if (ph.decision) {
        assert.equal(ph.decision.options.length, 3, `${sc.id}/${ph.decision.title}`);
        assert.ok(ph.decision.optimalOption >= 0 && ph.decision.optimalOption < ph.decision.options.length);
        for (const [, , impact] of ph.decision.options) assert.equal(impact.length, 5);
      }
      if (ph.event) {
        assert.ok(ph.event.probability > 0 && ph.event.probability <= 1);
        for (const [, , impact] of ph.event.options) assert.equal(impact.length, 5);
      }
    }
  }
});

test('seed content is written with French accents (no ASCII-only French)', () => {
  const text = JSON.stringify(SECTOR_SCENARIOS);
  for (const bad of [' reunion', ' equipe', ' deja ', ' securite', ' delai ', ' qualite']) {
    assert.ok(!text.toLowerCase().includes(bad), `unaccented "${bad.trim()}" found`);
  }
});
