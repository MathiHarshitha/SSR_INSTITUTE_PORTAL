import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse } from "@/types/auth";
import {
  AdminCertificate,
  CertificateListQuery,
  IssueCertificateInput,
  StudentCertificate,
} from "@/types/certificate";

export const certificateService = {
  async list(query: CertificateListQuery) {
    const { data } = await apiClient.get<ApiSuccessResponse<AdminCertificate[]>>("/certificates", {
      params: query,
    });
    return { certificates: data.data, meta: data.meta! };
  },

  async issue(input: IssueCertificateInput) {
    const { data } = await apiClient.post<ApiSuccessResponse<AdminCertificate>>("/certificates", input);
    return data.data;
  },

  async revoke(id: string, reason?: string) {
    const { data } = await apiClient.patch<ApiSuccessResponse<AdminCertificate>>(
      `/certificates/${id}/revoke`,
      { reason }
    );
    return data.data;
  },

  async listMine() {
    const { data } = await apiClient.get<ApiSuccessResponse<StudentCertificate[]>>("/certificates/my");
    return data.data;
  },
};
