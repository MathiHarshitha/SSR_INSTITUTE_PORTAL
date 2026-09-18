import { useQuery } from "@tanstack/react-query";
import { trainerDashboardService } from "@/services/trainerDashboard.service";

export function useTrainerDashboard() {
  return useQuery({
    queryKey: ["trainer-dashboard"],
    queryFn: () => trainerDashboardService.get(),
  });
}
