import { useQuery } from "@tanstack/react-query";
import { careerResourcesService } from "@/services/careerResources.service";

export function useCareerResourcesStatus() {
  return useQuery({
    queryKey: ["career-resources-status"],
    queryFn: careerResourcesService.getStatus,
  });
}

export function useInterviewResources() {
  return useQuery({
    queryKey: ["interview-resources"],
    queryFn: careerResourcesService.listInterviewResources,
  });
}
