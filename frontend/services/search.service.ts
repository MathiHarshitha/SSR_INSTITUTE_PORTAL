import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { SearchResults } from "@/types/search";

export const searchService = {
  async search(q: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<SearchResults>>("/search", {
      params: { q },
    });
    return data.data;
  },
};
