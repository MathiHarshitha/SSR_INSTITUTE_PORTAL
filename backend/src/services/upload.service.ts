import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { UploadApiResponse } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes: number;
  originalName: string;
}

const FOLDER_NAME_PATTERN = /^[a-z0-9-]{1,40}$/i;

export function sanitizeFolder(folder: string | undefined): string {
  if (folder && FOLDER_NAME_PATTERN.test(folder)) return folder;
  return "general";
}

export async function uploadBuffer(
  buffer: Buffer,
  originalName: string,
  folder: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw ApiError.internal("File storage is not configured (missing Cloudinary credentials)");
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `ssr-portal/${folder}`, resource_type: "auto" },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    bytes: result.bytes,
    originalName,
  };
}

// ---------------------------------------------------------------------------------------------
// Private files (payment screenshots, payment QR code). Unlike `uploadBuffer` — whose URLs are
// public — these are never directly addressable: Cloudinary stores them with `authenticated`
// delivery, and the only way to read one is `readPrivateFile`, called from an API route that
// has already authorized the requester. The storage key is never returned to clients.
// ---------------------------------------------------------------------------------------------

export interface PrivateFileRef {
  provider: "cloudinary" | "local";
  key: string;
  mimeType: string;
  bytes: number;
}

const MIME_TO_FORMAT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Dev-only fallback when Cloudinary isn't configured. Deliberately outside the statically
// served `uploads/` directory.
const LOCAL_PRIVATE_ROOT = path.resolve(__dirname, "..", "..", "private-uploads");
const LOCAL_KEY_PATTERN = /^[a-z0-9-]{1,40}\/[0-9a-f-]{36}\.(png|jpg|webp)$/;

function useLocalPrivateStorage(): boolean {
  if (isCloudinaryConfigured()) return false;
  if (env.isProduction) {
    throw ApiError.internal("File storage is not configured (missing Cloudinary credentials)");
  }
  return true;
}

function resolveLocalKey(key: string): string {
  if (!LOCAL_KEY_PATTERN.test(key)) throw ApiError.internal("Invalid stored file reference");
  return path.join(LOCAL_PRIVATE_ROOT, key);
}

export async function uploadPrivateImage(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<PrivateFileRef> {
  const format = MIME_TO_FORMAT[mimeType];
  if (!format) throw ApiError.badRequest("Unsupported image type");
  const safeFolder = sanitizeFolder(folder);

  if (useLocalPrivateStorage()) {
    const key = `${safeFolder}/${randomUUID()}.${format}`;
    const target = resolveLocalKey(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer, { flag: "wx" });
    return { provider: "local", key, mimeType, bytes: buffer.length };
  }

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `ssr-portal/private/${safeFolder}`, resource_type: "image", type: "authenticated" },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return { provider: "cloudinary", key: result.public_id, mimeType, bytes: result.bytes };
}

export async function readPrivateFile(ref: PrivateFileRef): Promise<Buffer> {
  if (ref.provider === "local") {
    try {
      return await fs.readFile(resolveLocalKey(ref.key));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.notFound("File not found");
    }
  }

  if (!isCloudinaryConfigured()) {
    throw ApiError.internal("File storage is not configured (missing Cloudinary credentials)");
  }
  // Short-lived signed API download URL — used server-side only, never handed to the client.
  const url = cloudinary.utils.private_download_url(ref.key, MIME_TO_FORMAT[ref.mimeType] ?? "", {
    resource_type: "image",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 60,
  });
  const response = await fetch(url);
  if (!response.ok) {
    logger.error(`Private file fetch failed with status ${response.status}`);
    throw ApiError.notFound("File not found");
  }
  return Buffer.from(await response.arrayBuffer());
}

/** Best-effort cleanup — a failure here must never fail the request that triggered it. */
export async function deletePrivateFile(ref: PrivateFileRef): Promise<void> {
  try {
    if (ref.provider === "local") {
      await fs.unlink(resolveLocalKey(ref.key));
      return;
    }
    if (!isCloudinaryConfigured()) return;
    await cloudinary.uploader.destroy(ref.key, { resource_type: "image", type: "authenticated" });
  } catch (error) {
    logger.error("Failed to delete private file", error);
  }
}
