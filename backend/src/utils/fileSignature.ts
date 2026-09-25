import path from "path";
import { ApiError } from "./ApiError";

/**
 * Content-based validation for general uploads (materials, task submissions). The declared MIME
 * type and filename are attacker-controlled; the leading bytes are not. Each allowed type lists
 * the extensions it may carry and a signature check on the actual content.
 */
type Check = (b: Buffer) => boolean;

const startsWith = (sig: number[], offset = 0): Check => (b) =>
  b.length >= offset + sig.length && sig.every((byte, i) => b[offset + i] === byte);

const ZIP = startsWith([0x50, 0x4b, 0x03, 0x04]); // also docx/pptx/xlsx
const OLE = startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // doc/ppt/xls
const ISO_MEDIA: Check = (b) => b.length >= 12 && b.subarray(4, 8).toString("ascii") === "ftyp"; // mp4/mov
const PLAIN_TEXT: Check = (b) => !b.includes(0x00);

const RULES: Record<string, { extensions: string[]; check: Check }> = {
  "image/jpeg": { extensions: [".jpg", ".jpeg"], check: startsWith([0xff, 0xd8, 0xff]) },
  "image/png": { extensions: [".png"], check: startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  "image/gif": { extensions: [".gif"], check: startsWith([0x47, 0x49, 0x46, 0x38]) },
  "image/webp": {
    extensions: [".webp"],
    check: (b) => b.length >= 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "application/pdf": { extensions: [".pdf"], check: startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]) },
  "application/msword": { extensions: [".doc"], check: OLE },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extensions: [".docx"], check: ZIP },
  "application/vnd.ms-powerpoint": { extensions: [".ppt"], check: OLE },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extensions: [".pptx"], check: ZIP },
  "application/vnd.ms-excel": { extensions: [".xls"], check: OLE },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extensions: [".xlsx"], check: ZIP },
  "text/plain": { extensions: [".txt"], check: PLAIN_TEXT },
  "application/zip": { extensions: [".zip"], check: ZIP },
  "video/mp4": { extensions: [".mp4"], check: ISO_MEDIA },
  "video/quicktime": { extensions: [".mov"], check: ISO_MEDIA },
  "video/webm": { extensions: [".webm"], check: startsWith([0x1a, 0x45, 0xdf, 0xa3]) },
};

export const ALLOWED_UPLOAD_MIME_TYPES = new Set(Object.keys(RULES));

/** Throws unless the declared type is allowed and extension + content both agree with it. */
export function assertValidUpload(file: Express.Multer.File): void {
  if (!file.buffer || file.size === 0) throw ApiError.badRequest("The uploaded file is empty");
  const rule = RULES[file.mimetype];
  if (!rule) throw ApiError.badRequest(`Unsupported file type: ${file.mimetype}`);
  const ext = path.extname(file.originalname).toLowerCase();
  if (!rule.extensions.includes(ext)) throw ApiError.badRequest("File extension does not match its type");
  if (!rule.check(file.buffer)) throw ApiError.badRequest("File content does not match its declared type");
}
