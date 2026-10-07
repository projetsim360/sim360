import { test } from 'node:test';
import assert from 'node:assert/strict';

test('purpose-bound token secrets differ from the access token secret', async () => {
  process.env.JWT_SECRET = 'access-secret';
  delete process.env.JWT_2FA_TEMP_SECRET;
  delete process.env.JWT_EMAIL_CHANGE_SECRET;
  const { authConfig } = await import('../src/config/auth.config');
  const cfg = authConfig() as Record<string, string>;
  assert.equal(cfg.jwtSecret, 'access-secret');
  assert.notEqual(cfg.twoFactorTempSecret, cfg.jwtSecret);
  assert.notEqual(cfg.emailChangeSecret, cfg.jwtSecret);
  assert.notEqual(cfg.twoFactorTempSecret, cfg.emailChangeSecret);
});
