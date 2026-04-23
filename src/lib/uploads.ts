import "server-only";

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_ASSIGNMENT_EXTENSIONS = [
  "pdf",
  "docx",
  "doc",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "zip",
] as const;

export const ALLOWED_ASSIGNMENT_MIME_TYPES = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
]);

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
  extension?: string;
}

export function validateAssignmentUpload(file: File): UploadValidationResult {
  if (!file || file.size === 0) return { ok: false, error: "Choose a file to upload." };
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: `File is too large (max ${Math.floor(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024)} MB).` };
  }
  const ext = fileExtension(file.name);
  if (!ext || !ALLOWED_ASSIGNMENT_EXTENSIONS.includes(ext as (typeof ALLOWED_ASSIGNMENT_EXTENSIONS)[number])) {
    return { ok: false, error: `File type .${ext ?? "unknown"} is not allowed.` };
  }
  if (file.type && !ALLOWED_ASSIGNMENT_MIME_TYPES.has(file.type)) {
    // Some browsers send empty mime for known types; only block when present and unknown.
    return { ok: false, error: `Unsupported content type: ${file.type}` };
  }
  return { ok: true, extension: ext };
}

export function fileExtension(name: string): string | null {
  const idx = name.lastIndexOf(".");
  if (idx === -1 || idx === name.length - 1) return null;
  return name.slice(idx + 1).toLowerCase();
}

export function safeMimeFor(contentType: string | null, extension: string | null): string {
  if (contentType && ALLOWED_ASSIGNMENT_MIME_TYPES.has(contentType)) return contentType;
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "txt":
    case "md":
      return "text/plain";
    case "zip":
      return "application/zip";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    default:
      return "application/octet-stream";
  }
}
