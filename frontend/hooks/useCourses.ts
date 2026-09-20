import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseService } from "@/services/course.service";
import { extractErrorMessage } from "@/lib/api-client";
import { CourseFormInput, CourseListQuery, CourseStatus } from "@/types/course";

const COURSES_KEY = "courses";

export function usePublicCourses() {
  return useQuery({
    queryKey: [COURSES_KEY, "public"],
    queryFn: () => courseService.listPublicCourses(),
    staleTime: 5 * 60_000,
  });
}

export function useAdminCourses(query: CourseListQuery) {
  return useQuery({
    queryKey: [COURSES_KEY, "admin", query],
    queryFn: () => courseService.listAdmin(query),
    placeholderData: (previous) => previous,
  });
}

export function useTrainerCourses() {
  return useQuery({
    queryKey: [COURSES_KEY, "trainer"],
    queryFn: () => courseService.listTrainerCourses(),
  });
}

export function useCourse(id: string | null) {
  return useQuery({
    queryKey: [COURSES_KEY, "detail", id],
    queryFn: () => courseService.getById(id as string),
    enabled: !!id,
  });
}

function invalidateCourses(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CourseFormInput) => courseService.create(input),
    onSuccess: () => {
      toast.success("Course created");
      invalidateCourses(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CourseFormInput> }) =>
      courseService.update(id, input),
    onSuccess: () => {
      toast.success("Course updated");
      invalidateCourses(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) =>
      courseService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Course status updated");
      invalidateCourses(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
