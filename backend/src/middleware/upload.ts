import path from "path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIME_TYPES } from "../utils/imageValidation";
import { ALLOWED_UPLOAD_MIME_TYPES } from "../utils/fileSignature";

// SVG is intentionally not allowed: it's a scriptable document, not just an image. The full
// content-signature check happens in the controller via `assertValidUpload`.
const ALLOWED_MIME_TYPES = ALLOWED_UPLOAD_MIME_TYPES;

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB

export const uploadSingleFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
}).single("file");

export const MAX_PAYMENT_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Single image (PNG/JPG/JPEG/WEBP, ≤5MB) under the given field name, buffered in memory.
 * This is only a first gate on declared type/size — the service still verifies the content
 * signature via `assertValidImage` before anything is stored.
 */
export function uploadSingleImage(fieldName: string) {
  const handler = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PAYMENT_IMAGE_BYTES, files: 1, fields: 10 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        cb(ApiError.badRequest("Only PNG, JPG, JPEG or WEBP images are allowed"));
        return;
      }
      cb(null, true);
    },
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        next(
          ApiError.badRequest(
            err.code === "LIMIT_FILE_SIZE"
              ? `Image must be ${MAX_PAYMENT_IMAGE_BYTES / (1024 * 1024)}MB or smaller`
              : `Upload error: ${err.message}`
          )
        );
        return;
      }
      next(err);
    });
  };
}
