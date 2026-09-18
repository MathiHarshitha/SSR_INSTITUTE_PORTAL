export type MaterialType = "DOCUMENT" | "VIDEO" | "IMAGE" | "LINK" | "OTHER";

export interface TrainerMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: MaterialType;
  module?: { _id: string; name: string };
  batch: string;
  uploadedBy: { _id: string; name: string };
  createdAt: string;
}

export interface MaterialFormInput {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: MaterialType;
  batch: string;
  module?: string;
}

export interface MaterialListQuery {
  page: number;
  limit: number;
  batch?: string;
  module?: string;
  search?: string;
}
