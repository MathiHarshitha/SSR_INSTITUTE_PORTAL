import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { progressService } from "@/services/progress.service";
import { extractErrorMessage } from "@/lib/api-client";

const KEY = "progress";

export function useCourseProgress(courseId: string | null) {
  return useQuery({
    queryKey: [KEY, courseId],
    queryFn: () => progressService.getCourseProgress(courseId as string),
    enabled: !!courseId,
  });
}

export function useToggleLessonComplete(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) =>
      completed ? progressService.unmarkComplete(lessonId) : progressService.markComplete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
