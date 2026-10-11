// Every public page, both languages, on the production build (vite preview): prerendered HTML,
// language, headings, language switcher round-trip, catalogue and contact form with a stubbed API.
// Usage: node tests/e2e/public-pages.smoke.mjs <baseUrl> <outDir>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { PUBLIC_ROUTES } from '../../apps/webapp/public-paths.mjs';

const [base = 'http://localhost:4173', out = '.'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const SCENARIOS = [
  { id: 's1', title: 'Migration infonuagique', description: 'Déplacer un ERP vers le nuage sans arrêter la production.', sector: 'IT', difficulty: 'BEGINNER', scenarioType: 'GREENFIELD', estimatedDurationHours: 2, requiredPlan: 'FREE', competencies: ['Planification', 'Risques'], objectives: [], phaseCount: 5 },
  { id: 's2', title: 'Chantier hospitalier', description: 'Un nouveau pavillon, 18 mois, un budget serré.', sector: 'CONSTRUCTION', difficulty: 'ADVANCED', scenarioType: 'GREENFIELD', estimatedDurationHours: 4, requiredPlan: 'PRO', competencies: ['Parties prenantes'], objectives: [], phaseCount: 6 },
];

const results = [];
const browser = await chromium.launch();

for (const route of PUBLIC_ROUTES) {
  if (route.id === 'home') continue;
  for (const locale of ['fr', 'en']) {
    const path = route[locale];
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: locale === 'fr' ? 'fr-CA' : 'en-CA' });
    const contactCalls = [];
    await context.route('**/api/v1/**', (r) => r.fulfill({ status: 401, json: { message: 'stub' } }));
    await context.route('**/api/v1/public/scenarios', (r) => r.fulfill({ json: SCENARIOS }));
    await context.route('**/api/v1/public/contact', (r) => {
      contactCalls.push(r.request().postDataJSON());
      r.fulfill({ status: 202, json: { received: true } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const raw = await page.request.get(`${base}${path}`);
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    const other = locale === 'fr' ? 'en' : 'fr';
    const checks = {
      status200: raw.status() === 200,
      prerendered: /<h1[\s>]/.test(await raw.text()),
      htmlLang: (await page.evaluate(() => document.documentElement.lang)) === locale,
      h1: (await page.locator('main h1').count()) === 1,
      title: (await page.title()).includes('Simex pro'),
      canonical: (await page.locator('link[rel="canonical"]').getAttribute('href')) === `https://simex-pro.com${path}`,
      switcher: (await page.locator('header a[hreflang]').first().getAttribute('href')) === route[other],
      footerLinks: (await page.locator('footer a[href="#"]').count()) === 0,
      noIa: !/(^|[^A-Za-zÀ-ÿ])IA([^A-Za-zÀ-ÿ]|$)/.test(await page.locator('body').innerText()),
    };

    if (route.id === 'scenarios') {
      checks.cards = (await page.locator('main article').count()) === 2;
      await page.locator('main [aria-pressed]').nth(3).click(); // "Advanced"
      await page.waitForTimeout(200);
      checks.filter = (await page.locator('main article').count()) === 1;
    }
    if (route.id === 'contact') {
      await page.fill('input[name="name"]', 'Marie Tremblay');
      await page.fill('input[name="email"]', 'marie@example.com');
      await page.fill('textarea[name="message"]', 'Bonjour, une démonstration pour mon équipe de 12 personnes.');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(600);
      checks.contactSent = contactCalls.length === 1 && contactCalls[0].locale === locale && contactCalls[0].website === '' && typeof contactCalls[0].elapsedMs === 'number';
      checks.contactSuccess = (await page.locator('main [role="status"]').count()) === 1;
    }
    if (route.id === 'demo') {
      // With the video files published the player is shown; without them, the honest "coming" card.
      const video = await page.request.get(`${base}/media/landing/demo-${locale}.mp4`).then((r) => r.ok() && (r.headers()['content-type'] ?? '').startsWith('video/'));
      checks.demoPlayer = video ? (await page.locator('main video').count()) === 1 : (await page.locator('main a[href="/auth/sign-up"]').count()) >= 1;
      if (video) checks.demoSubtitles = (await page.request.get(`${base}/media/landing/demo-${locale}.vtt`).then((r) => r.text())).startsWith('WEBVTT');
    }
    checks.noPageErrors = errors.length === 0;

    await page.screenshot({ path: `${out}/${locale}-${route.id}.png` });
    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
    results.push({ case: `${locale} ${route.id} (${path})`, failed, errors: errors.slice(0, 1) });
    await context.close();
  }
}
await browser.close();

for (const r of results) console.log(`${r.failed.length ? 'FAIL' : 'ok  '} ${r.case}${r.failed.length ? '  → ' + r.failed.join(', ') : ''}${r.errors.length ? '  errors: ' + r.errors.join(' | ').slice(0, 160) : ''}`);
process.exit(results.some((r) => r.failed.length) ? 1 : 0);
