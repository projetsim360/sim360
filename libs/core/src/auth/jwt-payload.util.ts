export interface JwtPayload {
  sub?: string;
  email?: string;
  tenantId?: string;
  role?: string;
  type?: string;
}

/**
 * Only plain access tokens may authenticate a request. Purpose-bound tokens
 * (2fa_temp, email_change, ...) carry a `type` claim and must be rejected,
 * otherwise a password-only login could bypass the 2FA step.
 */
export function isAccessTokenPayload(payload: JwtPayload | null | undefined): payload is JwtPayload & { sub: string } {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.type !== undefined) return false;
  return typeof payload.sub === 'string' && payload.sub.length > 0;
}
