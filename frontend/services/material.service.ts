import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { MaterialFormInput, MaterialListQuery, TrainerMaterial } from "@/types/material";

export const materialService = {
  async list(query: MaterialListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<TrainerMaterial[]>>("/materials", {
      params: query,
    });
    return { materials: data.data, meta: data.meta! };
  },

  async create(input: MaterialFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<TrainerMaterial>>("/materials", input);
    return data.data;
  },

  async update(id: string, input: Partial<MaterialFormInput>) {
    const { data } = await apiClient.patch<ApiSuccessResponse<TrainerMaterial>>(`/materials/${id}`, input);
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/materials/${id}`);
  },
};
