import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { ClassScheduleEntry, ClassScheduleFormInput, ClassScheduleQuery } from "@/types/schedule";

export const scheduleService = {
  async list(query: ClassScheduleQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<ClassScheduleEntry[]>>("/classes", {
      params: query,
    });
    return data.data;
  },

  async create(input: ClassScheduleFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<ClassScheduleEntry>>("/classes", input);
    return data.data;
  },

  async update(id: string, input: Partial<ClassScheduleFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<ClassScheduleEntry>>(
      `/classes/${id}`,
      input
    );
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/classes/${id}`);
  },
};
