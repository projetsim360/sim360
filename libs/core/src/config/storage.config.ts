import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  gcsBucket: process.env.GCS_BUCKET || 'sim360-dev',
  gcsProjectId: process.env.GCS_PROJECT_ID || '',
  gcsKeyFile: process.env.GCS_KEY_FILE || '',
}));
