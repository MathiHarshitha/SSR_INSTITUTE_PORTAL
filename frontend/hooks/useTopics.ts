import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { moduleService } from "@/services/module.service";
import { extractErrorMessage } from "@/lib/api-client";
import { TopicFormInput } from "@/types/module";

const TOPICS_KEY = "topics";
const MODULES_KEY = "modules";

export function useTopics(moduleId: string | null) {
  return useQuery({
    queryKey: [TOPICS_KEY, moduleId],
    queryFn: () => moduleService.listTopics(moduleId as string),
    enabled: !!moduleId,
  });
}

export function useCreateTopic(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TopicFormInput) => moduleService.createTopic(moduleId, input),
    onSuccess: () => {
      toast.success("Topic added");
      queryClient.invalidateQueries({ queryKey: [TOPICS_KEY, moduleId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateTopic(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TopicFormInput> }) =>
      moduleService.updateTopic(id, input),
    onSuccess: () => {
      toast.success("Topic updated");
      queryClient.invalidateQueries({ queryKey: [TOPICS_KEY, moduleId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteTopic(moduleId: string, courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moduleService.removeTopic(id),
    onSuccess: () => {
      toast.success("Topic deleted");
      queryClient.invalidateQueries({ queryKey: [TOPICS_KEY, moduleId] });
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useReorderTopics(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => moduleService.reorderTopics(moduleId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TOPICS_KEY, moduleId] }),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
