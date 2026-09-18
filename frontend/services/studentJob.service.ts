import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { StudentApplication, StudentJob } from "@/types/job";

export const studentJobService = {
  async listPublic() {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentJob[]>>("/jobs/public");
    return data.data;
  },

  async apply(jobId: string, resumeUrl?: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<unknown>>(`/jobs/${jobId}/apply`, {
      resumeUrl,
    });
    return data.data;
  },

  async listMyApplications() {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentApplication[]>>(
      "/jobs/applications/me"
    );
    return data.data;
  },

  async withdraw(applicationId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<StudentApplication>>(
      `/jobs/applications/${applicationId}/withdraw`
    );
    return data.data;
  },
};
