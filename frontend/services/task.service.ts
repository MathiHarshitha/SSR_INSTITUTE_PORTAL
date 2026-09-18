import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  PendingSubmissionRow,
  SubmissionRow,
  StudentTask,
  SubmitTaskInput,
  TaskFormInput,
  TaskListQuery,
  TaskStatus,
  TrainerTask,
} from "@/types/task";

export const taskService = {
  async listPendingSubmissions() {
    const { data } = await apiClient.get<ApiSuccessResponse<PendingSubmissionRow[]>>(
      "/submissions/pending"
    );
    return data.data;
  },

  async list(query: TaskListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<TrainerTask[]>>("/tasks", { params: query });
    return data.data;
  },

  async create(input: TaskFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<TrainerTask>>("/tasks", input);
    return data.data;
  },

  async update(id: string, input: Partial<TaskFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<TrainerTask>>(`/tasks/${id}`, input);
    return data.data;
  },

  async updateStatus(id: string, status: TaskStatus) {
    const { data } = await apiClient.patch<ApiSuccessResponse<TrainerTask>>(`/tasks/${id}/status`, {
      status,
    });
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/tasks/${id}`);
  },

  async listSubmissions(taskId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<SubmissionRow[]>>(
      `/tasks/${taskId}/submissions`
    );
    return data.data;
  },

  async evaluateSubmission(submissionId: string, marks: number, feedback?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<SubmissionRow>>(
      `/submissions/${submissionId}/evaluate`,
      { marks, feedback }
    );
    return data.data;
  },

  async listForStudent(query: TaskListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentTask[]>>("/tasks", { params: query });
    return data.data;
  },

  async getMySubmission(taskId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<SubmissionRow | null>>(
      `/tasks/${taskId}/my-submission`
    );
    return data.data;
  },

  async submitTask(taskId: string, input: SubmitTaskInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<SubmissionRow>>(
      `/tasks/${taskId}/submit`,
      input
    );
    return data.data;
  },
};
