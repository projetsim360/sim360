import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CUSTOM_MEETING, customMeetingSchema, toCustomMeetingPayload } from '../../src/features/meeting/lib/custom-meeting';

const valid = {
  ...DEFAULT_CUSTOM_MEETING,
  title: 'Arbitrage budgétaire du lot 2',
  objectives: '- Valider le budget révisé\n\n• Décider du report du lot 3\n',
  sector: 'Construction',
  stakes: '  ',
  participants: [
    { ...DEFAULT_CUSTOM_MEETING.participants[0], name: ' Sophie ', role: 'Directrice financière', seniority: 'EXECUTIVE' as const, objectives: '' },
  ],
};

test('a complete form is valid', () => {
  assert.equal(customMeetingSchema.safeParse(valid).success, true);
});

test('subject, objectives and at least one participant are required', () => {
  assert.equal(customMeetingSchema.safeParse({ ...valid, title: '' }).success, false);
  assert.equal(customMeetingSchema.safeParse({ ...valid, objectives: '' }).success, false);
  assert.equal(customMeetingSchema.safeParse({ ...valid, participants: [] }).success, false);
  assert.equal(customMeetingSchema.safeParse({ ...valid, participants: Array(7).fill(valid.participants[0]) }).success, false);
});

test('payload: one objective per line, bullets stripped, blanks dropped', () => {
  const payload = toCustomMeetingPayload(valid);
  assert.deepEqual(payload.objectives, ['Valider le budget révisé', 'Décider du report du lot 3']);
  assert.equal(payload.stakes, undefined);
  assert.equal(payload.sector, 'Construction');
  assert.equal(payload.participants[0].name, 'Sophie');
  assert.equal(payload.participants[0].seniority, 'EXECUTIVE');
  assert.equal(payload.participants[0].objectives, undefined);
});
