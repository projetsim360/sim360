import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fr } from '../../src/i18n/app/fr';
import { en } from '../../src/i18n/app/en';
import { resolveInitialLocale, appIntlLocale } from '../../src/i18n/app/locale';
import { MENU_LABEL_KEYS } from '../../src/i18n/app/menu-labels';

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)[,}]|<(\w+)>/g)].map((m) => m[1] ?? m[2]).sort();

test('both app catalogues declare the same keys, none empty', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(fr).sort());
  for (const [key, value] of Object.entries({ ...fr, ...en })) assert.ok(value.trim().length > 0, `empty message for ${key}`);
});

test('placeholders and rich tags match between languages', () => {
  for (const key of Object.keys(fr) as (keyof typeof fr)[]) {
    assert.deepEqual(placeholders(en[key]), placeholders(fr[key]), `placeholder mismatch for ${key}`);
  }
});

test('every menu title the shell translates has a message', () => {
  for (const key of Object.values(MENU_LABEL_KEYS)) assert.ok(key in fr, `missing ${key}`);
});

test('initial locale: ?lang, then saved choice, then browser, then French', () => {
  assert.equal(resolveInitialLocale({ search: '?lang=en', stored: 'fr', languages: ['fr-CA'] }), 'en');
  assert.equal(resolveInitialLocale({ search: '?lang=de', stored: 'en' }), 'en');
  assert.equal(resolveInitialLocale({ stored: null, languages: ['en-US', 'fr-CA'] }), 'en');
  assert.equal(resolveInitialLocale({ languages: ['es-MX', 'fr-CA'] }), 'fr');
  assert.equal(resolveInitialLocale({ languages: ['de-DE'] }), 'fr');
  assert.equal(resolveInitialLocale({}), 'fr');
  assert.equal(appIntlLocale('en'), 'en-CA');
  assert.equal(appIntlLocale('fr'), 'fr-CA');
});

/**
 * Folders already converted to the catalogue: no French left in visible text. Extend the list
 * as each batch lands. Comments, imports, class names and ids are ignored, and so is a line
 * marked `i18n-ignore` (e.g. language names written in their own language).
 */
const SRC = join(dirname(fileURLToPath(import.meta.url)), '../../src');
const CONVERTED = [
  'pages/auth',
  'components/auth',
  'components/layouts/simex-shell/components/sidebar.tsx',
  'components/layouts/simex-shell/components/topbar.tsx',
  'components/layouts/simex-shell/components/user-menu.tsx',
  'components/layouts/simex-shell/components/search-modal.tsx',
  'components/layouts/simex-shell/components/pmo-panel.tsx',
  'components/layouts/simex-shell/components/workspace-switcher.tsx',
  'features/dashboard/components',
  'features/dashboard/pages/dashboard.tsx',
  'components/ui/guided-tour.tsx',
  'features/profile/pages',
  'features/profile/components',
  'features/profile/config/onboarding.config.ts',
  'pages/profile/wizard.tsx',
  'features/simulation/pages',
  'features/simulation/components',
  'features/meeting/pages',
  'features/meeting/components',
  'features/deliverables/pages',
  'features/deliverables/components',
  'features/report/pages',
];
const FRENCH = /[À-ÿ]|\b(le|la|les|des|du|une|et|vous|votre|vos|pour|avec|dans|aucun|aucune|Mes|Mon|Votre|Nouvelle|Voir|Rechercher|Fermer|Annuler|Retour|Suivant)\b/;

function files(path: string): string[] {
  const full = join(SRC, path);
  if (!statSync(full).isDirectory()) return [full];
  return readdirSync(full).flatMap((n) => files(join(path, n)));
}

test('converted screens contain no hard-coded French', () => {
  const offenders: string[] = [];
  for (const file of CONVERTED.flatMap(files).filter((f) => /\.tsx?$/.test(f))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const t = line.trim();
      if (t.includes('i18n-ignore')) return;
      if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*') || t.startsWith('import ')) return;
      const chunks: string[] = [];
      for (const m of line.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) chunks.push(m[1] ?? m[2] ?? m[3] ?? '');
      for (const m of line.matchAll(/>([^<>{}]*[A-Za-zÀ-ÿ]{2,}[^<>{}]*)</g)) chunks.push(m[1]);
      if (!/[<>{}=;()[\]]/.test(t) && /[A-Za-zÀ-ÿ]{3,}/.test(t)) chunks.push(t);
      if (chunks.some((c) => FRENCH.test(c) && !/^[\w\-./:@#[\]%&>=!?, ]*$/.test(c) || /[À-ÿ]/.test(c))) {
        offenders.push(`${relative(SRC, file)}:${i + 1}: ${t.slice(0, 90)}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `French text left in converted screens:\n${offenders.join('\n')}`);
});
