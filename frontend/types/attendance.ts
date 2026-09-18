export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

export interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; email: string };
  batch: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSummaryRow {
  student: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

export interface MarkAttendanceInput {
  batch: string;
  date: string;
  records: { student: string; status: AttendanceStatus; notes?: string }[];
}
