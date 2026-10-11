import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMeetingTimeline } from '../../src/features/meeting/lib/meeting-timeline';

test('shows elapsed / planned as "05 min / 60 min"', () => {
  const t = computeMeetingTimeline(5 * 60 + 20, 60);
  assert.equal(t.label, '05 min / 60 min');
  assert.deepEqual(t.remainingLabel, { id: 'meeting.timeline.left', values: { min: 55 } });
  assert.equal(t.overtime, false);
  assert.ok(t.progress! > 0.08 && t.progress! < 0.1);
});

test('overtime is flagged and progress is capped', () => {
  const t = computeMeetingTimeline(63 * 60, 60);
  assert.equal(t.overtime, true);
  assert.equal(t.progress, 1);
  assert.deepEqual(t.remainingLabel, { id: 'meeting.timeline.over', values: { min: 3 } });
});

test('without planned duration only elapsed time is shown', () => {
  const t = computeMeetingTimeline(125, null);
  assert.equal(t.label, '02 min');
  assert.equal(t.progress, null);
  assert.equal(t.remainingLabel, null);
});
