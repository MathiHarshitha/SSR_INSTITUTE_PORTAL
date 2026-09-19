import { z } from "zod";

export const issueCertificateFormSchema = z.object({
  batch: z.string().min(1, "Select a batch"),
  student: z.string().min(1, "Select a student"),
});

export type IssueCertificateFormValues = z.infer<typeof issueCertificateFormSchema>;
