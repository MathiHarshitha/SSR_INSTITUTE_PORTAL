import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { MockInterviewRow, RecordFeedbackInput, ScheduleInterviewInput } from "@/types/interview";

export const interviewService = {
  async list() {
    const { data } = await apiClient.get<ApiSuccessResponse<MockInterviewRow[]>>("/interviews");
    return data.data;
  },

  async schedule(input: ScheduleInterviewInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<MockInterviewRow>>("/interviews", input);
    return data.data;
  },

  async recordFeedback(id: string, input: RecordFeedbackInput) {
    const { data } = await apiClient.patch<ApiSuccessResponse<MockInterviewRow>>(
      `/interviews/${id}/feedback`,
      input
    );
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/interviews/${id}`);
  },
};
