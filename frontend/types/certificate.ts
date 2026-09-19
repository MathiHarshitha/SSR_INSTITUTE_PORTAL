export type CertificateStatus = "ISSUED" | "REVOKED";

export interface AdminCertificate {
  _id: string;
  certificateNumber: string;
  student: string;
  batch: string;
  course: string;
  studentName: string;
  courseName: string;
  batchName: string;
  issueDate: string;
  status: CertificateStatus;
  revokedReason?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface CertificateListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: CertificateStatus;
  batch?: string;
}

export interface IssueCertificateInput {
  student: string;
  batch: string;
}

export interface StudentCertificate {
  _id: string;
  certificateNumber: string;
  courseName: string;
  batchName: string;
  issueDate: string;
  status: CertificateStatus;
}

export interface VerifiedCertificate {
  certificateNumber: string;
  studentName: string;
  courseName: string;
  batchName: string;
  issueDate: string;
  status: CertificateStatus;
}
