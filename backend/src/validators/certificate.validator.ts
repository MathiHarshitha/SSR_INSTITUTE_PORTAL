import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const CERTIFICATE_STATUSES = ["ISSUED", "REVOKED"] as const;

export const issueCertificateSchema = z.object({
  student: OBJECT_ID,
  batch: OBJECT_ID,
});

export const revokeCertificateSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const listCertificatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(CERTIFICATE_STATUSES).optional(),
  batch: OBJECT_ID.optional(),
  sortBy: z.enum(["createdAt", "issueDate", "studentName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type RevokeCertificateInput = z.infer<typeof revokeCertificateSchema>;
export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
