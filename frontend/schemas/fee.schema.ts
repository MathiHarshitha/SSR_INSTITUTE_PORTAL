import { z } from "zod";

export const recordPaymentFormSchema = z.object({
  batch: z.string().min(1, "Select a batch"),
  student: z.string().min(1, "Select a student"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "OTHER"]),
  paymentDate: z.string().optional(),
  transactionRef: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type RecordPaymentFormValues = z.infer<typeof recordPaymentFormSchema>;
