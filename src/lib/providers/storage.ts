import "server-only";
import { createReadStream, type ReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

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
  readStream(key: string): Promise<{ stream: ReadStream; size: number }>;
}

/** In-memory storage used during tests / dev fallback. */
export class MemoryStorageProvider implements StorageProvider {
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

  async readStream(): Promise<{ stream: ReadStream; size: number }> {
    throw new Error("MemoryStorageProvider does not support readStream");
  }
}

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

/** Writes files to the `<cwd>/uploads/<key>` private folder (outside `public/`). */
export class PrivateDiskStorage implements StorageProvider {
  constructor(private readonly root: string = UPLOADS_ROOT) {}

  private resolveKey(key: string): string {
    const normalized = path.posix.normalize(key.replace(/\\/g, "/"));
    if (normalized.startsWith("/") || normalized.includes("..")) {
      throw new Error("Invalid storage key");
    }
    return path.join(this.root, normalized);
  }

  async upload({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
  }): Promise<UploadedFile> {
    const abs = this.resolveKey(key);
    await mkdir(path.dirname(abs), { recursive: true });
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
    await writeFile(abs, buf);
    return {
      key,
      url: `/api/files/${key
        .split("/")
        .map((p) => encodeURIComponent(p))
        .join("/")}`,
      size: buf.byteLength,
      contentType,
    };
  }

  async getSignedUrl(key: string) {
    return `/api/files/${key
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/")}`;
  }

  async remove(key: string) {
    const abs = this.resolveKey(key);
    await rm(abs, { force: true });
  }

  async readStream(key: string): Promise<{ stream: ReadStream; size: number }> {
    const abs = this.resolveKey(key);
    const s = await stat(abs);
    return { stream: createReadStream(abs), size: s.size };
  }
}

export const storageProvider: StorageProvider = new PrivateDiskStorage();
