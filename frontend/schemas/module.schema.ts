import { z } from "zod";

export const moduleFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  description: z.string().trim().optional(),
  estimatedDuration: z.string().trim().optional(),
});
export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().optional(),
  estimatedMinutes: z.coerce.number().min(0).optional(),
});
export type LessonFormValues = z.infer<typeof lessonFormSchema>;
