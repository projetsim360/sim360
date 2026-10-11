import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  // `local` (default): files under ./uploads, served by the API at /uploads.
  // `gcs`: files in the Google Cloud Storage bucket below, served by storage.googleapis.com.
  provider: process.env.STORAGE_PROVIDER || 'local',
  gcsBucket: process.env.GCS_BUCKET || 'sim360-dev',
  gcsProjectId: process.env.GCS_PROJECT_ID || '',
  // Service-account key: inline JSON wins over a key file; neither = Application Default Credentials.
  gcsKeyJson: process.env.GCS_KEY_JSON || '',
  gcsKeyFile: process.env.GCS_KEY_FILE || '',
}));
