import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3001/api/v1';
const MAILHOG = 'http://localhost:8025';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    failed++;
  }
}

async function getVerificationToken() {
  const res = await fetch(`${MAILHOG}/api/v2/messages?limit=1`);
  const data = await res.json();
  if (!data.items?.length) return null;
  const body = data.items[0].Content.Body;
  // Decode quoted-printable (basic)
  const decoded = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const match = decoded.match(/token=([a-f0-9]+)/);
  return match ? match[1] : null;
}

async function getResetToken() {
  // Get the most recent email (reset password)
  const res = await fetch(`${MAILHOG}/api/v2/messages?limit=5`);
  const data = await res.json();
  // Find the reset email (most recent)
  for (const item of data.items) {
    const subject = item.Content.Headers.Subject?.[0] || '';
    if (subject.includes('initialisation')) {
      const body = item.Content.Body;
      const decoded = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      const match = decoded.match(/token=([a-f0-9]+)/);
      if (match) return match[1];
    }
  }
  return null;
}

(async () => {
  console.log('🚀 Test E2E Auth Flow - Frontend\n');

  // Clean previous test data
  await fetch(`${MAILHOG}/api/v1/messages`, { method: 'DELETE' });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // ═══════════════════════════════════════════
    console.log('═══ 1. REDIRECT NON CONNECTE ═══');
    // ═══════════════════════════════════════════
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL('**/auth/sign-in', { timeout: 5000 });
    assert(page.url().includes('/auth/sign-in'), 'Redirect vers /auth/sign-in quand non connecté');

    // ═══════════════════════════════════════════
    console.log('\n═══ 2. PAGE SIGN-IN ═══');
    // ═══════════════════════════════════════════
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    assert(await page.isVisible('input[type="email"]'), 'Champ email visible');
    assert(await page.isVisible('input[type="password"]'), 'Champ password visible');
    assert(await page.isVisible('text=Se connecter'), 'Bouton "Se connecter" visible');
    assert(await page.isVisible('text=Mot de passe oublié'), 'Lien "Mot de passe oublié" visible');

    // Navigate to sign-up
    await page.click('text=S\'inscrire');
    await page.waitForURL('**/auth/sign-up', { timeout: 5000 });
    assert(page.url().includes('/auth/sign-up'), 'Navigation vers sign-up');

    // ═══════════════════════════════════════════
    console.log('\n═══ 3. PAGE SIGN-UP ═══');
    // ═══════════════════════════════════════════
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    assert(await page.isVisible('input[placeholder="Jean"]'), 'Champ prénom visible');
    assert(await page.isVisible('input[placeholder="Dupont"]'), 'Champ nom visible');
    assert(await page.isVisible('input[type="email"]'), 'Champ email visible');

    // Check GDPR checkbox exists
    const gdprCheckbox = page.locator('input[type="checkbox"]');
    assert(await gdprCheckbox.count() > 0, 'Checkbox GDPR présente');

    // Fill form
    await page.fill('input[placeholder="Jean"]', 'Marie');
    await page.fill('input[placeholder="Dupont"]', 'Tester');
    await page.fill('input[type="email"]', 'e2e@sim360.dev');

    // Wait a bit for email check debounce
    await page.waitForTimeout(800);

    // Fill passwords
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('E2eTest1@');
    await passwordInputs.nth(1).fill('E2eTest1@');

    // Check GDPR
    await gdprCheckbox.first().check();

    // Check password strength indicator appears
    const strengthIndicator = page.locator('text=Fort');
    // May or may not appear depending on exact strength - just check password was accepted

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to verify-email-sent
    await page.waitForURL('**/auth/verify-email-sent', { timeout: 10000 });
    assert(page.url().includes('/auth/verify-email-sent'), 'Redirect vers verify-email-sent après inscription');

    // ═══════════════════════════════════════════
    console.log('\n═══ 4. PAGE VERIFY-EMAIL-SENT ═══');
    // ═══════════════════════════════════════════
    await page.waitForSelector('text=Vérifiez votre email', { timeout: 5000 }).catch(() => {});
    assert(await page.isVisible('text=Vérifiez votre email'), 'Message "Vérifiez votre email" visible');
    assert(await page.isVisible('text=Renvoyer le lien'), 'Bouton "Renvoyer" visible');

    // ═══════════════════════════════════════════
    console.log('\n═══ 5. VERIFICATION EMAIL ═══');
    // ═══════════════════════════════════════════
    // Get token from MailHog
    await page.waitForTimeout(1000);
    const verifyToken = await getVerificationToken();
    assert(!!verifyToken, 'Token de vérification trouvé dans MailHog');

    // Navigate to verify-email with token
    await page.goto(`${BASE}/auth/verify-email?token=${verifyToken}`);
    await page.waitForSelector('text=Email vérifié', { timeout: 10000 }).catch(async () => {
      await page.screenshot({ path: '/tmp/sim360-verify-debug.png' });
      console.log('  🔍 Debug: page content at verify-email:', await page.textContent('body'));
    });

    // Should show success
    const verifySuccess = await page.isVisible('text=Email vérifié') || await page.isVisible('text=vérifié');
    assert(verifySuccess, 'Message de succès de vérification');

    // Click "Se connecter"
    const loginLink = page.locator('a:has-text("Se connecter")');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/auth/sign-in', { timeout: 5000 });
    } else {
      await page.goto(`${BASE}/auth/sign-in`);
    }

    // ═══════════════════════════════════════════
    console.log('\n═══ 6. LOGIN ═══');
    // ═══════════════════════════════════════════
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', 'e2e@sim360.dev');
    await page.locator('input[type="password"]').first().fill('E2eTest1@');

    // Check "Remember me"
    const rememberMe = page.locator('input[type="checkbox"]');
    if (await rememberMe.count() > 0) {
      await rememberMe.first().check();
    }

    await page.click('button[type="submit"]');

    // Should redirect to wizard (profileCompleted = false)
    await page.waitForURL('**/profile/wizard', { timeout: 10000 });
    assert(page.url().includes('/profile/wizard'), 'Redirect vers profile wizard après premier login');

    // ═══════════════════════════════════════════
    console.log('\n═══ 7. PROFILE WIZARD ═══');
    // ═══════════════════════════════════════════
    await page.waitForSelector('text=Bienvenue', { timeout: 5000 });
    assert(await page.isVisible('text=Bienvenue'), 'Page wizard visible');

    // Step 1: Basic info (should be pre-filled)
    const firstNameInput = page.locator('input').first();
    const firstNameValue = await firstNameInput.inputValue();
    assert(firstNameValue === 'Marie', 'Prénom pré-rempli');

    // Add job title
    const jobTitleInput = page.locator('input[placeholder*="Chef"]');
    if (await jobTitleInput.isVisible()) {
      await jobTitleInput.fill('Testeur E2E');
    }
    await page.click('text=Suivant');

    // Step 2: Language
    await page.waitForTimeout(500);
    assert(await page.isVisible('text=Langue'), 'Step langue visible');
    // French should be pre-selected, click it to be sure
    await page.click('text=Français');
    await page.click('text=Suivant');

    // Step 3: Experience
    await page.waitForTimeout(500);
    assert(await page.isVisible('text=expérience'), 'Step expérience visible');
    await page.click('text=Intermédiaire');
    await page.click('text=Suivant');

    // Step 4: Photo (optional)
    await page.waitForTimeout(500);
    assert(await page.isVisible('text=Photo'), 'Step photo visible');

    // Click "Terminer" (skip photo)
    await page.click('text=Terminer');

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    assert(page.url().includes('/dashboard') || page.url().endsWith('/'), 'Redirect vers dashboard après wizard');

    // ═══════════════════════════════════════════
    console.log('\n═══ 8. DASHBOARD PROTEGE ═══');
    // ═══════════════════════════════════════════
    // Wait for dashboard to load
    await page.waitForTimeout(2000);
    // Verify we're still on dashboard (not redirected back to sign-in)
    const currentUrl = page.url();
    assert(!currentUrl.includes('/auth/'), 'Pas de redirect vers auth (connecté)');

    // Check localStorage has tokens
    const hasAccessToken = await page.evaluate(() => !!localStorage.getItem('sim360_access_token'));
    const hasRefreshToken = await page.evaluate(() => !!localStorage.getItem('sim360_refresh_token'));
    assert(hasAccessToken, 'Access token dans localStorage');
    assert(hasRefreshToken, 'Refresh token dans localStorage');

    // ═══════════════════════════════════════════
    console.log('\n═══ 9. PROFILE EDIT ═══');
    // ═══════════════════════════════════════════
    await page.goto(`${BASE}/profile/edit`);
    await page.waitForSelector('text=Mon profil', { timeout: 5000 });
    assert(await page.isVisible('text=Mon profil'), 'Page profil visible');
    assert(await page.isVisible('text=Informations personnelles'), 'Section infos personnelles');
    assert(await page.isVisible('text=Changer le mot de passe'), 'Section changement mdp');

    // Check email is readonly
    const emailInput = page.locator('input[disabled]');
    assert(await emailInput.count() > 0, 'Email en lecture seule');

    // Update bio
    const bioField = page.locator('textarea');
    if (await bioField.isVisible()) {
      await bioField.fill('Testeuse professionnelle E2E');
      await page.click('button:has-text("Sauvegarder")');
      await page.waitForTimeout(2000);
      // Check for toast
      const toast = await page.isVisible('text=Profil mis à jour');
      assert(toast, 'Toast "Profil mis à jour" affiché');
    }

    // ═══════════════════════════════════════════
    console.log('\n═══ 10. FORGOT PASSWORD FLOW ═══');
    // ═══════════════════════════════════════════
    // Logout first by clearing tokens
    await page.evaluate(() => {
      localStorage.removeItem('sim360_access_token');
      localStorage.removeItem('sim360_refresh_token');
    });
    await page.goto(`${BASE}/auth/forgot-password`);
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    assert(await page.isVisible('text=Mot de passe oublié'), 'Page forgot-password visible');

    await page.fill('input[type="email"]', 'e2e@sim360.dev');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/auth/check-email', { timeout: 10000 });
    assert(page.url().includes('/auth/check-email'), 'Redirect vers check-email');
    await page.waitForSelector('text=Vérifiez votre email', { timeout: 5000 }).catch(() => {});
    assert(await page.isVisible('text=Vérifiez votre email'), 'Message check-email visible');

    // Get reset token
    await page.waitForTimeout(1000);
    const resetToken = await getResetToken();
    assert(!!resetToken, 'Token de reset trouvé dans MailHog');

    // ═══════════════════════════════════════════
    console.log('\n═══ 11. RESET PASSWORD ═══');
    // ═══════════════════════════════════════════
    if (resetToken) {
      await page.goto(`${BASE}/auth/reset-password?token=${resetToken}`);
      await page.waitForSelector('text=Nouveau mot de passe', { timeout: 5000 });
      assert(await page.isVisible('text=Nouveau mot de passe'), 'Page reset-password visible');

      const pwdInputs = page.locator('input[type="password"]');
      await pwdInputs.nth(0).fill('NewE2ePass1@');
      await pwdInputs.nth(1).fill('NewE2ePass1@');

      await page.click('button[type="submit"]');
      await page.waitForURL('**/auth/reset-password-success', { timeout: 10000 });
      assert(page.url().includes('/auth/reset-password-success'), 'Redirect vers reset-password-success');
      await page.waitForSelector('text=réinitialisé', { timeout: 5000 }).catch(() => {});
      assert(await page.isVisible('text=réinitialisé'), 'Message succès visible');
    }

    // ═══════════════════════════════════════════
    console.log('\n═══ 12. LOGIN AVEC NOUVEAU MDP ═══');
    // ═══════════════════════════════════════════
    await page.goto(`${BASE}/auth/sign-in`);
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', 'e2e@sim360.dev');
    await page.locator('input[type="password"]').first().fill('NewE2ePass1@');
    await page.click('button[type="submit"]');

    // Should go to dashboard (profile already completed)
    await page.waitForURL(url => !url.toString().includes('/auth/'), { timeout: 10000 });
    const finalUrl = page.url();
    assert(!finalUrl.includes('/auth/'), 'Login avec nouveau mdp réussi');
    assert(finalUrl.includes('/dashboard') || finalUrl.endsWith('/'), 'Redirect vers dashboard');

  } catch (err) {
    console.error(`\n💥 ERREUR: ${err.message}`);
    failed++;
    // Take screenshot on error
    await page.screenshot({ path: '/tmp/sim360-e2e-error.png' });
    console.log('Screenshot saved: /tmp/sim360-e2e-error.png');
  } finally {
    await browser.close();
  }

  // Clean up test user
  try {
    // Use API to check we can still interact
    const cleanRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e@sim360.dev', password: 'NewE2ePass1@' })
    });
    if (cleanRes.ok) {
      console.log('\n✅ Nettoyage: login final vérifié via API');
    }
  } catch {}

  console.log(`\n${'═'.repeat(44)}`);
  console.log(`  RESULTATS: ${passed} passés, ${failed} échoués`);
  console.log(`${'═'.repeat(44)}`);

  process.exit(failed > 0 ? 1 : 0);
})();
