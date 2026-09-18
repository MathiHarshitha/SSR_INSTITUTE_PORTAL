import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createModuleSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().max(2000).optional(),
  estimatedDuration: z.string().trim().max(60).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModulesSchema = z.object({
  orderedIds: z.array(OBJECT_ID).min(1),
});

export const createLessonSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().max(2000).optional(),
  estimatedMinutes: z.coerce.number().min(0).optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

export const reorderLessonsSchema = z.object({
  orderedIds: z.array(OBJECT_ID).min(1),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
