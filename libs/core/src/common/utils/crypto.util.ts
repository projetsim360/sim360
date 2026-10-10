import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_HEX_LENGTH = 64; // aes-256 needs a 32-byte key

/** True when `keyHex` is a 64-char hex string usable as an aes-256-gcm key. */
export function isValidEncryptionKey(keyHex: string | undefined | null): boolean {
  return typeof keyHex === 'string' && keyHex.length === KEY_HEX_LENGTH && /^[0-9a-fA-F]+$/.test(keyHex);
}

export function encrypt(text: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string, keyHex: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedText.split(':');
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
