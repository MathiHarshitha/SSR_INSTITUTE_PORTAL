import { useQuery } from "@tanstack/react-query";
import { courseService } from "@/services/course.service";

export function usePublicCourses() {
  return useQuery({
    queryKey: ["courses", "public"],
    queryFn: () => courseService.listPublicCourses(),
    staleTime: 5 * 60_000,
  });
}
