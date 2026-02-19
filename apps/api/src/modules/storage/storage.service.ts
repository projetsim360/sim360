import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  async deleteFile(path: string): Promise<void> {
    // TODO: Implement GCS file deletion
    this.logger.warn('Storage delete not yet implemented');
  }
}
