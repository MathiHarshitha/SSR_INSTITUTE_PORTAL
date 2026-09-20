import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { MyEnrollment } from "@/types/enrollment";

export const enrollmentService = {
  async listMine() {
    const { data } = await apiClient.get<ApiSuccessResponse<MyEnrollment[]>>("/enrollments/me");
    return data.data;
  },

  async updateLastVisited(courseId: string, lessonId: string) {
    await apiClient.patch("/enrollments/last-visited", { courseId, lessonId });
  },
};
