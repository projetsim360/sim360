import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Learner-facing screens talk about "participants simulés", "mentor virtuel", "assistant" or
 * "analyse automatique", never about "IA" (roadmap lot 7). Administration screens
 * (token usage, admin menus) legitimately keep the term and are excluded.
 */
const SRC = join(dirname(fileURLToPath(import.meta.url)), '../../src');
const EXCLUDED = [
  /components[/\\]layouts[/\\]layout-\d+/,
  /components[/\\]ui[/\\]/,
  /pages[/\\]layout-\d+/,
  /features[/\\]dashboard[/\\]pages[/\\]token-usage\.tsx$/,
  /features[/\\]dashboard[/\\]config[/\\]dashboard\.menu\.ts$/,
  /config[/\\]menu\.config\.ts$/,
  /features[/\\]admin-reference[/\\]/,
];
const WORD = /(^|[^A-Za-zÀ-ÿ_])IA(?=[^A-Za-zÀ-ÿ_]|$)/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (EXCLUDED.some((re) => re.test(full))) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

/** Text a user can see: string/template literals and JSX text between tags. */
function visibleChunks(line: string): string[] {
  const chunks: string[] = [];
  for (const m of line.matchAll(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g)) chunks.push(m[0]);
  for (const m of line.matchAll(/>([^<>{}]+)</g)) chunks.push(m[1]);
  for (const m of line.matchAll(/\}([^<>{}]+)</g)) chunks.push(m[1]);
  return chunks;
}

test('no « IA » in learner-facing webapp text', () => {
  const offenders: string[] = [];
  for (const file of walk(SRC)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('{/*')) return;
      for (const chunk of visibleChunks(line)) {
        if (/^['"`][\w./@:-]*['"`]$/.test(chunk)) continue;
        if (WORD.test(chunk)) offenders.push(`${relative(SRC, file)}:${i + 1}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `« IA » found in learner-facing text:\n${offenders.join('\n')}`);
});
