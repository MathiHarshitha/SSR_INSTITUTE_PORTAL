import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feeService } from "@/services/fee.service";
import { extractErrorMessage } from "@/lib/api-client";
import { FeeStatusQuery, PaymentListQuery, RecordPaymentInput } from "@/types/fee";

const FEES_KEY = "fees";

export function useFeeStatus(query: FeeStatusQuery) {
  return useQuery({
    queryKey: [FEES_KEY, "status", query],
    queryFn: () => feeService.listStatus(query),
    placeholderData: (previous) => previous,
  });
}

export function usePayments(query: PaymentListQuery) {
  return useQuery({
    queryKey: [FEES_KEY, "payments", query],
    queryFn: () => feeService.listPayments(query),
    placeholderData: (previous) => previous,
  });
}

export function usePaymentHistory(studentId: string | null, batchId: string | null) {
  return useQuery({
    queryKey: [FEES_KEY, "history", studentId, batchId],
    queryFn: () => feeService.getPaymentHistory(studentId as string, batchId as string),
    enabled: !!studentId && !!batchId,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => feeService.recordPayment(input),
    onSuccess: () => {
      toast.success("Payment recorded");
      queryClient.invalidateQueries({ queryKey: [FEES_KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, discount }: { enrollmentId: string; discount: number }) =>
      feeService.updateDiscount(enrollmentId, discount),
    onSuccess: () => {
      toast.success("Discount updated");
      queryClient.invalidateQueries({ queryKey: [FEES_KEY] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
