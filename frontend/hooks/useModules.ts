import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { moduleService } from "@/services/module.service";
import { extractErrorMessage } from "@/lib/api-client";
import { LessonFormInput, ModuleFormInput } from "@/types/module";

const MODULES_KEY = "modules";
const LESSONS_KEY = "lessons";

export function useModules(courseId: string) {
  return useQuery({
    queryKey: [MODULES_KEY, courseId],
    queryFn: () => moduleService.list(courseId),
    enabled: !!courseId,
  });
}

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ModuleFormInput) => moduleService.create(courseId, input),
    onSuccess: () => {
      toast.success("Module added");
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ModuleFormInput> }) =>
      moduleService.update(id, input),
    onSuccess: () => {
      toast.success("Module updated");
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moduleService.remove(id),
    onSuccess: () => {
      toast.success("Module deleted");
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => moduleService.reorder(courseId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] }),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useLessons(moduleId: string | null) {
  return useQuery({
    queryKey: [LESSONS_KEY, moduleId],
    queryFn: () => moduleService.listLessons(moduleId as string),
    enabled: !!moduleId,
  });
}

export function useCreateLesson(moduleId: string, courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LessonFormInput) => moduleService.createLesson(moduleId, input),
    onSuccess: () => {
      toast.success("Lesson added");
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, moduleId] });
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateLesson(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<LessonFormInput> }) =>
      moduleService.updateLesson(id, input),
    onSuccess: () => {
      toast.success("Lesson updated");
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, moduleId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteLesson(moduleId: string, courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moduleService.removeLesson(id),
    onSuccess: () => {
      toast.success("Lesson deleted");
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, moduleId] });
      queryClient.invalidateQueries({ queryKey: [MODULES_KEY, courseId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useReorderLessons(moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => moduleService.reorderLessons(moduleId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, moduleId] }),
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
