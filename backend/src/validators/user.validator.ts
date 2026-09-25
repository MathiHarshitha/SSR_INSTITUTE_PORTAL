import { z } from "zod";
import { searchText } from "./common";
import { ROLES, USER_STATUSES } from "../constants/enums";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: searchText.optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const rejectUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
