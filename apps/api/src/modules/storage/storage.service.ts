import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private config: ConfigService) {}

  async getSignedUploadUrl(filename: string, mimeType: string): Promise<{ url: string; path: string }> {
    // TODO: Implement GCS signed URL generation
    this.logger.warn('Storage service not yet configured — returning placeholder');
    return {
      url: `https://storage.googleapis.com/${this.config.get('storage.gcsBucket')}/${filename}`,
      path: filename,
    };
  }

  async uploadToLocal(file: Express.Multer.File, userId: string): Promise<string> {
    const ext = extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const dir = join(process.cwd(), 'uploads', 'avatars', userId);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filepath = join(dir, filename);
    await writeFile(filepath, file.buffer);

    const avatarUrl = `/uploads/avatars/${userId}/${filename}`;
    this.logger.log(`Avatar uploaded: ${avatarUrl}`);
    return avatarUrl;
  }

  async deleteLocalFile(url: string): Promise<void> {
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

  async deleteFile(path: string): Promise<void> {
    // TODO: Implement GCS file deletion
    this.logger.warn('Storage delete not yet implemented');
  }
}
