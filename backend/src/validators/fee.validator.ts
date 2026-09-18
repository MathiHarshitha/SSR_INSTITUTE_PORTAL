import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "OTHER"] as const;
const PAYMENT_STATUSES = ["PAID", "PARTIALLY_PAID", "PENDING"] as const;

export const recordPaymentSchema = z.object({
  student: OBJECT_ID,
  batch: OBJECT_ID,
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionRef: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateDiscountSchema = z.object({
  discount: z.coerce.number().min(0, "Discount cannot be negative"),
});

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  batch: OBJECT_ID.optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  sortBy: z.enum(["createdAt", "paymentDate", "amount"]).default("paymentDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const listFeeStatusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  batch: OBJECT_ID.optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export type ListFeeStatusQuery = z.infer<typeof listFeeStatusQuerySchema>;
