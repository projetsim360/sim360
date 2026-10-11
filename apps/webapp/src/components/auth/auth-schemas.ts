import { z } from 'zod';
import type { AppMessageKey } from '@/i18n/app/messages';

type T = (id: AppMessageKey) => string;

/** Password rules shared by sign-up and reset, with messages in the active locale. */
export function passwordField(t: T) {
  return z
    .string()
    .min(8, t('auth.password.rule.min'))
    .regex(/[a-z]/, t('auth.password.rule.lower'))
    .regex(/[A-Z]/, t('auth.password.rule.upper'))
    .regex(/\d/, t('auth.password.rule.digit'))
    .regex(/[^a-zA-Z\d]/, t('auth.password.rule.special'));
}

export function emailField(t: T) {
  return z.string().email(t('auth.field.emailInvalid'));
}

const STRENGTH: { label: AppMessageKey; color: string }[] = [
  { label: 'auth.password.strength.veryWeak', color: 'bg-destructive' },
  { label: 'auth.password.strength.weak', color: 'bg-orange-500' },
  { label: 'auth.password.strength.medium', color: 'bg-yellow-500' },
  { label: 'auth.password.strength.strong', color: 'bg-blue-500' },
  { label: 'auth.password.strength.veryStrong', color: 'bg-green-500' },
];

/** Score 1–5 (one point per rule met) with its label key and bar colour. */
export function passwordStrength(password: string): { score: number; label: AppMessageKey; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  const s = Math.max(1, score);
  return { score: s, ...STRENGTH[s - 1] };
}
