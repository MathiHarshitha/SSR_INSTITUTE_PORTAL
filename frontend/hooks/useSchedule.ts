import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { scheduleService } from "@/services/schedule.service";
import { extractErrorMessage } from "@/lib/api-client";
import { ClassScheduleFormInput, ClassScheduleQuery } from "@/types/schedule";

const KEY = "classes";

export function useClasses(query: ClassScheduleQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => scheduleService.list(query),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClassScheduleFormInput) => scheduleService.create(input),
    onSuccess: () => {
      toast.success("Class scheduled");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClassScheduleFormInput> }) =>
      scheduleService.update(id, input),
    onSuccess: () => {
      toast.success("Class updated");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleService.remove(id),
    onSuccess: () => {
      toast.success("Class removed");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
