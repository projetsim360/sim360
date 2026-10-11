import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { join } from 'path';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import sharp from 'sharp';
import {
  gcsObjectPathFromUrl,
  gcsPublicUrl,
  parseGcsCredentials,
  resolveStorageProvider,
  StorageProvider,
} from './storage.util';

const AVATAR_SIZE = 200;
const AVATAR_CACHE_CONTROL = 'public, max-age=604800, immutable';

/**
 * File storage with two providers, picked by `STORAGE_PROVIDER`:
 *   - `local` (default): ./uploads on disk, served by the API at /uploads (needs a persistent volume in prod)
 *   - `gcs`: a Google Cloud Storage bucket with public read, URLs on storage.googleapis.com
 *
 * Stored avatar URLs are self-describing (`/uploads/...` vs `https://storage.googleapis.com/...`), so
 * deleting works for files written under either provider, which keeps a migration safe.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private gcs: Storage | null = null;
  provider: StorageProvider = 'local';

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const raw = this.config.get<string>('storage.provider', 'local');
    const resolved = resolveStorageProvider(raw);
    if (resolved === null) {
      this.logger.error(`STORAGE_PROVIDER="${raw}" is unknown (expected "local" or "gcs"). Falling back to local storage.`);
      this.provider = 'local';
      return;
    }
    this.provider = resolved;
    if (this.provider !== 'gcs') return;

    const bucket = this.config.get<string>('storage.gcsBucket', '');
    if (!bucket) {
      // Same stance as the 2FA key: don't take the whole API down for one misconfigured feature.
      this.logger.error('STORAGE_PROVIDER=gcs but GCS_BUCKET is empty. Uploads are disabled until it is set.');
      return;
    }
    try {
      this.gcs = this.createGcsClient();
      this.logger.log(`Storage provider: gcs (bucket ${bucket})`);
    } catch (error) {
      this.logger.error(`GCS client could not be created, uploads are disabled: ${(error as Error).message}`);
    }
  }

  /** Overridable for tests; builds the SDK client from the configured credentials. */
  protected createGcsClient(): Storage {
    const projectId = this.config.get<string>('storage.gcsProjectId', '') || undefined;
    const credentials = parseGcsCredentials(
      this.config.get<string>('storage.gcsKeyJson', ''),
      this.config.get<string>('storage.gcsKeyFile', ''),
    );
    return new Storage({ projectId, ...credentials });
  }

  async getSignedUploadUrl(filename: string, mimeType: string): Promise<{ url: string; path: string }> {
    // TODO: Implement GCS signed URL generation
    this.logger.warn('Storage service not yet configured — returning placeholder');
    return {
      url: gcsPublicUrl(this.config.get<string>('storage.gcsBucket', ''), filename),
      path: filename,
    };
  }

  /** Resizes the avatar to a 200×200 cover and stores it with the active provider. Returns the URL to persist. */
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    const ext = extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const buffer = await sharp(file.buffer).resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' }).toBuffer();

    if (this.provider === 'gcs') {
      return this.saveToGcs(`avatars/${userId}/${filename}`, buffer, file.mimetype);
    }
    return this.saveToLocal(join('avatars', userId), filename, buffer);
  }

  /** Deletes a previously stored avatar, whichever provider wrote it. Never throws: a stale file is not worth a failed request. */
  async deleteAvatar(url: string | null | undefined): Promise<void> {
    if (!url) return;
    const bucket = this.config.get<string>('storage.gcsBucket', '');
    const objectPath = gcsObjectPathFromUrl(url, bucket);

    if (objectPath !== null) {
      if (this.provider !== 'gcs' || !this.gcs) {
        this.logger.warn(`Skipping delete of ${url}: GCS provider is not active`);
        return;
      }
      try {
        await this.gcs.bucket(bucket).file(objectPath).delete({ ignoreNotFound: true });
        this.logger.log(`File deleted from GCS: ${objectPath}`);
      } catch (error) {
        this.logger.error(`Failed to delete GCS file: ${objectPath}`, error);
      }
      return;
    }

    if (url.startsWith('/uploads/')) {
      this.deleteLocalFile(url);
    }
  }

  // ─── Providers ────────────────────────────────────────────────────────────

  private async saveToGcs(objectPath: string, buffer: Buffer, contentType: string): Promise<string> {
    const bucket = this.config.get<string>('storage.gcsBucket', '');
    if (!this.gcs || !bucket) {
      throw new ServiceUnavailableException(
        "Le stockage des fichiers n'est pas configuré sur ce serveur. Contactez l'administrateur.",
      );
    }
    await this.gcs.bucket(bucket).file(objectPath).save(buffer, {
      contentType,
      resumable: false,
      metadata: { cacheControl: AVATAR_CACHE_CONTROL },
    });
    const url = gcsPublicUrl(bucket, objectPath);
    this.logger.log(`Avatar uploaded to GCS: ${url}`);
    return url;
  }

  private async saveToLocal(relativeDir: string, filename: string, buffer: Buffer): Promise<string> {
    const dir = join(process.cwd(), 'uploads', relativeDir);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await writeFile(join(dir, filename), buffer);
    const url = `/uploads/${relativeDir.split('\\').join('/')}/${filename}`;
    this.logger.log(`Avatar uploaded: ${url}`);
    return url;
  }

  private deleteLocalFile(url: string): void {
    try {
      const filepath = join(process.cwd(), url);
      if (existsSync(filepath)) {
        unlinkSync(filepath);
        this.logger.log(`File deleted: ${url}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file: ${url}`, error);
    }
  }
}
