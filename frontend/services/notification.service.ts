import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AppNotification } from "@/types/notification";

export const notificationService = {
  async list(page = 1, limit = 20) {
    const { data } = await apiClient.get<ApiSuccessResponse<AppNotification[]>>("/notifications", {
      params: { page, limit },
    });
    return { notifications: data.data, meta: data.meta! };
  },

  async getUnreadCount() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return data.data.count;
  },

  async markAsRead(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AppNotification>>(
      `/notifications/${id}/read`
    );
    return data.data;
  },

  async markAllAsRead() {
    await apiClient.patch("/notifications/read-all");
  },
};
