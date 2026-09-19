import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { certificateService } from "@/services/certificate.service";
import { extractErrorMessage } from "@/lib/api-client";
import { CertificateListQuery, IssueCertificateInput } from "@/types/certificate";

const CERTIFICATES_KEY = "certificates";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [CERTIFICATES_KEY] });
}

export function useCertificates(query: CertificateListQuery) {
  return useQuery({
    queryKey: [CERTIFICATES_KEY, "list", query],
    queryFn: () => certificateService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IssueCertificateInput) => certificateService.issue(input),
    onSuccess: () => {
      toast.success("Certificate issued");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useRevokeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => certificateService.revoke(id, reason),
    onSuccess: () => {
      toast.success("Certificate revoked");
      invalidate(queryClient);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useMyCertificates() {
  return useQuery({
    queryKey: [CERTIFICATES_KEY, "mine"],
    queryFn: () => certificateService.listMine(),
  });
}
