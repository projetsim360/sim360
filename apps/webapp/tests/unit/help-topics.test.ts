import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HELP_TOPICS, contextualSuggestions, matchHelpTopic, normalizeText } from '../../src/features/assistant/lib/help-topics';

test('the example questions from the user test are answered', () => {
  assert.equal(matchHelpTopic('Comment démarrer une simulation ?')?.id, 'start-simulation');
  assert.equal(matchHelpTopic('Où puis-je modifier mon profil ?')?.id, 'edit-profile');
  assert.equal(matchHelpTopic('Comment planifier une réunion ?')?.id, 'plan-meeting');
  assert.equal(matchHelpTopic('Montre-moi mes simulations terminées.')?.id, 'completed');
  assert.equal(matchHelpTopic('Comment créer un nouveau scénario ?')?.id, 'generate-scenario');
});

test('matching ignores accents and case', () => {
  assert.equal(normalizeText('Réunion À Planifier !'), 'reunion a planifier');
  assert.equal(matchHelpTopic('COMMENT PLANIFIER UNE REUNION')?.id, 'plan-meeting');
});

test('unknown questions return null', () => {
  assert.equal(matchHelpTopic('quelle est la météo à Québec'), null);
  assert.equal(matchHelpTopic('   '), null);
});

test('every suggested question resolves to its own topic', () => {
  for (const t of HELP_TOPICS) assert.equal(matchHelpTopic(t.question)?.id, t.id, t.question);
});

test('suggestions follow the current page', () => {
  assert.deepEqual(contextualSuggestions('/settings').map((t) => t.id), ['edit-profile', 'security', 'timezone']);
  assert.ok(contextualSuggestions('/meetings/abc').some((t) => t.id === 'meeting-run'));
  assert.ok(contextualSuggestions('/dashboard').length >= 3);
});
