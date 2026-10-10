import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAccessTokenPayload } from '../src/auth/jwt-payload.util';

test('accepts a plain access token payload', () => {
  assert.equal(isAccessTokenPayload({ sub: 'u1', email: 'a@b.c', tenantId: 't1', role: 'MEMBER' }), true);
});

test('rejects the 2FA temp token (2FA bypass)', () => {
  assert.equal(isAccessTokenPayload({ sub: 'u1', type: '2fa_temp' }), false);
});

test('rejects the email change token', () => {
  assert.equal(isAccessTokenPayload({ type: 'email_change', userId: 'u1' } as any), false);
});

test('rejects payloads without sub', () => {
  assert.equal(isAccessTokenPayload({ email: 'a@b.c' }), false);
  assert.equal(isAccessTokenPayload({ sub: '' }), false);
  assert.equal(isAccessTokenPayload(null), false);
  assert.equal(isAccessTokenPayload(undefined), false);
});
