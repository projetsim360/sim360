/**
 * Pure helpers for the storage provider switch (local disk vs Google Cloud Storage).
 * Kept free of Nest and SDK imports so they can be unit-tested directly.
 */

export type StorageProvider = 'local' | 'gcs';

const GCS_PUBLIC_HOST = 'https://storage.googleapis.com/';

/** `STORAGE_PROVIDER` → provider. Empty means local; an unknown value returns null so the caller can warn. */
export function resolveStorageProvider(raw: string | undefined | null): StorageProvider | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '' || value === 'local') return 'local';
  if (value === 'gcs') return 'gcs';
  return null;
}

/** Public URL of an object in a bucket with uniform, public read access. */
export function gcsPublicUrl(bucket: string, objectPath: string): string {
  return `${GCS_PUBLIC_HOST}${bucket}/${objectPath}`;
}

/** Inverse of {@link gcsPublicUrl}: the object path when `url` lives in `bucket`, otherwise null. */
export function gcsObjectPathFromUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url || !bucket) return null;
  const prefix = `${GCS_PUBLIC_HOST}${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  const objectPath = url.slice(prefix.length);
  return objectPath.length > 0 ? objectPath : null;
}

/**
 * Credentials for the GCS client, in priority order:
 *   1. `GCS_KEY_JSON`: the service-account JSON inlined in an env var (no file to mount in the container)
 *   2. `GCS_KEY_FILE`: path to the service-account JSON
 *   3. nothing: Application Default Credentials (workload identity, gcloud auth, ...)
 */
export function parseGcsCredentials(
  keyJson: string | undefined | null,
  keyFile: string | undefined | null,
): { credentials?: Record<string, unknown>; keyFilename?: string } {
  const inline = (keyJson ?? '').trim();
  if (inline) {
    try {
      return { credentials: JSON.parse(inline) };
    } catch {
      throw new Error('GCS_KEY_JSON is not valid JSON (paste the full service-account key file content)');
    }
  }
  const file = (keyFile ?? '').trim();
  if (file) return { keyFilename: file };
  return {};
}
