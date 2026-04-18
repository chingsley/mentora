import "server-only";

export interface UploadedFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageProvider {
  upload(args: {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
  }): Promise<UploadedFile>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  remove(key: string): Promise<void>;
}

/** In-memory storage used during MVP. Files are NOT persisted across restarts. */
export class LocalStorageProvider implements StorageProvider {
  private files = new Map<string, { body: Buffer; contentType: string }>();

  async upload({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
  }): Promise<UploadedFile> {
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
    this.files.set(key, { body: buf, contentType });
    return {
      key,
      url: `/api/files/${encodeURIComponent(key)}`,
      size: buf.byteLength,
      contentType,
    };
  }

  async getSignedUrl(key: string) {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async remove(key: string) {
    this.files.delete(key);
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
