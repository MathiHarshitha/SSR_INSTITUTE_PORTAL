import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

const NOTIFICATIONS_KEY = "notifications";

export function useNotifications() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "list"],
    queryFn: () => notificationService.list(),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "unread-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
}
