import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollmentService } from "@/services/enrollment.service";

const KEY = "enrollments";

export function useMyEnrollments() {
  return useQuery({
    queryKey: [KEY, "me"],
    queryFn: () => enrollmentService.listMine(),
  });
}

/** Fire-and-forget "continue where you left off" ping — failures are non-critical, so no toast. */
export function useUpdateLastVisited() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      enrollmentService.updateLastVisited(courseId, lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, "me"] }),
  });
}
