import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alternateLocale, intlLocale, localeFromPathname, localizedPath, publicPath, routeIdFromPathname, stripLocalePrefix } from '../../src/i18n/public-locale';

test('French is the root, English lives under /en', () => {
  assert.equal(localeFromPathname('/'), 'fr');
  assert.equal(localeFromPathname('/contact'), 'fr');
  assert.equal(localeFromPathname('/en'), 'en');
  assert.equal(localeFromPathname('/en/contact'), 'en');
  // "/english" is not the English prefix
  assert.equal(localeFromPathname('/english'), 'fr');
});

test('public pages have a slug per language and round-trip between them', () => {
  assert.equal(publicPath('home', 'fr'), '/');
  assert.equal(publicPath('home', 'en'), '/en');
  assert.equal(publicPath('about', 'fr'), '/a-propos');
  assert.equal(publicPath('about', 'en'), '/en/about');
  assert.equal(localizedPath('/a-propos', 'en'), '/en/about');
  assert.equal(localizedPath('/en/about', 'fr'), '/a-propos');
  assert.equal(localizedPath('/en/about', 'en'), '/en/about');
  assert.equal(localizedPath('/a-propos/', 'en'), '/en/about');
  assert.equal(routeIdFromPathname('/en/privacy'), 'privacy');
  assert.equal(routeIdFromPathname('/confidentialite'), 'privacy');
  assert.equal(routeIdFromPathname('/nope'), null);
});

test('unknown paths only gain or lose the /en prefix', () => {
  assert.equal(localizedPath('/', 'en'), '/en');
  assert.equal(localizedPath('/', 'fr'), '/');
  assert.equal(localizedPath('/unknown', 'en'), '/en/unknown');
  assert.equal(localizedPath('/en/unknown', 'fr'), '/unknown');
  assert.equal(localizedPath('unknown', 'en'), '/en/unknown');
  assert.equal(stripLocalePrefix('/en'), '/');
  assert.equal(stripLocalePrefix('/en/x/y'), '/x/y');
});

test('formatting locales are Canadian and the alternate locale flips', () => {
  assert.equal(intlLocale('fr'), 'fr-CA');
  assert.equal(intlLocale('en'), 'en-CA');
  assert.equal(alternateLocale('fr'), 'en');
  assert.equal(alternateLocale('en'), 'fr');
});
