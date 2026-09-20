export interface PublicCourse {
  _id: string;
  name: string;
  shortDescription: string;
  category?: string;
  duration: string;
  fee: number;
}

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminCourse {
  _id: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  duration: string;
  fee: number;
  thumbnailUrl?: string;
  status: CourseStatus;
  requirements: string[];
  learningOutcomes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: CourseStatus;
  sortBy?: "createdAt" | "name" | "fee";
  sortOrder?: "asc" | "desc";
}

export interface TrainerCourse {
  _id: string;
  name: string;
  shortDescription: string;
  category?: string;
  duration: string;
  status: CourseStatus;
}

export interface CourseFormInput {
  name: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  duration: string;
  fee: number;
  thumbnailUrl?: string;
  requirements: string[];
  learningOutcomes: string[];
}
