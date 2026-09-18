import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { extractErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { AUTH_QUERY_KEY } from "@/hooks/useAuth";
import { UpdateMeInput, UpdateStudentProfileInput, UpdateTrainerProfileInput } from "@/types/profile";

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (input: UpdateMeInput) => authService.updateMe(input),
    onSuccess: (user) => {
      toast.success("Profile updated");
      setUser(user);
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStudentProfileInput) => authService.updateStudentProfile(input),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateTrainerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTrainerProfileInput) => authService.updateTrainerProfile(input),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
