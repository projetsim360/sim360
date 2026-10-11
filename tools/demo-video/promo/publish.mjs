// Publishes the rendered promo into the public site: MP4 (as rendered), WebM (VP9/Opus),
// WebVTT subtitles built from the narration timeline, and the poster frame.
// Usage: node tools/demo-video/promo/publish.mjs
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', '..', '..');
const OUT = join(ROOT, 'apps/webapp/public/media/landing');
mkdirSync(OUT, { recursive: true });

// Narration clips start at these times in index.html (audio data-start).
const STARTS = [0.4, 5.4, 13.4, 23.6, 31.1, 39.1, 46.6, 55.1];
const narration = JSON.parse(readFileSync(join(here, 'narration.json'), 'utf8'));
const durations = JSON.parse(readFileSync(join(here, 'assets/audio/durations.json'), 'utf8'));
const ts = (s) => new Date(s * 1000).toISOString().slice(11, 23);
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString();

for (const lang of ['fr', 'en']) {
  const mp4 = join(here, 'renders', `demo-${lang}.mp4`);
  copyFileSync(mp4, join(OUT, `demo-${lang}.mp4`));
  sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '33', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '64k', join(OUT, `demo-${lang}.webm`)]);
  const cues = narration[lang].map((text, i) => `${i + 1}\n${ts(STARTS[i])} --> ${ts(STARTS[i] + durations[lang][i] + 0.3)}\n${text}\n`);
  writeFileSync(join(OUT, `demo-${lang}.vtt`), `WEBVTT\n\n${cues.join('\n')}`);
  console.log(`${lang}: mp4 ${(statSize(join(OUT, `demo-${lang}.mp4`)) / 1e6).toFixed(1)} MB, webm ${(statSize(join(OUT, `demo-${lang}.webm`)) / 1e6).toFixed(1)} MB`);
}

// Poster: the wordmark beat of the French render.
const png = join(here, 'renders', 'poster.png');
sh('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '4.7', '-i', join(here, 'renders', 'demo-fr.mp4'), '-frames:v', '1', png]);
const require = createRequire(join(ROOT, 'libs/core/package.json'));
const sharp = require('sharp');
await sharp(png).resize({ width: 1280 }).webp({ quality: 80 }).toFile(join(OUT, 'demo-poster.webp'));
console.log('poster written');

function statSize(file) {
  return Number(sh('stat', ['-f%z', file]));
}
