import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_FILL_TIME_MS, normalizeMessage, spamVerdict } from '../src/modules/contact/contact.util';

const base = { name: 'Marie Tremblay', email: 'marie@example.com', message: 'Bonjour, je voudrais une démonstration pour mon équipe.' };

test('a normal submission passes', () => {
  assert.equal(spamVerdict({ ...base, website: '', elapsedMs: 12_000 }), 'ok');
  assert.equal(spamVerdict(base), 'ok');
});

test('bots are caught by the honeypot, by filling too fast or by flooding links', () => {
  assert.equal(spamVerdict({ ...base, website: 'http://spam.example' }), 'honeypot');
  assert.equal(spamVerdict({ ...base, elapsedMs: MIN_FILL_TIME_MS - 1 }), 'too_fast');
  assert.equal(spamVerdict({ ...base, message: 'a http://x.a http://x.b http://x.c http://x.d' }), 'link_flood');
  assert.equal(spamVerdict({ ...base, message: 'see http://x.a and https://x.b' }), 'ok');
});

test('messages keep paragraphs but lose exotic whitespace', () => {
  assert.equal(normalizeMessage('  Bonjour !\r\n\r\n\r\nUn\tdeuxième   paragraphe  '), 'Bonjour !\n\nUn deuxième paragraphe');
});
