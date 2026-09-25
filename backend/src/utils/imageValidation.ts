import path from "path";
import { ApiError } from "./ApiError";

export type AllowedImageMime = "image/png" | "image/jpeg" | "image/webp";

const EXTENSION_TO_MIME: Record<string, AllowedImageMime> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export const ALLOWED_IMAGE_MIME_TYPES = new Set<string>(Object.values(EXTENSION_TO_MIME));
export const ALLOWED_IMAGE_EXTENSIONS = new Set<string>(Object.keys(EXTENSION_TO_MIME));

/** Identifies the real format from the file's leading bytes — the client-sent MIME type and
 * filename are both attacker-controlled, the content signature is not. */
function sniffImageMime(buffer: Buffer): AllowedImageMime | null {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** Throws unless extension, declared MIME type, and actual content all agree on PNG/JPEG/WEBP. */
export function assertValidImage(file: Express.Multer.File, maxBytes: number): AllowedImageMime {
  if (!file.buffer || file.size === 0) {
    throw ApiError.badRequest("The uploaded file is empty");
  }
  if (file.size > maxBytes) {
    throw ApiError.badRequest(`Image must be ${Math.round(maxBytes / (1024 * 1024))}MB or smaller`);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const expectedMime = EXTENSION_TO_MIME[ext];
  if (!expectedMime) {
    throw ApiError.badRequest("Only PNG, JPG, JPEG or WEBP images are allowed");
  }
  if (file.mimetype !== expectedMime) {
    throw ApiError.badRequest("File type does not match its extension");
  }
  if (sniffImageMime(file.buffer) !== expectedMime) {
    throw ApiError.badRequest("File content is not a valid PNG, JPEG or WEBP image");
  }
  return expectedMime;
}
