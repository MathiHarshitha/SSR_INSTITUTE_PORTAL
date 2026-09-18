import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const AUDIENCES = ["EVERYONE", "STUDENTS", "TRAINERS", "BATCH", "COURSE"] as const;
const PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;

const announcementFields = z
  .object({
    title: z.string().trim().min(2, "Title is too short").max(200),
    content: z.string().trim().min(5, "Content is too short").max(5000),
    audience: z.enum(AUDIENCES),
    batch: OBJECT_ID.optional(),
    course: OBJECT_ID.optional(),
    priority: z.enum(PRIORITIES).default("NORMAL"),
    publishAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine((data) => data.audience !== "BATCH" || !!data.batch, {
    message: "Select a batch for a batch-specific announcement",
    path: ["batch"],
  })
  .refine((data) => data.audience !== "COURSE" || !!data.course, {
    message: "Select a course for a course-specific announcement",
    path: ["course"],
  });

export const createAnnouncementSchema = announcementFields;

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  audience: z.enum(AUDIENCES).optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type ListAnnouncementsQuery = z.infer<typeof listAnnouncementsQuerySchema>;
