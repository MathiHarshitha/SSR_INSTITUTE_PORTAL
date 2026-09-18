import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { CourseProgress } from "@/types/progress";

export const progressService = {
  async getCourseProgress(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<CourseProgress>>(
      `/progress/courses/${courseId}`
    );
    return data.data;
  },

  async markComplete(lessonId: string) {
    await apiClient.post(`/progress/lessons/${lessonId}/complete`);
  },

  async unmarkComplete(lessonId: string) {
    await apiClient.delete(`/progress/lessons/${lessonId}/complete`);
  },
};
