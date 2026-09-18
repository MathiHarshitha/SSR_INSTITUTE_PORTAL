import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  AdminJob,
  ApplicationStatus,
  JobFormInput,
  JobListQuery,
  JobApplicationRow,
  JobStatus,
} from "@/types/job";

export const jobService = {
  async list(query: JobListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminJob[]>>("/jobs", { params: query });
    return { jobs: data.data, meta: data.meta! };
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminJob>>(`/jobs/${id}`);
    return data.data;
  },

  async create(input: JobFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminJob>>("/jobs", input);
    return data.data;
  },

  async update(id: string, input: Partial<JobFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminJob>>(`/jobs/${id}`, input);
    return data.data;
  },

  async updateStatus(id: string, status: JobStatus) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminJob>>(`/jobs/${id}/status`, { status });
    return data.data;
  },

  async listApplications(jobId: string, page = 1, limit = 20) {
    const { data } = await apiClient.get<ApiSuccessResponse<JobApplicationRow[]>>(
      `/jobs/${jobId}/applications`,
      { params: { page, limit } }
    );
    return { applications: data.data, meta: data.meta! };
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, statusNote?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<JobApplicationRow>>(
      `/jobs/applications/${applicationId}/status`,
      { status, statusNote }
    );
    return data.data;
  },
};
