import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  AdminLesson,
  AdminModule,
  AdminTopic,
  LessonFormInput,
  ModuleFormInput,
  QuizSubmitResult,
  StudentLessonDetail,
  TopicFormInput,
} from "@/types/module";

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

  async listTopics(moduleId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminTopic[]>>(
      `/modules/${moduleId}/topics`
    );
    return data.data;
  },

  async createTopic(moduleId: string, input: TopicFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminTopic>>(
      `/modules/${moduleId}/topics`,
      input
    );
    return data.data;
  },

  async updateTopic(id: string, input: Partial<TopicFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminTopic>>(`/topics/${id}`, input);
    return data.data;
  },

  async removeTopic(id: string) {
    await apiClient.delete(`/topics/${id}`);
  },

  async reorderTopics(moduleId: string, orderedIds: string[]) {
    await apiClient.patch(`/modules/${moduleId}/topics/reorder`, { orderedIds });
  },

  async listLessons(topicId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminLesson[]>>(
      `/topics/${topicId}/lessons`
    );
    return data.data;
  },

  async createLesson(topicId: string, input: LessonFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminLesson>>(
      `/topics/${topicId}/lessons`,
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

  async reorderLessons(topicId: string, orderedIds: string[]) {
    await apiClient.patch(`/topics/${topicId}/lessons/reorder`, { orderedIds });
  },

  /** Student learner view — quiz answers stripped until submitted. */
  async getLessonForStudent(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentLessonDetail>>(`/lessons/${id}`);
    return data.data;
  },

  async submitQuiz(lessonId: string, answers: number[]) {
    const { data } = await apiClient.post<ApiSuccessResponse<QuizSubmitResult>>(
      `/lessons/${lessonId}/quiz/submit`,
      { answers }
    );
    return data.data;
  },
};
