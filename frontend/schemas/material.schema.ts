import { z } from "zod";

export const materialFormSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(200),
  description: z.string().trim().optional(),
  fileUrl: z.string().trim().url("Must be a valid URL"),
  fileType: z.enum(["DOCUMENT", "VIDEO", "IMAGE", "LINK", "OTHER"]),
  batch: z.string().min(1, "Select a batch"),
  module: z.string().optional(),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
