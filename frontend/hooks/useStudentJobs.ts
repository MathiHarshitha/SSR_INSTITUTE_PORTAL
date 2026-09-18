import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { studentJobService } from "@/services/studentJob.service";
import { extractErrorMessage } from "@/lib/api-client";

const KEY = "student-jobs";
const APPLICATIONS_KEY = "student-applications";

export function useStudentJobs() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => studentJobService.listPublic(),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: [APPLICATIONS_KEY],
    queryFn: () => studentJobService.listMyApplications(),
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, resumeUrl }: { jobId: string; resumeUrl?: string }) =>
      studentJobService.apply(jobId, resumeUrl),
    onSuccess: () => {
      toast.success("Application submitted");
      queryClient.invalidateQueries({ queryKey: [KEY] });
      queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => studentJobService.withdraw(applicationId),
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
