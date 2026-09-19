export interface UploadedFile {
  url: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes: number;
  originalName: string;
}
