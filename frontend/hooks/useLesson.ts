import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { moduleService } from "@/services/module.service";
import { extractErrorMessage } from "@/lib/api-client";

const KEY = "lesson";
const QUIZ_KEY = "lesson-quiz-state";
const CODING_KEY = "lesson-coding-state";

/** Student learner view of one lesson — gated by enrollment + sequential lock state. */
export function useLesson(lessonId: string | null) {
  return useQuery({
    queryKey: [KEY, lessonId],
    queryFn: () => moduleService.getLessonForStudent(lessonId as string),
    enabled: !!lessonId,
  });
}

function invalidateLessonAndProgress(queryClient: ReturnType<typeof useQueryClient>, lessonId: string) {
  queryClient.invalidateQueries({ queryKey: [KEY, lessonId] });
  queryClient.invalidateQueries({ queryKey: ["progress"] });
  queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
}

export function useMarkPracticeComplete(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => moduleService.markPracticeComplete(lessonId),
    onSuccess: () => invalidateLessonAndProgress(queryClient, lessonId),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Refresh/back-button-safe: always re-fetches the server's current attempt state rather
 * than trusting any locally held question index. */
export function useQuizState(lessonId: string | null) {
  return useQuery({
    queryKey: [QUIZ_KEY, lessonId],
    queryFn: () => moduleService.getQuizState(lessonId as string),
    enabled: !!lessonId,
  });
}

export function useStartQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => moduleService.startQuiz(lessonId),
    onSuccess: (data) => queryClient.setQueryData([QUIZ_KEY, lessonId], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useAnswerQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedIndex: number) => moduleService.answerQuiz(lessonId, selectedIndex),
    onSuccess: (data) => queryClient.setQueryData([QUIZ_KEY, lessonId], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSubmitQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => moduleService.submitQuiz(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_KEY, lessonId] });
      invalidateLessonAndProgress(queryClient, lessonId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useQuitQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => moduleService.quitQuiz(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_KEY, lessonId] });
      invalidateLessonAndProgress(queryClient, lessonId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useCodingState(lessonId: string | null) {
  return useQuery({
    queryKey: [CODING_KEY, lessonId],
    queryFn: () => moduleService.getCodingState(lessonId as string),
    enabled: !!lessonId,
  });
}

export function useSubmitCoding(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => moduleService.submitCoding(lessonId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CODING_KEY, lessonId] });
      invalidateLessonAndProgress(queryClient, lessonId);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
