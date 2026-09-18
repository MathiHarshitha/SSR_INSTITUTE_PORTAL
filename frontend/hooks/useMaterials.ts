import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialService } from "@/services/material.service";
import { extractErrorMessage } from "@/lib/api-client";
import { MaterialFormInput, MaterialListQuery } from "@/types/material";

const KEY = "materials";

export function useMaterials(query: MaterialListQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => materialService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialFormInput) => materialService.create(input),
    onSuccess: () => {
      toast.success("Material uploaded");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MaterialFormInput> }) =>
      materialService.update(id, input),
    onSuccess: () => {
      toast.success("Material updated");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialService.remove(id),
    onSuccess: () => {
      toast.success("Material deleted");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
