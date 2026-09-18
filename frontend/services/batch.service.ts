import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AdminBatch, BatchFormInput, BatchListQuery, BatchStatus, EnrolledStudent } from "@/types/batch";

export const batchService = {
  async list(query: BatchListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminBatch[]>>("/batches", {
      params: query,
    });
    return { batches: data.data, meta: data.meta! };
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminBatch>>(`/batches/${id}`);
    return data.data;
  },

  async create(input: BatchFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminBatch>>("/batches", input);
    return data.data;
  },

  async update(id: string, input: Partial<BatchFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminBatch>>(`/batches/${id}`, input);
    return data.data;
  },

  async updateStatus(id: string, status: BatchStatus) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminBatch>>(`/batches/${id}/status`, {
      status,
    });
    return data.data;
  },

  async listStudents(batchId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<EnrolledStudent[]>>(
      `/batches/${batchId}/students`
    );
    return data.data;
  },

  async enrollStudent(batchId: string, studentId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<unknown>>(
      `/batches/${batchId}/students`,
      { studentId }
    );
    return data.data;
  },

  async removeStudent(batchId: string, studentId: string) {
    await apiClient.delete(`/batches/${batchId}/students/${studentId}`);
  },
};
