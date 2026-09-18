import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AdminAnnouncement, AnnouncementFormInput, AnnouncementListQuery } from "@/types/announcement";

export const announcementService = {
  async list(query: AnnouncementListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminAnnouncement[]>>("/announcements", {
      params: query,
    });
    return { announcements: data.data, meta: data.meta! };
  },

  async create(input: AnnouncementFormInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminAnnouncement>>(
      "/announcements",
      input
    );
    return data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/announcements/${id}`);
  },
};
