import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'crypto';
import { decrypt, encrypt, isValidEncryptionKey } from '../src/common/utils/crypto.util';

test('isValidEncryptionKey requires exactly 64 hex chars', () => {
  assert.equal(isValidEncryptionKey(randomBytes(32).toString('hex')), true);
  assert.equal(isValidEncryptionKey(''), false);
  assert.equal(isValidEncryptionKey(undefined), false);
  // The old .env.production.example placeholder: not hex, wrong length.
  assert.equal(isValidEncryptionKey('CHANGE_ME_32_CHAR_HEX_KEY'), false);
  // 32 hex chars = 16 bytes: too short for aes-256.
  assert.equal(isValidEncryptionKey(randomBytes(16).toString('hex')), false);
  assert.equal(isValidEncryptionKey('z'.repeat(64)), false);
});

test('encrypt/decrypt round-trip with a valid key', () => {
  const key = randomBytes(32).toString('hex');
  const secret = 'JBSWY3DPEHPK3PXP';
  assert.equal(decrypt(encrypt(secret, key), key), secret);
});
