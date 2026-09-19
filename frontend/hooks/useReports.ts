import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/report.service";

export function useReportsOverview() {
  return useQuery({
    queryKey: ["reports", "overview"],
    queryFn: () => reportService.getOverview(),
  });
}
