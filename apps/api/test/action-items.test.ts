import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOverdue, seedsFromSummary } from '../src/modules/action-items/action-items.util';

test('summary JSON becomes editable action rows', () => {
  const seeds = seedsFromSummary([
    { task: 'Envoyer le budget révisé', assignee: 'Sophie', deadline: '2026-10-15' },
    { task: '  Relancer le fournisseur ', assignee: '', deadline: 'fin de semaine' },
    { task: 'Sans échéance' },
  ]);
  assert.equal(seeds.length, 3);
  assert.equal(seeds[0].title, 'Envoyer le budget révisé');
  assert.equal(seeds[0].assignee, 'Sophie');
  assert.equal(seeds[0].dueDate?.toISOString().slice(0, 10), '2026-10-15');
  assert.equal(seeds[0].dueLabel, null);
  assert.equal(seeds[1].title, 'Relancer le fournisseur');
  assert.equal(seeds[1].assignee, null);
  assert.equal(seeds[1].dueDate, null);
  assert.equal(seeds[1].dueLabel, 'fin de semaine');
  assert.equal(seeds[2].dueDate, null);
  assert.equal(seeds[2].dueLabel, null);
});

test('invalid summary content is ignored', () => {
  assert.deepEqual(seedsFromSummary(null), []);
  assert.deepEqual(seedsFromSummary({ task: 'x' }), []);
  assert.deepEqual(seedsFromSummary([null, 42, { task: '' }, { assignee: 'A' }]), []);
});

test('overdue only when open and past due', () => {
  const now = new Date('2026-10-10T12:00:00Z');
  assert.equal(isOverdue({ dueDate: '2026-10-01', status: 'TODO' }, now), true);
  assert.equal(isOverdue({ dueDate: '2026-10-01', status: 'DONE' }, now), false);
  assert.equal(isOverdue({ dueDate: '2026-10-20', status: 'IN_PROGRESS' }, now), false);
  assert.equal(isOverdue({ dueDate: null, status: 'TODO' }, now), false);
});
