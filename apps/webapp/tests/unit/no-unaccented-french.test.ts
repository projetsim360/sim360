import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Regression guard for the user-test feedback on missing accents: fails when a common French
 * word appears without its accents inside a string literal or JSX text of the webapp.
 * Legacy template layouts and generic UI primitives are excluded.
 */
const SRC = join(dirname(fileURLToPath(import.meta.url)), '../../src');
const EXCLUDED = [/components[/\\]layouts[/\\]layout-\d+/, /components[/\\]ui[/\\]/, /pages[/\\]layout-\d+/];

const FORBIDDEN = [
  'Reunion', 'reunion', 'reunions', 'Equipe', 'equipe', 'Parametres', 'parametres', 'deja', 'Delai', 'delai',
  'Qualite', 'qualite', 'Telecharger', 'telecharger', 'Etape', 'Prenom', 'prenom', 'Debutant', 'Intermediaire',
  'Selectionnez', 'selectionnez', 'Evenement', 'evenements', 'Echeance', 'echeance', 'Succes', 'succes',
  'Creer', 'Cree', 'Generer', 'genere', 'Precedent', 'Securite', 'securite', 'Competences', 'competences',
  'Telephone', 'Strategie', 'resultats', 'Resultats',
];
const WORD = new RegExp(`(^|[^A-Za-zÀ-ÿ_.$])(${FORBIDDEN.join('|')})(?=[^A-Za-zÀ-ÿ_]|$)`);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (EXCLUDED.some((re) => re.test(full))) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|ts)$/.test(name)) out.push(full);
  }
  return out;
}

/** Text a user can see: string/template literals and JSX text between tags. */
function visibleChunks(line: string): string[] {
  const chunks: string[] = [];
  for (const m of line.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g)) chunks.push(m[0]);
  for (const m of line.matchAll(/>([^<>{}]+)</g)) chunks.push(m[1]);
  return chunks;
}

test('no common French word without its accents in webapp UI text', () => {
  const offenders: string[] = [];
  for (const file of walk(SRC)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      for (const chunk of visibleChunks(line)) {
        // Skip import paths, query keys and code-like tokens (no spaces, snake/camel case).
        if (/^['"`][\w./@:-]*['"`]$/.test(chunk)) continue;
        const m = chunk.match(WORD);
        if (m) offenders.push(`${relative(SRC, file)}:${i + 1}  « ${m[2]} »`);
      }
    });
  }
  assert.deepEqual(offenders, [], `Unaccented French found:\n${offenders.join('\n')}`);
});
