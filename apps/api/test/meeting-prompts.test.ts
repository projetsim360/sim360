import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REALISM_RULES,
  appendUserTurn,
  buildFallbackOpening,
  buildOpeningInstruction,
  buildParticipantSystemPrompt,
  buildSpeakerLabelledHistory,
  pickFacilitator,
  type MeetingPromptContext,
} from '../src/modules/ai/services/meeting-prompts';

const context: MeetingPromptContext = {
  scenarioTitle: 'Agrandissement d’un CHSLD',
  phaseName: 'Planification',
  sector: 'HEALTHCARE',
  kpis: { budget: 45, schedule: 70, quality: 80, teamMorale: 60, riskLevel: 55 },
  meeting: { title: 'Comité de pilotage', type: 'STEERING', objectives: ['Valider le budget révisé'], durationMinutes: 45 },
  otherParticipants: [
    { id: 'p2', name: 'Luc', role: 'Ingénieur de projet', seniority: 'INTERMEDIATE' },
  ],
};

test('system prompt carries the realism rules (no greetings, no thanks, disagreement allowed)', () => {
  const prompt = buildParticipantSystemPrompt({ id: 'p1', name: 'Sophie', role: 'Directrice financière', seniority: 'EXECUTIVE', personality: 'COOPERATIVE', cooperationLevel: 4 }, context);
  assert.match(prompt, /Pas de « Bonjour », pas de remerciements/);
  assert.match(prompt, /en désaccord/);
  assert.match(prompt, /Niveau hiérarchique : cadre dirigeant/);
  assert.match(prompt, /Autres participants : Luc \(Ingénieur de projet, intermédiaire\)/);
  assert.match(prompt, /Objectifs de la réunion : Valider le budget révisé/);
  assert.match(prompt, /45 minutes prévues/);
  for (const rule of REALISM_RULES) assert.ok(prompt.includes(rule));
});

test('even cooperative participants may disagree', () => {
  const prompt = buildParticipantSystemPrompt({ name: 'A', role: 'B', personality: 'COOPERATIVE', cooperationLevel: 5 }, context);
  assert.match(prompt, /peut quand même être en désaccord/);
});

test('history: only the speaker own lines are assistant, others are labelled user turns', () => {
  const history = buildSpeakerLabelledHistory(
    [
      { role: 'PARTICIPANT', participantId: 'p1', participant: { name: 'Sophie', role: 'DAF' }, content: 'On ouvre.' },
      { role: 'USER', content: 'Je propose de couper 10 %.' },
      { role: 'PARTICIPANT', participantId: 'p2', participant: { name: 'Luc', role: 'Ingénieur' }, content: 'Impossible sans revoir le devis.' },
    ],
    'p2',
  );
  assert.deepEqual(history, [
    { role: 'user', content: '[Sophie — DAF] On ouvre.\n\n[Chef de projet] Je propose de couper 10 %.' },
    { role: 'assistant', content: 'Impossible sans revoir le devis.' },
  ]);
});

test('history always starts with a user turn', () => {
  const history = buildSpeakerLabelledHistory(
    [{ role: 'PARTICIPANT', participantId: 'p1', participant: { name: 'Sophie', role: 'DAF' }, content: 'On ouvre.' }],
    'p1',
  );
  assert.equal(history[0].role, 'user');
  assert.equal(history[1].role, 'assistant');
});

test('appendUserTurn merges with a trailing user turn', () => {
  const turns = appendUserTurn([{ role: 'user', content: '[Luc — Ingénieur] Non.' }], 'Pourquoi ?');
  assert.deepEqual(turns, [{ role: 'user', content: '[Luc — Ingénieur] Non.\n\n[Chef de projet] Pourquoi ?' }]);
});

test('facilitator: executive first, then a manager-like role, then the first participant', () => {
  assert.equal(pickFacilitator([{ name: 'A', role: 'Analyste' }, { name: 'B', role: 'Sponsor', seniority: 'EXECUTIVE' }])?.name, 'B');
  assert.equal(pickFacilitator([{ name: 'A', role: 'Développeur' }, { name: 'B', role: 'Directeur des opérations' }])?.name, 'B');
  assert.equal(pickFacilitator([{ name: 'A', role: 'Développeur' }, { name: 'B', role: 'Testeur' }])?.name, 'A');
  assert.equal(pickFacilitator([]), undefined);
});

test('opening instruction covers the 4 steps and hands over to someone', () => {
  const text = buildOpeningInstruction(context, { name: 'Sophie', role: 'Directrice financière' });
  assert.match(text, /ouvre la séance/);
  assert.match(text, /rappelle l'objectif \(Valider le budget révisé\) et le temps disponible \(45 minutes\)/);
  assert.match(text, /premier sujet/);
  assert.match(text, /donne la parole à Luc/);
});

test('fallback opening is never empty', () => {
  const text = buildFallbackOpening({ ...context, meeting: { title: 'X' } });
  assert.match(text, /faire le point sur le projet/);
});
