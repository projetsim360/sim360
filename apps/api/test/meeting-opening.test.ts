import { test } from 'node:test';
import assert from 'node:assert/strict';
import { needsOpening } from '../src/modules/meetings/meeting-opening.util';

test('an in-progress meeting without messages needs an opening', () => {
  assert.equal(needsOpening({ status: 'IN_PROGRESS', messages: [] }), true);
});

test('opening is idempotent: no new opening once a message exists', () => {
  assert.equal(needsOpening({ status: 'IN_PROGRESS', messages: [{}] }), false);
});

test('no opening before start or after completion', () => {
  assert.equal(needsOpening({ status: 'SCHEDULED', messages: [] }), false);
  assert.equal(needsOpening({ status: 'COMPLETED', messages: [] }), false);
});
