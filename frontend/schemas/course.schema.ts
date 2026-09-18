import { z } from "zod";

export const courseFormSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(150),
  shortDescription: z.string().trim().min(10, "Short description is too short").max(300),
  fullDescription: z.string().trim().max(5000).optional(),
  category: z.string().trim().max(80).optional(),
  duration: z.string().trim().min(1, "Duration is required").max(60),
  fee: z.coerce.number().min(0, "Fee cannot be negative"),
  thumbnailUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  requirementsText: z.string().optional(),
  learningOutcomesText: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export function linesToArray(text?: string): string[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function arrayToLines(items: string[]): string {
  return items.join("\n");
}
