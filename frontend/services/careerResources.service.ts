import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { CareerResourcesStatus, InterviewResource } from "@/types/careerResources";

export const careerResourcesService = {
  async getStatus() {
    const { data } = await apiClient.get<ApiSuccessResponse<CareerResourcesStatus>>(
      "/career-resources/status"
    );
    return data.data;
  },

  async listInterviewResources() {
    const { data } = await apiClient.get<ApiSuccessResponse<InterviewResource[]>>(
      "/interview-resources"
    );
    return data.data;
  },
};
