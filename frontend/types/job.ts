export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface AdminJob {
  _id: string;
  company: string;
  title: string;
  description: string;
  location?: string;
  workMode: WorkMode;
  salaryRange?: string;
  skills: string[];
  minExperienceYears: number;
  educationRequirement?: string;
  applicationDeadline: string;
  openings: number;
  jobLink?: string;
  status: JobStatus;
  applicationCount: number;
  createdAt: string;
}

export interface JobFormInput {
  company: string;
  title: string;
  description: string;
  location?: string;
  workMode: WorkMode;
  salaryRange?: string;
  skills?: string[];
  minExperienceYears?: number;
  educationRequirement?: string;
  applicationDeadline: string;
  openings: number;
  jobLink?: string;
}

export interface JobListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: JobStatus;
}

export interface JobApplicationRow {
  _id: string;
  student: { _id: string; name: string; email: string; phone: string };
  status: ApplicationStatus;
  statusNote?: string;
  appliedAt: string;
}
