import { z } from "zod";
import { httpUrl, searchText } from "./common";

const COURSE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

// No `.default()` here — `.default()` fires even on an omitted key under
// `.partial()`, so it would silently reintroduce (and wipe) fields the caller
// never sent. Defaults for creation are applied explicitly below instead.
const courseFieldsBase = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  shortDescription: z.string().trim().min(10, "Short description is too short").max(300),
  fullDescription: z.string().trim().max(5000).optional(),
  category: z.string().trim().max(80).optional(),
  duration: z.string().trim().min(1, "Duration is required").max(60),
  fee: z.coerce.number().min(0, "Fee cannot be negative"),
  thumbnailUrl: httpUrl("Must be a valid URL").optional().or(z.literal("")),
  requirements: z.array(z.string().trim().min(1)).optional(),
  learningOutcomes: z.array(z.string().trim().min(1)).optional(),
});

export const createCourseSchema = courseFieldsBase.extend({
  requirements: z.array(z.string().trim().min(1)).optional().transform((v) => v ?? []),
  learningOutcomes: z.array(z.string().trim().min(1)).optional().transform((v) => v ?? []),
});

export const updateCourseSchema = courseFieldsBase.partial();

export const updateCourseStatusSchema = z.object({
  status: z.enum(COURSE_STATUSES),
});

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: searchText.optional(),
  status: z.enum(COURSE_STATUSES).optional(),
  sortBy: z.enum(["createdAt", "name", "fee"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
