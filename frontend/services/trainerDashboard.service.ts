import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { TrainerDashboardStats } from "@/types/trainerDashboard";

export const trainerDashboardService = {
  async get() {
    const { data } = await apiClient.get<ApiSuccessResponse<TrainerDashboardStats>>("/dashboard/trainer");
    return data.data;
  },
};
