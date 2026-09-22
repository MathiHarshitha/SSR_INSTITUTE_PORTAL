import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  AdminLesson,
  AdminModule,
  AdminTopic,
  CodingLastSubmission,
  CodingSubmitResult,
  LessonFormInput,
  ModuleFormInput,
  QuizSessionState,
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

  /** Student learner view — gated by enrollment + sequential lock state; quiz answers and
   * coding test cases stripped either way. */
  async getLessonForStudent(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentLessonDetail>>(`/lessons/${id}`);
    return data.data;
  },

  async markPracticeComplete(lessonId: string) {
    await apiClient.post(`/lessons/${lessonId}/practice/complete`);
  },

  // Quiz session — server-side state machine (spec §7): no back-nav, no reopening a
  // submitted question, refresh/back-button-safe.
  async getQuizState(lessonId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<QuizSessionState>>(
      `/lessons/${lessonId}/quiz/state`
    );
    return data.data;
  },

  async startQuiz(lessonId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<QuizSessionState>>(
      `/lessons/${lessonId}/quiz/start`
    );
    return data.data;
  },

  async answerQuiz(lessonId: string, selectedIndex: number) {
    const { data } = await apiClient.post<ApiSuccessResponse<QuizSessionState>>(
      `/lessons/${lessonId}/quiz/answer`,
      { selectedIndex }
    );
    return data.data;
  },

  async submitQuiz(lessonId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<QuizSubmitResult>>(
      `/lessons/${lessonId}/quiz/submit`
    );
    return data.data;
  },

  async quitQuiz(lessonId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ score: number; quit: boolean }>>(
      `/lessons/${lessonId}/quiz/quit`
    );
    return data.data;
  },

  // Coding question — sandboxed auto-grading.
  async getCodingState(lessonId: string) {
    const { data } = await apiClient.get<
      ApiSuccessResponse<{ lastSubmission: CodingLastSubmission | null }>
    >(`/lessons/${lessonId}/coding/state`);
    return data.data;
  },

  async submitCoding(lessonId: string, code: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<CodingSubmitResult>>(
      `/lessons/${lessonId}/coding/submit`,
      { code }
    );
    return data.data;
  },
};
