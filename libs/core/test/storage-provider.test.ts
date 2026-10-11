import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
  gcsObjectPathFromUrl,
  gcsPublicUrl,
  parseGcsCredentials,
  resolveStorageProvider,
} from '../src/storage/storage.util';
import { StorageService } from '../src/storage/storage.service';

test('STORAGE_PROVIDER resolves to local by default and accepts gcs case-insensitively', () => {
  assert.equal(resolveStorageProvider(undefined), 'local');
  assert.equal(resolveStorageProvider(''), 'local');
  assert.equal(resolveStorageProvider('local'), 'local');
  assert.equal(resolveStorageProvider('gcs'), 'gcs');
  assert.equal(resolveStorageProvider(' GCS '), 'gcs');
  assert.equal(resolveStorageProvider('s3'), null);
});

test('GCS public URLs round-trip to object paths, foreign URLs do not', () => {
  const url = gcsPublicUrl('simex-pro-uploads', 'avatars/u1/a.jpg');
  assert.equal(url, 'https://storage.googleapis.com/simex-pro-uploads/avatars/u1/a.jpg');
  assert.equal(gcsObjectPathFromUrl(url, 'simex-pro-uploads'), 'avatars/u1/a.jpg');
  assert.equal(gcsObjectPathFromUrl(url, 'other-bucket'), null);
  assert.equal(gcsObjectPathFromUrl('/uploads/avatars/u1/a.jpg', 'simex-pro-uploads'), null);
  assert.equal(gcsObjectPathFromUrl('https://evil.example.com/simex-pro-uploads/x', 'simex-pro-uploads'), null);
  assert.equal(gcsObjectPathFromUrl('https://storage.googleapis.com/simex-pro-uploads/', 'simex-pro-uploads'), null);
});

test('GCS credentials: inline JSON first, then key file, then ambient credentials', () => {
  const inline = parseGcsCredentials('{"client_email":"sa@p.iam","private_key":"k"}', './ignored.json');
  assert.deepEqual(inline, { credentials: { client_email: 'sa@p.iam', private_key: 'k' } });
  assert.deepEqual(parseGcsCredentials(undefined, './gcs-key.json'), { keyFilename: './gcs-key.json' });
  assert.deepEqual(parseGcsCredentials('', ''), {});
  assert.throws(() => parseGcsCredentials('{not json', undefined), /GCS_KEY_JSON/);
});

test('storage config reads the provider and inline key from the environment', async () => {
  process.env.STORAGE_PROVIDER = 'gcs';
  process.env.GCS_BUCKET = 'bucket-a';
  process.env.GCS_KEY_JSON = '{"a":1}';
  const { storageConfig } = await import('../src/config/storage.config');
  const cfg = storageConfig() as Record<string, string>;
  assert.equal(cfg.provider, 'gcs');
  assert.equal(cfg.gcsBucket, 'bucket-a');
  assert.equal(cfg.gcsKeyJson, '{"a":1}');
  delete process.env.STORAGE_PROVIDER;
  delete process.env.GCS_KEY_JSON;
});

// ─── Service routing, with a fake GCS client ────────────────────────────────

type Call = { op: 'save' | 'delete'; path: string; options?: Record<string, unknown> };

class FakeGcsStorageService extends StorageService {
  calls: Call[] = [];
  protected override createGcsClient() {
    const calls = this.calls;
    return {
      bucket: () => ({
        file: (path: string) => ({
          save: async (_buf: Buffer, options: Record<string, unknown>) => {
            calls.push({ op: 'save', path, options });
          },
          delete: async () => {
            calls.push({ op: 'delete', path });
          },
        }),
      }),
    } as any;
  }
}

function configStub(values: Record<string, unknown>) {
  return { get: (key: string, fallback?: unknown) => (key in values ? values[key] : fallback) } as any;
}

async function pngFile(): Promise<Express.Multer.File> {
  const buffer = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#ff0000' } })
    .png()
    .toBuffer();
  return { buffer, originalname: 'me.png', mimetype: 'image/png', size: buffer.length } as Express.Multer.File;
}

test('gcs provider: avatar upload goes to the bucket and returns a public https URL', async () => {
  const svc = new FakeGcsStorageService(
    configStub({ 'storage.provider': 'gcs', 'storage.gcsBucket': 'simex-pro-uploads' }),
  );
  svc.onModuleInit();
  const url = await svc.uploadAvatar(await pngFile(), 'user-1');
  assert.match(url, /^https:\/\/storage\.googleapis\.com\/simex-pro-uploads\/avatars\/user-1\/[0-9a-f-]{36}\.png$/);
  assert.equal(svc.calls.length, 1);
  assert.equal(svc.calls[0].op, 'save');
  assert.equal(svc.calls[0].path, url.replace('https://storage.googleapis.com/simex-pro-uploads/', ''));
  assert.equal(svc.calls[0].options?.contentType, 'image/png');
  assert.equal(svc.calls[0].options?.resumable, false);
});

test('gcs provider: deleting a bucket URL hits the bucket, a legacy local path does not', async () => {
  const svc = new FakeGcsStorageService(
    configStub({ 'storage.provider': 'gcs', 'storage.gcsBucket': 'simex-pro-uploads' }),
  );
  svc.onModuleInit();
  await svc.deleteAvatar('https://storage.googleapis.com/simex-pro-uploads/avatars/user-1/x.jpg');
  assert.deepEqual(svc.calls, [{ op: 'delete', path: 'avatars/user-1/x.jpg' }]);

  svc.calls.length = 0;
  await svc.deleteAvatar('/uploads/avatars/user-1/does-not-exist.jpg');
  assert.deepEqual(svc.calls, []);
});

test('gcs provider without a bucket refuses uploads with a clear 503 instead of crashing at boot', async () => {
  const svc = new FakeGcsStorageService(configStub({ 'storage.provider': 'gcs', 'storage.gcsBucket': '' }));
  assert.doesNotThrow(() => svc.onModuleInit());
  await assert.rejects(svc.uploadAvatar(await pngFile(), 'user-1'), (err: any) => {
    assert.equal(err.getStatus?.(), 503);
    return true;
  });
  assert.equal(svc.calls.length, 0);
});

test('unknown provider falls back to local and never touches GCS', async () => {
  const svc = new FakeGcsStorageService(configStub({ 'storage.provider': 's3', 'storage.gcsBucket': 'b' }));
  svc.onModuleInit();
  assert.equal(svc.provider, 'local');
  await svc.deleteAvatar('https://storage.googleapis.com/b/avatars/u/x.jpg');
  assert.deepEqual(svc.calls, []);
});
