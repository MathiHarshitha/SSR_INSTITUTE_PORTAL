import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { batchService } from "@/services/batch.service";
import { extractErrorMessage } from "@/lib/api-client";
import { BatchFormInput, BatchListQuery, BatchStatus } from "@/types/batch";

const BATCHES_KEY = "batches";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [BATCHES_KEY] });
}

export function useBatches(query: BatchListQuery) {
  return useQuery({
    queryKey: [BATCHES_KEY, "list", query],
    queryFn: () => batchService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useBatch(id: string | null) {
  return useQuery({
    queryKey: [BATCHES_KEY, "detail", id],
    queryFn: () => batchService.getById(id as string),
    enabled: !!id,
  });
}

export function useBatchStudents(batchId: string | null) {
  return useQuery({
    queryKey: [BATCHES_KEY, "students", batchId],
    queryFn: () => batchService.listStudents(batchId as string),
    enabled: !!batchId,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BatchFormInput) => batchService.create(input),
    onSuccess: () => {
      toast.success("Batch created");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BatchFormInput> }) =>
      batchService.update(id, input),
    onSuccess: () => {
      toast.success("Batch updated");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateBatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BatchStatus }) =>
      batchService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Batch status updated");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useEnrollStudent(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => batchService.enrollStudent(batchId, studentId),
    onSuccess: () => {
      toast.success("Student enrolled");
      queryClient.invalidateQueries({ queryKey: [BATCHES_KEY, "students", batchId] });
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRemoveStudent(batchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => batchService.removeStudent(batchId, studentId),
    onSuccess: () => {
      toast.success("Student removed");
      queryClient.invalidateQueries({ queryKey: [BATCHES_KEY, "students", batchId] });
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
