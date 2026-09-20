import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { moduleService } from "@/services/module.service";
import { extractErrorMessage } from "@/lib/api-client";

const KEY = "lesson";

/** Student learner view of one lesson — quiz answers stripped until submitted. */
export function useLesson(lessonId: string | null) {
  return useQuery({
    queryKey: [KEY, lessonId],
    queryFn: () => moduleService.getLessonForStudent(lessonId as string),
    enabled: !!lessonId,
  });
}

export function useSubmitQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: number[]) => moduleService.submitQuiz(lessonId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, lessonId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
