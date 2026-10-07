import 'reflect-metadata';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { JwtService } from '@nestjs/jwt';
import { ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { encrypt } from '../src/common/utils/crypto.util';
import { isAccessTokenPayload } from '../src/auth/jwt-payload.util';

const ACCESS_SECRET = 'access-secret';
const TEMP_SECRET = 'temp-secret';

function makeConfig(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    'auth.jwtSecret': ACCESS_SECRET,
    'auth.twoFactorTempSecret': TEMP_SECRET,
    'auth.twoFactorTempTokenExpiresIn': '5m',
    'auth.twoFactorEncryptionKey': randomBytes(32).toString('hex'),
    'auth.twoFactorIssuer': 'Simex pro',
    'auth.twoFactorBackupCodesCount': 2,
    'auth.maxFailedAttempts': 5,
    ...overrides,
  };
  return { get: (key: string, fallback?: unknown) => (key in values ? values[key] : fallback) } as any;
}

let users: Record<string, any>;
let deletedKeys: string[];

const prisma = {
  user: {
    findUnique: async ({ where }: any) => users[where.id] ?? Object.values(users).find((u) => u.email === where.email) ?? null,
    update: async ({ where, data }: any) => Object.assign(users[where.id], data),
  },
} as any;

const cache = {
  del: async (key: string) => {
    deletedKeys.push(key);
  },
  delPattern: async () => undefined,
} as any;

function makeService(config = makeConfig()) {
  const jwt = new JwtService({ secret: ACCESS_SECRET });
  return { service: new AuthService(prisma, jwt, config, {} as any, cache), jwt, config };
}

beforeEach(() => {
  users = {};
  deletedKeys = [];
});

test('login with 2FA enabled returns a temp token that is NOT a valid access token', async () => {
  const { service, jwt } = makeService();
  users.u1 = {
    id: 'u1',
    email: 'a@b.c',
    isActive: true,
    emailVerifiedAt: new Date(),
    passwordHash: await bcrypt.hash('Secret123!', 4),
    failedLoginAttempts: 0,
    lockedUntil: null,
    twoFactorEnabled: true,
  };

  const result: any = await service.login({ email: 'a@b.c', password: 'Secret123!' } as any);
  assert.equal(result.requires2FA, true);

  // Signed with the dedicated secret: the access-token secret must reject it.
  assert.throws(() => jwt.verify(result.tempToken, { secret: ACCESS_SECRET }));
  const payload = jwt.verify(result.tempToken, { secret: TEMP_SECRET });
  assert.equal(payload.type, '2fa_temp');
  // And even if it were, JwtStrategy refuses typed payloads.
  assert.equal(isAccessTokenPayload(payload), false);
});

test('2FA setup fails with a clear error when the encryption key is invalid', async () => {
  const { service } = makeService(makeConfig({ 'auth.twoFactorEncryptionKey': 'CHANGE_ME_32_CHAR_HEX_KEY' }));
  users.u1 = { id: 'u1', email: 'a@b.c', twoFactorEnabled: false, passwordHash: await bcrypt.hash('pw', 4) };
  await assert.rejects(service.generateTwoFactorSecret('u1', 'pw'), ServiceUnavailableException);
});

test('enabling 2FA evicts the cached profile so the settings page shows the new status', async () => {
  const config = makeConfig();
  const { service } = makeService(config);
  const key = config.get('auth.twoFactorEncryptionKey');
  const secret = speakeasy.generateSecret().base32;
  users.u1 = { id: 'u1', email: 'a@b.c', twoFactorEnabled: false, twoFactorSecret: encrypt(secret, key) };

  const code = speakeasy.totp({ secret, encoding: 'base32' });
  await service.enableTwoFactor('u1', code);

  assert.equal(users.u1.twoFactorEnabled, true);
  assert.deepEqual(deletedKeys, ['user:profile:u1']);
});

test('disabling 2FA evicts the cached profile', async () => {
  const config = makeConfig();
  const { service } = makeService(config);
  const key = config.get('auth.twoFactorEncryptionKey');
  const secret = speakeasy.generateSecret().base32;
  users.u1 = {
    id: 'u1',
    email: 'a@b.c',
    twoFactorEnabled: true,
    twoFactorSecret: encrypt(secret, key),
    passwordHash: await bcrypt.hash('pw', 4),
  };

  await service.disableTwoFactor('u1', 'pw', speakeasy.totp({ secret, encoding: 'base32' }));

  assert.equal(users.u1.twoFactorEnabled, false);
  assert.deepEqual(deletedKeys, ['user:profile:u1']);
});
