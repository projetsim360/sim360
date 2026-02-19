import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtRefreshRememberMeExpiresIn: process.env.JWT_REFRESH_REMEMBER_ME_EXPIRES_IN || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  emailVerificationTokenExpiry: 24 * 60 * 60 * 1000, // 24h
  passwordResetTokenExpiry: 60 * 60 * 1000, // 1h
  maxFailedAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15min
  frontendUrl: process.env.APP_URL || 'http://localhost:5173',
}));
