import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;

export const markAttendanceSchema = z.object({
  batch: OBJECT_ID,
  date: z.coerce.date(),
  records: z
    .array(
      z.object({
        student: OBJECT_ID,
        status: z.enum(ATTENDANCE_STATUSES),
        notes: z.string().trim().max(500).optional(),
      })
    )
    .min(1, "At least one attendance record is required"),
});

export const listAttendanceQuerySchema = z.object({
  batch: OBJECT_ID.optional(),
  student: OBJECT_ID.optional(),
  date: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
