import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const updateLastVisitedSchema = z.object({
  courseId: OBJECT_ID,
  lessonId: OBJECT_ID,
});

export type UpdateLastVisitedInput = z.infer<typeof updateLastVisitedSchema>;
