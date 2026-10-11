import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPublicSitePath, PRERENDERED_PAGES, PUBLIC_ROUTES, publicSiteFileFor } from '../../public-paths.mjs';

test('the public site entry serves every public slug in both languages and nothing else', () => {
  for (const r of PUBLIC_ROUTES) {
    assert.equal(isPublicSitePath(r.fr), true, r.fr);
    assert.equal(isPublicSitePath(r.en), true, r.en);
  }
  assert.equal(isPublicSitePath('/en/'), true);
  assert.equal(isPublicSitePath('/en/anything'), true);
  assert.equal(isPublicSitePath('/english'), false);
  assert.equal(isPublicSitePath('/dashboard'), false);
  assert.equal(isPublicSitePath('/auth/sign-in'), false);
  assert.equal(isPublicSitePath('/site.html'), false);
});

test('every public page is prerendered to its own file, unknown English paths get the bare entry', () => {
  assert.equal(PRERENDERED_PAGES.length, PUBLIC_ROUTES.length * 2);
  assert.equal(new Set(PRERENDERED_PAGES.map((p) => p.file)).size, PRERENDERED_PAGES.length);
  assert.equal(publicSiteFileFor('/'), 'site-fr.html');
  assert.equal(publicSiteFileFor('/en'), 'site-en.html');
  assert.equal(publicSiteFileFor('/a-propos'), 'site-fr-about.html');
  assert.equal(publicSiteFileFor('/en/about/'), 'site-en-about.html');
  assert.equal(publicSiteFileFor('/en/unknown'), 'site.html');
  assert.equal(publicSiteFileFor('/dashboard'), null);
});
