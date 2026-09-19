import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { ReportsOverview } from "@/types/report";

export const reportService = {
  async getOverview() {
    const { data } = await apiClient.get<ApiSuccessResponse<ReportsOverview>>("/reports/overview");
    return data.data;
  },
};
