import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobService } from "@/services/job.service";
import { extractErrorMessage } from "@/lib/api-client";
import { ApplicationStatus, JobFormInput, JobListQuery, JobStatus } from "@/types/job";

const JOBS_KEY = "jobs";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
}

export function useJobs(query: JobListQuery) {
  return useQuery({
    queryKey: [JOBS_KEY, "list", query],
    queryFn: () => jobService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useJobApplications(jobId: string | null) {
  return useQuery({
    queryKey: [JOBS_KEY, "applications", jobId],
    queryFn: () => jobService.listApplications(jobId as string),
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JobFormInput) => jobService.create(input),
    onSuccess: () => {
      toast.success("Job created");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<JobFormInput> }) =>
      jobService.update(id, input),
    onSuccess: () => {
      toast.success("Job updated");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => jobService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Job status updated");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateApplicationStatus(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      jobService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      toast.success("Application status updated");
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY, "applications", jobId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
