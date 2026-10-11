import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternateLocale, intlLocale, localeFromPathname, localizedPath, stripLocalePrefix } from '../../src/i18n/public-locale';

test('French is the root, English lives under /en', () => {
  assert.equal(localeFromPathname('/'), 'fr');
  assert.equal(localeFromPathname('/contact'), 'fr');
  assert.equal(localeFromPathname('/en'), 'en');
  assert.equal(localeFromPathname('/en/contact'), 'en');
  // "/english" is not the English prefix
  assert.equal(localeFromPathname('/english'), 'fr');
});

test('paths round-trip between locales', () => {
  assert.equal(localizedPath('/', 'en'), '/en');
  assert.equal(localizedPath('/', 'fr'), '/');
  assert.equal(localizedPath('/contact', 'en'), '/en/contact');
  assert.equal(localizedPath('/en/contact', 'fr'), '/contact');
  assert.equal(localizedPath('/en/contact', 'en'), '/en/contact');
  assert.equal(localizedPath('contact', 'en'), '/en/contact');
  assert.equal(stripLocalePrefix('/en'), '/');
  assert.equal(stripLocalePrefix('/en/x/y'), '/x/y');
});

test('formatting locales are Canadian and the alternate locale flips', () => {
  assert.equal(intlLocale('fr'), 'fr-CA');
  assert.equal(intlLocale('en'), 'en-CA');
  assert.equal(alternateLocale('fr'), 'en');
  assert.equal(alternateLocale('en'), 'fr');
});
