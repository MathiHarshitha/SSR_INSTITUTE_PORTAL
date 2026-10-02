import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { finalAssessmentService, FinalAssessmentFormInput } from "@/services/finalAssessment.service";
import { extractErrorMessage } from "@/lib/api-client";
import { FinalAssessmentSessionState, FinalAssessmentSubmitResult } from "@/types/finalAssessment";

/** After a failed attempt the server withholds the exact score and enforces a retake
 * cooldown; `retryAvailableAt` (ISO) is set while that cooldown is running. */
export type StudentFinalAssessmentState = FinalAssessmentSessionState & {
  attemptCount?: number;
  retryAvailableAt?: string;
};

/** `score` is only present on a passed attempt. */
export type StudentFinalAssessmentSubmitResult = Omit<FinalAssessmentSubmitResult, "score"> & {
  score?: number;
  passingScore?: number;
  retryAvailableAt?: string;
};

const KEY = "final-assessment-state";
const AUTHORING_KEY = "final-assessment-authoring";

export function useFinalAssessmentAuthoring(courseId: string | null) {
  return useQuery({
    queryKey: [AUTHORING_KEY, courseId],
    queryFn: () => finalAssessmentService.getForAuthoring(courseId as string),
    enabled: !!courseId,
  });
}

export function useSaveFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FinalAssessmentFormInput) => finalAssessmentService.save(courseId, input),
    onSuccess: (data) => {
      queryClient.setQueryData([AUTHORING_KEY, courseId], data);
      toast.success("Final assessment saved");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useFinalAssessmentState(courseId: string | null) {
  return useQuery({
    queryKey: [KEY, courseId],
    queryFn: () => finalAssessmentService.getState(courseId as string) as Promise<StudentFinalAssessmentState>,
    enabled: !!courseId,
  });
}

export function useStartFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finalAssessmentService.start(courseId) as Promise<StudentFinalAssessmentState>,
    onSuccess: (data) => queryClient.setQueryData([KEY, courseId], data),
    onError: (error) => {
      // A 429 here is the retake cooldown — its message says when the next attempt opens.
      toast.error(extractErrorMessage(error));
      queryClient.invalidateQueries({ queryKey: [KEY, courseId] });
    },
  });
}

export function useAnswerFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedIndex: number) =>
      finalAssessmentService.answer(courseId, selectedIndex) as Promise<StudentFinalAssessmentState>,
    onSuccess: (data) => queryClient.setQueryData([KEY, courseId], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSubmitFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finalAssessmentService.submit(courseId) as Promise<StudentFinalAssessmentSubmitResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
