// Visual + behavioural check of the public landing on the production build (vite preview).
// Usage: node landing-check.mjs <baseUrl> <outDir>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4173', out = '.'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const FAKE_USER = { id: 'u1', email: 'marie@example.com', firstName: 'Marie', lastName: 'Tremblay', role: 'LEARNER', avatar: null };
const EXPECT = {
  fr: { lang: 'fr', signIn: 'Connexion', dashboard: 'Tableau de bord', price: '19 $', switch: 'English', switchHref: '/en' },
  en: { lang: 'en', signIn: 'Sign in', dashboard: 'Dashboard', price: '$19', switch: 'Français', switchHref: '/' },
};

const results = [];
const browser = await chromium.launch();

for (const locale of ['fr', 'en']) {
  for (const logged of [false, true]) {
    for (const [w, h, tag] of [[1280, 900, 'desktop'], [375, 812, 'mobile']]) {
      const context = await browser.newContext({ viewport: { width: w, height: h }, locale: locale === 'fr' ? 'fr-CA' : 'en-CA' });
      // Stub the API: session restore returns a learner, everything else is unauthorised.
      // Playwright checks routes last-registered first: the broad 401 stub goes first, the user stub wins.
      await context.route('**/api/v1/**', (route) => route.fulfill({ status: 401, json: { message: 'stub' } }));
      await context.route('**/users/me', (route) => route.fulfill({ json: FAKE_USER }));
      await context.route('**/socket.io/**', (route) => route.abort());
      if (logged) await context.addInitScript(() => localStorage.setItem('sim360_access_token', 'fake.' + btoa(JSON.stringify({ exp: 4102444800 })) + '.sig'));

      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${base}${locale === 'en' ? '/en' : '/'}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      const exp = EXPECT[locale];
      const nav = page.locator('header');
      const checks = {
        htmlLang: (await page.evaluate(() => document.documentElement.lang)) === exp.lang,
        title: (await page.title()).includes('Simex pro'),
        hreflang: (await page.locator('link[rel="alternate"][hreflang]').count()) === 3,
        canonical: (await page.locator('link[rel="canonical"]').getAttribute('href'))?.endsWith(locale === 'en' ? '/en' : '/') ?? false,
        switcher: (await nav.locator(`a[hreflang]:has-text("${exp.switch}")`).first().getAttribute('href')) === exp.switchHref,
        authCta: logged
          ? (await nav.locator('a[href="/dashboard"]', { hasText: exp.dashboard }).count()) >= 1 && (await nav.locator('a[href="/auth/sign-in"]').count()) === 0
          : (await nav.locator('a[href="/auth/sign-in"]', { hasText: exp.signIn }).count()) >= 1 && (await nav.locator('a[href="/dashboard"]').count()) === 0,
        price: (await page.locator('#tarifs').innerText()).replace(/\s/g, ' ').includes(exp.price),
        noFakeProof: !/BOUYGUES|KPMG|12 ?000|650\+/.test(await page.locator('body').innerText()),
        noDeadLinks: (await page.locator('footer a[href="#"]').count()) === 0,
        noIa: !/(^|[^A-Za-zÀ-ÿ])IA([^A-Za-zÀ-ÿ]|$)/.test(await page.locator('body').innerText()),
        noPageErrors: errors.length === 0,
      };
      // Mobile: open the burger menu to screenshot it once
      if (tag === 'mobile') {
        await nav.locator('button[aria-expanded]').click();
        await page.waitForTimeout(300);
        checks.mobileMenuAuth = logged
          ? (await nav.locator('a[href="/dashboard"]', { hasText: exp.dashboard }).count()) >= 1
          : (await nav.locator('a[href="/auth/sign-in"]', { hasText: exp.signIn }).count()) >= 1;
        await page.screenshot({ path: `${out}/${locale}-${logged ? 'logged' : 'guest'}-${tag}-menu.png` });
        await nav.locator('button[aria-expanded]').click();
      }
      await page.screenshot({ path: `${out}/${locale}-${logged ? 'logged' : 'guest'}-${tag}.png` });
      // The document itself does not scroll (html/body are h-full): capture key sections by anchor.
      if (tag === 'desktop') {
        for (const id of ['pilote', 'tarifs', 'faq']) {
          await page.locator(`#${id}`).scrollIntoViewIfNeeded();
          await page.waitForTimeout(700);
          await page.screenshot({ path: `${out}/${locale}-${logged ? 'logged' : 'guest'}-${tag}-${id}.png` });
        }
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${out}/${locale}-${logged ? 'logged' : 'guest'}-${tag}-footer.png` });
      }
      const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
      results.push({ case: `${locale} ${logged ? 'logged' : 'guest'} ${tag}`, failed, errors: errors.slice(0, 2) });
      await context.close();
    }
  }
}
await browser.close();

for (const r of results) console.log(`${r.failed.length ? 'FAIL' : 'ok  '} ${r.case}${r.failed.length ? '  → ' + r.failed.join(', ') : ''}${r.errors.length ? '  errors: ' + r.errors.join(' | ') : ''}`);
process.exit(results.some((r) => r.failed.length) ? 1 : 0);
