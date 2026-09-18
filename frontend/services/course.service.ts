import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AdminCourse, CourseFormInput, CourseListQuery, CourseStatus, PublicCourse } from "@/types/course";

export const courseService = {
  async listPublicCourses() {
    const { data } = await apiClient.get<ApiSuccessResponse<PublicCourse[]>>("/courses");
    return data.data;
  },

  async listAdmin(query: CourseListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminCourse[]>>("/courses/admin", {
      params: query,
    });
    return { courses: data.data, meta: data.meta! };
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminCourse>>(`/courses/${id}`);
    return data.data;
  },

  async create(input: CourseFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminCourse>>("/courses", input);
    return data.data;
  },

  async update(id: string, input: Partial<CourseFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminCourse>>(`/courses/${id}`, input);
    return data.data;
  },

  async updateStatus(id: string, status: CourseStatus) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminCourse>>(`/courses/${id}/status`, {
      status,
    });
    return data.data;
  },
};
