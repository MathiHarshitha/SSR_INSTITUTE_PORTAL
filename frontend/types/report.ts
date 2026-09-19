export interface ReportsSummary {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  totalBatches: number;
  revenueCollectedTotal: number;
  totalRevenuePending: number;
  overallAttendance: number;
  totalCertificatesIssued: number;
  totalApplications: number;
  placementSelectionRate: number;
}

export interface EnrollmentsByCourseRow {
  courseId: string;
  courseName: string;
  enrolledCount: number;
}

export interface FeeCollectionByBatchRow {
  batchId: string;
  batchName: string;
  collected: number;
  pending: number;
}

export interface AttendanceByBatchRow {
  batchId: string;
  batchName: string;
  averagePercent: number;
}

export interface ApplicationsByStatusRow {
  status: string;
  count: number;
}

export interface EnrollmentsOverTimeRow {
  month: string;
  count: number;
}

export interface ReportsOverview {
  summary: ReportsSummary;
  enrollmentsByCourse: EnrollmentsByCourseRow[];
  feeCollectionByBatch: FeeCollectionByBatchRow[];
  attendanceByBatch: AttendanceByBatchRow[];
  applicationsByStatus: ApplicationsByStatusRow[];
  enrollmentsOverTime: EnrollmentsOverTimeRow[];
}
