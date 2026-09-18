import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import { AdminUserDetail, AdminUserListItem, UserListQuery, UserStats } from "@/types/user";

export const usersService = {
  async getStats() {
    const { data } = await apiClient.get<ApiSuccessResponse<UserStats>>("/users/stats");
    return data.data;
  },

  async list(query: UserListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminUserListItem[]>>("/users", {
      params: query,
    });
    return { users: data.data, meta: data.meta! };
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminUserDetail>>(`/users/${id}`);
    return data.data;
  },

  async approve(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(
      `/users/${id}/approve`
    );
    return data.data;
  },

  async reject(id: string, reason?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(
      `/users/${id}/reject`,
      { reason }
    );
    return data.data;
  },

  async block(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(`/users/${id}/block`);
    return data.data;
  },

  async unblock(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(
      `/users/${id}/unblock`
    );
    return data.data;
  },

  async suspend(id: string, reason?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(
      `/users/${id}/suspend`,
      { reason }
    );
    return data.data;
  },

  async reactivate(id: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminUserListItem>>(
      `/users/${id}/reactivate`
    );
    return data.data;
  },
};
