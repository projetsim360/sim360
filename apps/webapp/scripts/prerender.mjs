// Build step: render the public pages to static HTML so the first paint needs no JavaScript.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle in dist/ssr).
// Usage: node scripts/prerender.mjs
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PRERENDERED_PAGES } from '../public-paths.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'site.html'), 'utf8');
const { render } = await import(pathToFileURL(join(dist, 'ssr', 'site-prerender.js')).href);

for (const page of PRERENDERED_PAGES) {
  const rendered = render(page.path);
  // React 19 hoists resource hints (e.g. the preload of an <img fetchPriority="high">) to the start
  // of a fragment render. They belong in <head>; left inside #root they break hydration.
  const hoisted = rendered.html.match(/^(?:<link [^>]*\/>)+/)?.[0] ?? '';
  const html = rendered.html.slice(hoisted.length);
  const { htmlAttributes } = rendered;
  const head = [rendered.head, hoisted].filter(Boolean).join('\n    ');
  // Replacer functions only: a replacement *string* interprets `$1`, `$19`… and the page contains prices.
  const out = template
    // <html> keeps its classes, the language comes from the page
    .replace(/<html([^>]*)\slang="[^"]*"/, (_, attrs) => `<html${attrs} ${htmlAttributes || 'lang="fr"'}`)
    // the page owns its title, description and alternates
    .replace(/\s*<title>[^<]*<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*\/>/, '')
    .replace('</head>', () => `    ${head}\n  </head>`)
    .replace(/(<div[^>]*id="root"[^>]*>)(<\/div>)/, (_, open, close) => open + html + close);
  writeFileSync(join(dist, page.file), out);
  console.log(`prerendered ${page.path} → ${page.file} (${Math.round(out.length / 1024)} KB)`);
}

rmSync(join(dist, 'ssr'), { recursive: true, force: true });
