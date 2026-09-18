import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskService } from "@/services/task.service";
import { extractErrorMessage } from "@/lib/api-client";
import { TaskFormInput, TaskListQuery, TaskStatus } from "@/types/task";

const KEY = "tasks";

export function useTasks(query: TaskListQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => taskService.list(query),
  });
}

export function usePendingSubmissions() {
  return useQuery({
    queryKey: [KEY, "pending"],
    queryFn: () => taskService.listPendingSubmissions(),
  });
}

export function useTaskSubmissions(taskId: string | null) {
  return useQuery({
    queryKey: [KEY, "submissions", taskId],
    queryFn: () => taskService.listSubmissions(taskId as string),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskFormInput) => taskService.create(input),
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskFormInput> }) =>
      taskService.update(id, input),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useEvaluateSubmission(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, marks, feedback }: { submissionId: string; marks: number; feedback?: string }) =>
      taskService.evaluateSubmission(submissionId, marks, feedback),
    onSuccess: () => {
      toast.success("Submission evaluated");
      queryClient.invalidateQueries({ queryKey: [KEY, "submissions", taskId] });
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
