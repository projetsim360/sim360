// Builds the demo video of the public site for both languages:
//   1. narration with the macOS speech synthesiser (one clip per scene, durations measured)
//   2. screen recording of the site with Playwright, scene durations following the narration
//   3. assembly with ffmpeg: audio track, MP4 (H.264) and WebM (VP9/Opus), poster, subtitles
// Usage: node tools/demo-video/run.mjs [--base http://localhost:4173] [--out apps/webapp/public/media/landing] [--locale fr|en]
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { SCENES, VOICES, CATALOGUE_FIXTURE } from './scenes.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]] : [])).filter((e) => e.length));
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = args.base ?? 'http://localhost:4173';
const OUT = join(ROOT, args.out ?? 'apps/webapp/public/media/landing');
const LOCALES = args.locale ? [args.locale] : ['fr', 'en'];
const WORK = join(ROOT, 'tools/demo-video/.work');
const WIDTH = 1280;
const HEIGHT = 720;
const GAP = 0.7; // seconds of air after each narration

const sh = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const probeDuration = (file) => Number(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).trim());

// ─── 1. Narration ───────────────────────────────────────────────────────────
function narrate(locale) {
  const dir = join(WORK, locale);
  mkdirSync(dir, { recursive: true });
  return SCENES.map((scene) => {
    const file = join(dir, `${scene.id}.aiff`);
    sh('say', ['-v', VOICES[locale], '-r', '175', '-o', file, scene.narration[locale]]);
    const audio = probeDuration(file);
    return { ...scene, file, audio, seconds: Math.max(scene.minSeconds, audio + GAP) };
  });
}

// ─── 2. Recording ───────────────────────────────────────────────────────────
const OVERLAY = `
(() => {
  const el = document.createElement('div');
  el.id = 'demo-overlay';
  el.style.cssText = 'position:fixed;left:48px;bottom:48px;z-index:9999;padding:14px 22px;border-radius:14px;background:rgba(15,26,46,.86);backdrop-filter:blur(8px);color:#fff;font:600 22px/1.2 Montserrat,Inter,system-ui,sans-serif;letter-spacing:-.01em;opacity:0;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease;box-shadow:0 12px 40px rgba(0,0,0,.35);border-left:4px solid #ee7a3a';
  document.body.appendChild(el);
  window.__demoTitle = (text) => {
    if (!text) { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; return; }
    el.textContent = text; el.style.opacity = '1'; el.style.transform = 'translateY(0)';
  };
})();`;

async function scrollTo(page, selector, block = 'center') {
  await page.evaluate(
    ([sel, blk]) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: blk }),
    [selector, block],
  );
}

async function record(locale, scenes) {
  const dir = join(WORK, locale);
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: { dir, size: { width: WIDTH, height: HEIGHT } },
    locale: locale === 'fr' ? 'fr-CA' : 'en-CA',
    reducedMotion: 'no-preference',
  });
  await context.route('**/api/v1/public/scenarios', (r) => r.fulfill({ json: CATALOGUE_FIXTURE }));
  await context.route('**/api/v1/**', (r) => r.fulfill({ status: 401, json: {} }));
  const page = context.pages()[0] ?? (await context.newPage());
  const home = locale === 'en' ? '/en' : '/';
  const catalogue = locale === 'en' ? '/en/scenarios' : '/scenarios';
  const startedAt = Date.now();
  const timeline = [];
  const hold = async (seconds) => page.waitForTimeout(seconds * 1000);

  await page.goto(`${BASE}${home}`, { waitUntil: 'networkidle' });
  await page.addInitScript(OVERLAY);
  await page.evaluate(OVERLAY);
  const title = (text) => page.evaluate((t) => window.__demoTitle(t), text);

  for (const scene of scenes) {
    const start = (Date.now() - startedAt) / 1000;
    switch (scene.action) {
      case 'home':
        await hold(0.8);
        break;
      case 'pilot':
        await scrollTo(page, '#pilote');
        break;
      case 'step1':
        await scrollTo(page, '#comment-ca-marche > div > div.relative > div:nth-child(2)');
        break;
      case 'step2':
        await scrollTo(page, '#comment-ca-marche > div > div.relative > div:nth-child(3)');
        break;
      case 'step3':
        await scrollTo(page, '#comment-ca-marche > div > div.relative > div:nth-child(4)');
        break;
      case 'catalogue':
        await page.goto(`${BASE}${catalogue}`, { waitUntil: 'networkidle' });
        await page.evaluate(OVERLAY);
        await hold(1.2);
        await page.locator('main [aria-pressed]').nth(1).click();
        await hold(1.6);
        await page.locator('main [aria-pressed]').nth(3).click();
        await hold(1.6);
        await page.locator('main [aria-pressed]').nth(0).click();
        break;
      case 'pricing':
        await page.goto(`${BASE}${home}`, { waitUntil: 'networkidle' });
        await page.evaluate(OVERLAY);
        await scrollTo(page, '#tarifs', 'start');
        await hold(2.2);
        await page.locator('#tarifs [role="radio"]').nth(1).click();
        break;
      case 'outro':
        await scrollTo(page, 'footer', 'start');
        break;
    }
    await title(scene.title[locale]);
    const elapsed = (Date.now() - startedAt) / 1000 - start;
    await hold(Math.max(0, scene.seconds - elapsed));
    await title('');
    timeline.push({ id: scene.id, start, end: (Date.now() - startedAt) / 1000 });
  }
  await hold(0.6);
  const video = page.video();
  await context.close();
  const file = await video.path();
  return { file, timeline };
}

// ─── 3. Assembly ────────────────────────────────────────────────────────────
function vtt(timeline, scenes, locale) {
  const ts = (s) => new Date(s * 1000).toISOString().slice(11, 23);
  const cues = timeline.map((t, i) => {
    const scene = scenes[i];
    const end = Math.min(t.end, t.start + scene.audio + 0.4);
    return `${i + 1}\n${ts(t.start)} --> ${ts(end)}\n${scene.narration[locale]}\n`;
  });
  return `WEBVTT\n\n${cues.join('\n')}`;
}

async function assemble(locale, scenes, recording) {
  const { file, timeline } = recording;
  const dir = join(WORK, locale);
  // Audio track: every narration delayed to its scene start, mixed over silence of the video length.
  const total = probeDuration(file);
  const inputs = scenes.flatMap((s) => ['-i', s.file]);
  const delays = scenes.map((_, i) => `[${i + 1}]adelay=${Math.round(timeline[i].start * 1000)}|${Math.round(timeline[i].start * 1000)}[d${i}]`).join(';');
  const mix = `[0]${scenes.map((_, i) => `[d${i}]`).join('')}amix=inputs=${scenes.length + 1}:duration=first:normalize=0,volume=1.6[a]`;
  const audio = join(dir, 'narration.m4a');
  sh('ffmpeg', ['-y', '-f', 'lavfi', '-t', String(total), '-i', 'anullsrc=r=22050:cl=mono', ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '[a]', '-c:a', 'aac', '-b:a', '96k', audio]);

  const mp4 = join(OUT, `demo-${locale}.mp4`);
  const webm = join(OUT, `demo-${locale}.webm`);
  sh('ffmpeg', ['-y', '-i', file, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', '-shortest', mp4]);
  sh('ffmpeg', ['-y', '-i', file, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-r', '30', '-c:a', 'libopus', '-b:a', '64k', '-shortest', webm]);
  writeFileSync(join(OUT, `demo-${locale}.vtt`), vtt(timeline, scenes, locale));

  if (locale === 'fr') {
    const png = join(dir, 'poster.png');
    sh('ffmpeg', ['-y', '-ss', '2.5', '-i', file, '-frames:v', '1', png]);
    const require = createRequire(join(ROOT, 'libs/core/package.json'));
    const sharp = require('sharp');
    await sharp(png).webp({ quality: 80 }).toFile(join(OUT, 'demo-poster.webp'));
  }
  copyFileSync(file, join(dir, 'recording.webm'));
  return { mp4, webm, seconds: total };
}

// ─── Run ────────────────────────────────────────────────────────────────────
rmSync(WORK, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const locale of LOCALES) {
  console.log(`[${locale}] narration…`);
  const scenes = narrate(locale);
  console.log(`[${locale}] recording ${scenes.reduce((s, x) => s + x.seconds, 0).toFixed(1)} s…`);
  const recording = await record(locale, scenes);
  console.log(`[${locale}] encoding…`);
  const result = await assemble(locale, scenes, recording);
  const size = (f) => Math.round(sh('stat', ['-f%z', f]) / 1024 / 1024 * 10) / 10;
  console.log(`[${locale}] done: ${result.seconds.toFixed(1)} s, mp4 ${size(result.mp4)} MB, webm ${size(result.webm)} MB`);
}
