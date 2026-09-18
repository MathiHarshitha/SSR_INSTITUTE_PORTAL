import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const BATCH_MODES = ["ONLINE", "OFFLINE", "HYBRID"] as const;
const BATCH_STATUSES = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
const CLASS_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const batchFields = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  course: OBJECT_ID,
  trainer: OBJECT_ID.optional().or(z.literal("")),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  classDays: z.array(z.enum(CLASS_DAYS)).min(1, "Select at least one class day"),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
  mode: z.enum(BATCH_MODES),
  location: z.string().trim().max(200).optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
});

export const createBatchSchema = batchFields.refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Deliberately skips the date-order refine — a caller updating just one date
// can't satisfy a cross-field check from a partial payload. The service
// re-validates the merged (existing + incoming) date pair after applying it.
export const updateBatchSchema = batchFields.partial();

export const updateBatchStatusSchema = z.object({
  status: z.enum(BATCH_STATUSES),
});

export const enrollStudentSchema = z.object({
  studentId: OBJECT_ID,
});

export const listBatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(BATCH_STATUSES).optional(),
  course: OBJECT_ID.optional(),
  sortBy: z.enum(["createdAt", "startDate", "name"]).default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type ListBatchesQuery = z.infer<typeof listBatchesQuerySchema>;
