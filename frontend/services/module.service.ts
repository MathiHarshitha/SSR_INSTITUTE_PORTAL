import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AdminLesson, AdminModule, LessonFormInput, ModuleFormInput } from "@/types/module";

export const moduleService = {
  async list(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminModule[]>>(
      `/courses/${courseId}/modules`
    );
    return data.data;
  },

  async create(courseId: string, input: ModuleFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminModule>>(
      `/courses/${courseId}/modules`,
      input
    );
    return data.data;
  },

  async update(id: string, input: Partial<ModuleFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminModule>>(`/modules/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/modules/${id}`);
  },

  async reorder(courseId: string, orderedIds: string[]) {
    await apiClient.patch(`/courses/${courseId}/modules/reorder`, { orderedIds });
  },

  async listLessons(moduleId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminLesson[]>>(
      `/modules/${moduleId}/lessons`
    );
    return data.data;
  },

  async createLesson(moduleId: string, input: LessonFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminLesson>>(
      `/modules/${moduleId}/lessons`,
      input
    );
    return data.data;
  },

  async updateLesson(id: string, input: Partial<LessonFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminLesson>>(`/lessons/${id}`, input);
    return data.data;
  },

  async removeLesson(id: string) {
    await apiClient.delete(`/lessons/${id}`);
  },

  async reorderLessons(moduleId: string, orderedIds: string[]) {
    await apiClient.patch(`/modules/${moduleId}/lessons/reorder`, { orderedIds });
  },
};
