import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicSitePath } from '../../public-paths.mjs';

test('the public site entry serves the landing in both languages and nothing else', () => {
  assert.equal(isPublicSitePath('/'), true);
  assert.equal(isPublicSitePath('/en'), true);
  assert.equal(isPublicSitePath('/en/'), true);
  assert.equal(isPublicSitePath('/en/contact'), true);
  assert.equal(isPublicSitePath('/english'), false);
  assert.equal(isPublicSitePath('/dashboard'), false);
  assert.equal(isPublicSitePath('/auth/sign-in'), false);
  assert.equal(isPublicSitePath('/site.html'), false);
});
