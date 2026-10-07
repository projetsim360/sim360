import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TIMEZONE,
  formatTimezoneLabel,
  formatUtcOffset,
  isValidTimezone,
  listTimezones,
  normalizeTimezone,
} from '../../src/lib/timezones';

test('default time zone is America/Toronto (Québec users)', () => {
  assert.equal(DEFAULT_TIMEZONE, 'America/Toronto');
  assert.equal(normalizeTimezone(null), 'America/Toronto');
  assert.equal(normalizeTimezone('not/a_zone'), 'America/Toronto');
});

test('legacy slugs are mapped to IANA identifiers', () => {
  assert.equal(normalizeTimezone('europe_paris'), 'Europe/Paris');
  assert.equal(normalizeTimezone('america_los_angeles'), 'America/Los_Angeles');
});

test('valid IANA identifiers are kept', () => {
  assert.equal(normalizeTimezone('Asia/Tokyo'), 'Asia/Tokyo');
  assert.equal(isValidTimezone('Europe/Paris'), true);
  assert.equal(isValidTimezone('europe_paris'), false);
});

test('the full list is offered, Toronto first', () => {
  const list = listTimezones();
  assert.equal(list[0], 'America/Toronto');
  assert.ok(list.length > 100, `expected the full IANA list, got ${list.length}`);
  assert.equal(new Set(list).size, list.length);
});

test('offset follows daylight saving time', () => {
  assert.equal(formatUtcOffset('America/Toronto', new Date('2026-01-15T12:00:00Z')), 'UTC−05:00');
  assert.equal(formatUtcOffset('America/Toronto', new Date('2026-07-15T12:00:00Z')), 'UTC−04:00');
  assert.match(formatTimezoneLabel('America/Toronto', new Date('2026-07-15T12:00:00Z')), /^America\/Toronto .*\(UTC−04:00\)$/);
});
