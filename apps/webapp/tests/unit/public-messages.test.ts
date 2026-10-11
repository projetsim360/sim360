import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fr } from '../../src/i18n/locales/fr';
import { en } from '../../src/i18n/locales/en';

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}|<(\w+)>/g)].map((m) => m[1] ?? m[2]).sort();

test('both public catalogues declare the same keys, none empty', () => {
  const frKeys = Object.keys(fr).sort();
  const enKeys = Object.keys(en).sort();
  assert.deepEqual(enKeys, frKeys);
  for (const [key, value] of Object.entries({ ...fr, ...en })) {
    assert.ok(value.trim().length > 0, `empty message for ${key}`);
  }
});

test('ICU placeholders and rich-text tags match between languages', () => {
  for (const key of Object.keys(fr) as (keyof typeof fr)[]) {
    assert.deepEqual(placeholders(en[key]), placeholders(fr[key]), `placeholder mismatch for ${key}`);
  }
});

test('public copy never says « IA » / "AI" (learner-facing vocabulary)', () => {
  const offenders = [
    ...Object.entries(fr).filter(([, v]) => /\bIA\b/.test(v)).map(([k]) => `fr:${k}`),
    ...Object.entries(en).filter(([, v]) => /\bAI\b/.test(v)).map(([k]) => `en:${k}`),
  ];
  assert.deepEqual(offenders, []);
});
