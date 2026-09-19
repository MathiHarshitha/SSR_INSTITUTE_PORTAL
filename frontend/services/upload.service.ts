import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { UploadedFile } from "@/types/upload";

export const uploadService = {
  async uploadFile(file: File, folder?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);

    const { data } = await apiClient.post<ApiSuccessResponse<UploadedFile>>("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
};
