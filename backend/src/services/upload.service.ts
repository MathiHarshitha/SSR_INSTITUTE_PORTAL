import { UploadApiResponse } from "cloudinary";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

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
