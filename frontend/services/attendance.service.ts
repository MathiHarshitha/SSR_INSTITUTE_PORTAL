import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AttendanceRecord, AttendanceSummaryRow, MarkAttendanceInput } from "@/types/attendance";

export const attendanceService = {
  async list(batch: string, date?: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AttendanceRecord[]>>("/attendance", {
      params: { batch, date },
    });
    return data.data;
  },

  async mark(input: MarkAttendanceInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AttendanceRecord[]>>(
      "/attendance/mark",
      input
    );
    return data.data;
  },

  async getSummary(batchId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AttendanceSummaryRow[]>>(
      `/attendance/summary/${batchId}`
    );
    return data.data;
  },
};
