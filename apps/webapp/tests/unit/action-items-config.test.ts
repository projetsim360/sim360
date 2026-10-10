import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_STATUS_OPTIONS, isActionOverdue, toDateInputValue } from '../../src/features/action-items/config/action-items.config';

test('statuses are labelled in French', () => {
  assert.deepEqual(ACTION_STATUS_OPTIONS.map((o) => o.label), ['À faire', 'En cours', 'Terminée', 'Annulée']);
});

test('date input value is YYYY-MM-DD', () => {
  assert.equal(toDateInputValue('2026-10-15T00:00:00.000Z'), '2026-10-15');
  assert.equal(toDateInputValue(null), '');
});

test('an action due today is not overdue; yesterday is', () => {
  const now = new Date('2026-10-15T15:00:00Z');
  assert.equal(isActionOverdue({ dueDate: '2026-10-15T00:00:00.000Z', status: 'TODO' }, now), false);
  assert.equal(isActionOverdue({ dueDate: '2026-10-14T00:00:00.000Z', status: 'TODO' }, now), true);
  assert.equal(isActionOverdue({ dueDate: '2026-10-14T00:00:00.000Z', status: 'DONE' }, now), false);
});
