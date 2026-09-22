import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { QuizQuestionAuthoring } from "@/types/module";
import { FinalAssessmentSessionState, FinalAssessmentSubmitResult } from "@/types/finalAssessment";

export interface AdminFinalAssessment {
  _id: string;
  course: string;
  title: string;
  questions: QuizQuestionAuthoring[];
  passingScore: number;
  published: boolean;
}

export interface FinalAssessmentFormInput {
  title?: string;
  questions: QuizQuestionAuthoring[];
  passingScore?: number;
  published?: boolean;
}

export const finalAssessmentService = {
  async getForAuthoring(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminFinalAssessment | null>>(
      `/final-assessments/courses/${courseId}/authoring`
    );
    return data.data;
  },

  async save(courseId: string, input: FinalAssessmentFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminFinalAssessment>>(
      `/final-assessments/courses/${courseId}`,
      input
    );
    return data.data;
  },

  async update(courseId: string, input: Partial<FinalAssessmentFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminFinalAssessment>>(
      `/final-assessments/courses/${courseId}`,
      input
    );
    return data.data;
  },

  async getState(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<FinalAssessmentSessionState>>(
      `/final-assessments/courses/${courseId}/state`
    );
    return data.data;
  },

  async start(courseId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<FinalAssessmentSessionState>>(
      `/final-assessments/courses/${courseId}/start`
    );
    return data.data;
  },

  async answer(courseId: string, selectedIndex: number) {
    const { data } = await apiClient.post<ApiSuccessResponse<FinalAssessmentSessionState>>(
      `/final-assessments/courses/${courseId}/answer`,
      { selectedIndex }
    );
    return data.data;
  },

  async submit(courseId: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<FinalAssessmentSubmitResult>>(
      `/final-assessments/courses/${courseId}/submit`
    );
    return data.data;
  },
};
