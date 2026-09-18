import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { PublicCourse } from "@/types/course";

export const courseService = {
  async listPublicCourses() {
    const { data } = await apiClient.get<ApiSuccessResponse<PublicCourse[]>>("/courses");
    return data.data;
  },
};
