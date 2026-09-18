import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersService } from "@/services/users.service";
import { extractErrorMessage } from "@/lib/api-client";
import { UserListQuery } from "@/types/user";

const USERS_KEY = "users";
const STATS_KEY = ["users", "stats"] as const;

export function useUserStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => usersService.getStats(),
    staleTime: 30_000,
  });
}

export function useActiveTrainers() {
  return useQuery({
    queryKey: [USERS_KEY, "active-trainers"],
    queryFn: () =>
      usersService.list({
        role: "TRAINER",
        status: "ACTIVE",
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      }),
    staleTime: 60_000,
  });
}

export function useActiveStudents(search?: string) {
  return useQuery({
    queryKey: [USERS_KEY, "active-students", search],
    queryFn: () =>
      usersService.list({
        role: "STUDENT",
        status: "ACTIVE",
        search,
        page: 1,
        limit: 20,
        sortBy: "name",
        sortOrder: "asc",
      }),
    staleTime: 30_000,
  });
}

export function useUsers(query: UserListQuery) {
  return useQuery({
    queryKey: [USERS_KEY, query],
    queryFn: () => usersService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: [USERS_KEY, "detail", id],
    queryFn: () => usersService.getById(id as string),
    enabled: !!id,
  });
}

function useUserMutation(
  mutationFn: (variables: { id: string; reason?: string }) => Promise<unknown>,
  successMessage: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: STATS_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useApproveUser() {
  return useUserMutation(({ id }) => usersService.approve(id), "User approved");
}

export function useRejectUser() {
  return useUserMutation(({ id, reason }) => usersService.reject(id, reason), "User rejected");
}

export function useBlockUser() {
  return useUserMutation(({ id }) => usersService.block(id), "User blocked");
}

export function useUnblockUser() {
  return useUserMutation(({ id }) => usersService.unblock(id), "User unblocked");
}

export function useSuspendUser() {
  return useUserMutation(({ id, reason }) => usersService.suspend(id, reason), "User suspended");
}

export function useReactivateUser() {
  return useUserMutation(({ id }) => usersService.reactivate(id), "User reactivated");
}
