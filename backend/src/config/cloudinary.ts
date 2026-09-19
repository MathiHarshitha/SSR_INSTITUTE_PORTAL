import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

export function isCloudinaryConfigured(): boolean {
  return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export { cloudinary };
