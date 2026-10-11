// Accessibility sweep of every public page in both languages with axe-core (loaded from cdnjs,
// pinned version). Fails on "serious" and "critical" violations; "moderate" ones are listed.
// Usage: node tests/e2e/a11y.smoke.mjs <baseUrl>
import { chromium } from 'playwright';
import { PUBLIC_ROUTES } from '../../apps/webapp/public-paths.mjs';

const [base = 'http://localhost:4173'] = process.argv.slice(2);
const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';

const browser = await chromium.launch();
let failed = false;

for (const route of PUBLIC_ROUTES) {
  for (const locale of ['fr', 'en']) {
    const path = route[locale];
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: locale === 'fr' ? 'fr-CA' : 'en-CA' });
    await context.route('**/api/v1/public/scenarios', (r) =>
      r.fulfill({ json: [{ id: 's1', title: 'Migration infonuagique', description: 'ERP vers le nuage.', sector: 'IT', difficulty: 'BEGINNER', scenarioType: 'GREENFIELD', estimatedDurationHours: 2, requiredPlan: 'FREE', competencies: ['Planification'], objectives: [], phaseCount: 5 }] }),
    );
    await context.route('**/api/v1/**', (r) => r.fulfill({ status: 401, json: {} }));
    const page = await context.newPage();
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.addScriptTag({ url: AXE });
    const result = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
    });
    const blocking = result.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const moderate = result.filter((v) => v.impact === 'moderate' || v.impact === 'minor');
    if (blocking.length) failed = true;
    console.log(`${blocking.length ? 'FAIL' : 'ok  '} ${locale} ${route.id} (${path})${blocking.length ? '' : moderate.length ? `  ${moderate.length} moderate/minor` : ''}`);
    for (const v of blocking) console.log(`     ${v.impact}: ${v.id} — ${v.help} — ${v.nodes.join(' | ').slice(0, 160)}`);
    for (const v of moderate) console.log(`     (${v.impact}) ${v.id} — ${v.nodes.join(' | ').slice(0, 120)}`);
    await context.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
