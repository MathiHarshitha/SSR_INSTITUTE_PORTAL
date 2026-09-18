export type BatchMode = "ONLINE" | "OFFLINE" | "HYBRID";
export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ClassDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface BatchCourseRef {
  _id: string;
  name: string;
}

export interface BatchTrainerRef {
  _id: string;
  name: string;
  email: string;
}

export interface AdminBatch {
  _id: string;
  name: string;
  course: BatchCourseRef;
  trainer?: BatchTrainerRef;
  startDate: string;
  endDate: string;
  classDays: ClassDay[];
  startTime: string;
  endTime: string;
  mode: BatchMode;
  location?: string;
  capacity: number;
  status: BatchStatus;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: BatchStatus;
  course?: string;
  sortBy?: "createdAt" | "startDate" | "name";
  sortOrder?: "asc" | "desc";
}

export interface BatchFormInput {
  name: string;
  course: string;
  trainer?: string;
  startDate: string;
  endDate: string;
  classDays: ClassDay[];
  startTime: string;
  endTime: string;
  mode: BatchMode;
  location?: string;
  capacity: number;
}

export interface EnrolledStudent {
  enrollmentId: string;
  enrolledAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
}
