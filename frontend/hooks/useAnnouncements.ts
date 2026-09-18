import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { announcementService } from "@/services/announcement.service";
import { extractErrorMessage } from "@/lib/api-client";
import { AnnouncementFormInput, AnnouncementListQuery } from "@/types/announcement";

const KEY = "announcements";

export function useAnnouncements(query: AnnouncementListQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => announcementService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementFormInput) => announcementService.create(input),
    onSuccess: () => {
      toast.success("Announcement published");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementService.remove(id),
    onSuccess: () => {
      toast.success("Announcement deleted");
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
