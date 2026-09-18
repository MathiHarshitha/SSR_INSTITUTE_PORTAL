import { z } from "zod";

const OBJECT_ID = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const WORK_MODES = ["ONSITE", "REMOTE", "HYBRID"] as const;
const JOB_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"] as const;
const APPLICATION_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

const jobFields = z.object({
  company: z.string().trim().min(2, "Company name is too short").max(150),
  title: z.string().trim().min(2, "Title is too short").max(150),
  description: z.string().trim().min(10, "Description is too short").max(5000),
  location: z.string().trim().max(150).optional(),
  workMode: z.enum(WORK_MODES),
  salaryRange: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  minExperienceYears: z.coerce.number().min(0).max(40).optional(),
  educationRequirement: z.string().trim().max(150).optional(),
  applicationDeadline: z.coerce.date(),
  openings: z.coerce.number().int().min(1),
  jobLink: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  eligibleCourses: z.array(OBJECT_ID).optional(),
  minAttendancePercent: z.coerce.number().min(0).max(100).optional(),
});

export const createJobSchema = jobFields;
export const updateJobSchema = jobFields.partial();

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  statusNote: z.string().trim().max(500).optional(),
});

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  sortBy: z.enum(["createdAt", "applicationDeadline", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const listApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(APPLICATION_STATUSES).optional(),
  job: OBJECT_ID.optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
