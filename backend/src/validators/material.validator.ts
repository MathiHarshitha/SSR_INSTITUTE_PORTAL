import { z } from "zod";
import { httpUrl, searchText } from "./common";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const MATERIAL_TYPES = ["DOCUMENT", "VIDEO", "IMAGE", "LINK", "OTHER"] as const;

export const createMaterialSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(200),
  description: z.string().trim().max(1000).optional(),
  fileUrl: httpUrl("Must be a valid URL"),
  fileType: z.enum(MATERIAL_TYPES),
  batch: OBJECT_ID,
  module: OBJECT_ID.optional(),
});

export const updateMaterialSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  fileUrl: httpUrl("Must be a valid URL").optional(),
  fileType: z.enum(MATERIAL_TYPES).optional(),
  module: OBJECT_ID.optional(),
});

export const listMaterialsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  batch: OBJECT_ID.optional(),
  module: OBJECT_ID.optional(),
  search: searchText.optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type ListMaterialsQuery = z.infer<typeof listMaterialsQuerySchema>;
