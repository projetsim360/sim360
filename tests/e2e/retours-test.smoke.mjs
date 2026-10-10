/**
 * Browser smoke test for the "retours test site" fixes.
 * Prerequisites: API on :3001, webapp on :5173, database seeded (admin@sim360.dev).
 * Run: node tests/e2e/retours-test.smoke.mjs   (HEADLESS=0 to watch)
 */
import { chromium } from 'playwright';

const API = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const APP = process.env.APP_URL ?? 'http://localhost:5173';
const EMAIL = process.env.SMOKE_EMAIL ?? 'admin@sim360.dev';
const PASSWORD = process.env.SMOKE_PASSWORD ?? 'Admin123!';

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  ✗ ${name}\n    ${err?.message ?? err}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  assert(res.ok, `login failed: ${res.status}`);
  const body = await res.json();
  assert(body.tokens?.accessToken, 'no access token (2FA enabled on the smoke user?)');
  return body;
}

async function apiGet(path, token) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  assert(res.ok, `GET ${path} → ${res.status}`);
  return res.json();
}

const { tokens, user } = await login();
const browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  console.log(`\n[${viewport.name}]`);
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', locale: 'fr-CA', timezoneId: 'America/Toronto' });
  await context.addInitScript(([a, r]) => {
    localStorage.setItem('sim360_access_token', a);
    localStorage.setItem('sim360_refresh_token', r);
  }, [tokens.accessToken, tokens.refreshToken]);
  const page = await context.newPage();

  await page.goto(`${APP}/dashboard`);
  await page.getByRole('button', { name: /^Passer$/ }).click({ timeout: 3000 }).catch(() => {});

  if (viewport.name === 'desktop') {
    await check('1.9 topbar shows the signed-in user and their real role', async () => {
      const header = page.locator('header.simex-topbar');
      await header.waitFor();
      const text = await header.innerText();
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      assert(text.includes(fullName), `expected "${fullName}" in topbar`);
      // The old hardcoded chip always said "Mentor"; the seed admin must now read "Administrateur".
      const ROLE_LABELS = { SUPER_ADMIN: 'Super administrateur', ADMIN: 'Administrateur', MANAGER: 'Gestionnaire', MENTOR: 'Mentor', MEMBER: 'Apprenant', VIEWER: 'Observateur' };
      const expected = ROLE_LABELS[user.role];
      assert(expected && text.toLowerCase().includes(expected.toLowerCase()), `expected role "${expected}" in topbar`);
    });

    await check('1.8 "Espace …" chip links to the dashboard', async () => {
      const chip = page.locator('a.simex-workspace-switch');
      assert((await chip.getAttribute('href')) === '/dashboard', 'chip is not a link to /dashboard');
    });
  }

  await check('2.2 / 1.1 new simulation page: renamed tab, no AI wording', async () => {
    await page.goto(`${APP}/simulations/new`);
    await page.getByText('Générer une nouvelle simulation').first().waitFor();
    const body = await page.locator('body').innerText();
    assert(!/Générer avec l.IA/.test(body), '"Générer avec l’IA" still present');
    assert(!/par l.IA/.test(body), 'AI mention in subtitle');
  });

  await check('2.1 scenario catalogue offers a sector filter', async () => {
    await page.getByLabel('Filtrer par secteur').waitFor();
  });

  await check('1.2 / 1.1 landing: no fixed scenario count, no "feedback IA"', async () => {
    const ctx = await browser.newContext({ viewport });
    const p = await ctx.newPage();
    await p.goto(`${APP}/`);
    const body = await p.locator('body').innerText();
    await ctx.close();
    assert(!/12 scénarios/.test(body), '"12 scénarios" still on the landing page');
    assert(!/feedback IA/i.test(body), '"feedback IA" still on the landing page');
  });

  await check('1.7 / 1.3 settings: IANA time zone and job title pickers', async () => {
    await page.goto(`${APP}/settings`);
    await page.getByText('Fuseau horaire').first().waitFor();
    const body = await page.locator('body').innerText();
    assert(/America\/|Europe\/|UTC/.test(body), 'time zone is not shown as an IANA id');
    assert(!/GMT \+1:00 - Europe\/Paris/.test(body), 'legacy 4-option list still displayed');
    await page.locator('#profile-job-title').click();
    await page.getByText('Gestionnaire de portefeuille').waitFor();
    await page.keyboard.press('Escape');
  });

  await check('4.1 help assistant answers on any page', async () => {
    await page.goto(`${APP}/dashboard`);
    await page.locator('header.simex-topbar').getByRole('button', { name: /Assistant/ }).click();
    await page.getByRole('button', { name: /^Aide$/ }).click();
    await page.getByLabel('Votre question').fill('Comment planifier une réunion ?');
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await page.getByText('Planifier une réunion').first().waitFor();
  });

  const sims = await apiGet('/simulations', tokens.accessToken).catch(() => []);
  const sim = (Array.isArray(sims) ? sims : sims.data ?? []).find((s) => s.status === 'IN_PROGRESS') ?? null;
  if (sim) {
    await check('5.2 meetings list offers "Planifier une réunion" and the form opens', async () => {
      await page.goto(`${APP}/simulations/${sim.id}/meetings`);
      await page.getByRole('link', { name: /Planifier une réunion/ }).click();
      await page.getByText('Cadre de la réunion').waitFor();
      await page.getByText('Niveau hiérarchique').first().waitFor();
    });

    await check('6.1 "Actions de suivi" page is reachable', async () => {
      await page.goto(`${APP}/simulations/${sim.id}/actions`);
      await page.getByLabel('Nouvelle action').waitFor();
    });
  } else {
    console.log('  - no IN_PROGRESS simulation for this user: meeting/action checks skipped');
  }

  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
