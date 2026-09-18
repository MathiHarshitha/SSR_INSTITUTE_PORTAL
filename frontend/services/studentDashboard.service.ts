import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { StudentDashboardStats } from "@/types/studentDashboard";

export const studentDashboardService = {
  async get() {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentDashboardStats>>("/dashboard/student");
    return data.data;
  },
};
