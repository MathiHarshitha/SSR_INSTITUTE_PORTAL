import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { interviewService } from "@/services/interview.service";
import { extractErrorMessage } from "@/lib/api-client";
import { RecordFeedbackInput, ScheduleInterviewInput } from "@/types/interview";

const KEY = "interviews";

export function useInterviews() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => interviewService.list(),
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleInterviewInput) => interviewService.schedule(input),
    onSuccess: () => {
      toast.success("Interview scheduled");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRecordInterviewFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecordFeedbackInput }) =>
      interviewService.recordFeedback(id, input),
    onSuccess: () => {
      toast.success("Feedback recorded");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => interviewService.remove(id),
    onSuccess: () => {
      toast.success("Interview deleted");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
