import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  FeeStatusQuery,
  FeeStatusRow,
  PaymentListQuery,
  PaymentRecord,
  RecordPaymentInput,
} from "@/types/fee";

export const feeService = {
  async listStatus(query: FeeStatusQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<FeeStatusRow[]>>("/fees/status", {
      params: query,
    });
    return { rows: data.data, meta: data.meta! };
  },

  async listPayments(query: PaymentListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaymentRecord[]>>("/fees/payments", {
      params: query,
    });
    return { payments: data.data, meta: data.meta! };
  },

  async recordPayment(input: RecordPaymentInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<PaymentRecord>>("/fees/payments", input);
    return data.data;
  },

  async getPaymentHistory(studentId: string, batchId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaymentRecord[]>>(
      `/fees/payments/${studentId}/${batchId}`
    );
    return data.data;
  },

  async updateDiscount(enrollmentId: string, discount: number) {
    const { data } = await apiClient.patch<ApiSuccessResponse<unknown>>(
      `/fees/enrollments/${enrollmentId}/discount`,
      { discount }
    );
    return data.data;
  },
};
