import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { finalAssessmentService, FinalAssessmentFormInput } from "@/services/finalAssessment.service";
import { extractErrorMessage } from "@/lib/api-client";

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
    queryFn: () => finalAssessmentService.getState(courseId as string),
    enabled: !!courseId,
  });
}

export function useStartFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finalAssessmentService.start(courseId),
    onSuccess: (data) => queryClient.setQueryData([KEY, courseId], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useAnswerFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (selectedIndex: number) => finalAssessmentService.answer(courseId, selectedIndex),
    onSuccess: (data) => queryClient.setQueryData([KEY, courseId], data),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useSubmitFinalAssessment(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finalAssessmentService.submit(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, courseId] });
      queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
