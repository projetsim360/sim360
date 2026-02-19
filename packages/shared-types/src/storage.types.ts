export interface StorageFile {
  id: string;
  tenantId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  bucket: string;
  path: string;
  createdAt: string;
}

export interface UploadFileDto {
  filename: string;
  mimeType: string;
  size: number;
}

export interface SignedUrlResponse {
  url: string;
  expiresAt: string;
}
