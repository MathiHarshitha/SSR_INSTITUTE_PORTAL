import { useQuery } from "@tanstack/react-query";
import { studentDashboardService } from "@/services/studentDashboard.service";

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => studentDashboardService.get(),
  });
}
