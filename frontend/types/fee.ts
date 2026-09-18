export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER";
export type FeeStatus = "PAID" | "PARTIALLY_PAID" | "PENDING";

interface NamedRef {
  _id: string;
  name: string;
}

export interface FeeStatusRow {
  enrollmentId: string;
  student: NamedRef & { email: string };
  batch: NamedRef;
  course: NamedRef & { fee: number };
  discount: number;
  finalFee: number;
  amountPaid: number;
  amountDue: number;
  status: FeeStatus;
}

export interface PaymentRecord {
  _id: string;
  student: NamedRef & { email: string };
  batch: NamedRef;
  course: NamedRef;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

export interface FeeStatusQuery {
  page: number;
  limit: number;
  search?: string;
  batch?: string;
  status?: FeeStatus;
}

export interface PaymentListQuery {
  page: number;
  limit: number;
  search?: string;
  batch?: string;
  paymentMethod?: PaymentMethod;
}

export interface RecordPaymentInput {
  student: string;
  batch: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}
