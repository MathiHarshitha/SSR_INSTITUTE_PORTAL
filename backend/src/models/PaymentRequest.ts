import { Schema, model, Document, Types } from "mongoose";

export const PAYMENT_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type PaymentRequestStatus = (typeof PAYMENT_REQUEST_STATUSES)[number];

/** Where a privately stored file lives. `key` is a storage-internal identifier — never sent to clients. */
export interface IStoredFile {
  provider: "cloudinary" | "local";
  key: string;
  mimeType: string;
  bytes: number;
}

/**
 * A student's claim that they paid (part of) a course fee, backed by a screenshot. Never
 * overwritten: every submission is its own record, so the full approve/reject trail per
 * enrollment stays auditable. Only an APPROVED request moves money — by creating a `Payment`
 * ledger row, which is what fee status is computed from.
 *
 * Fee figures are snapshots taken by the backend at submission (and again at review) from the
 * DB — never from the client.
 */
export interface IPaymentRequest extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  studentName: string;
  enrollment: Types.ObjectId;
  batch: Types.ObjectId;
  course: Types.ObjectId;
  courseName: string;
  totalFee: number;
  previousPaidAmount: number;
  amountDueAtSubmission: number;
  amount: number;
  screenshot: IStoredFile;
  status: PaymentRequestStatus;
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedByName?: string;
  reviewedAt?: Date;
  approvedAmount?: number;
  paidAfterApproval?: number;
  remainingAfterApproval?: number;
  rejectionReason?: string;
  payment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const storedFileSchema = new Schema<IStoredFile>(
  {
    provider: { type: String, enum: ["cloudinary", "local"], required: true },
    key: { type: String, required: true },
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentRequestSchema = new Schema<IPaymentRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    courseName: { type: String, required: true, trim: true },
    totalFee: { type: Number, required: true, min: 0 },
    previousPaidAmount: { type: Number, required: true, min: 0 },
    amountDueAtSubmission: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    // Excluded by default so the storage key can't leak through a generic find/populate.
    screenshot: { type: storedFileSchema, required: true, select: false },
    status: { type: String, enum: PAYMENT_REQUEST_STATUSES, default: "PENDING", index: true },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedByName: { type: String, trim: true },
    reviewedAt: { type: Date },
    approvedAmount: { type: Number, min: 0 },
    paidAfterApproval: { type: Number, min: 0 },
    remainingAfterApproval: { type: Number, min: 0 },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

// At most one PENDING request per enrollment — the DB-level guard against duplicate
// submissions, including two concurrent requests that both pass the service's pre-check.
paymentRequestSchema.index(
  { enrollment: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" }, name: "one_pending_per_enrollment" }
);
paymentRequestSchema.index({ status: 1, createdAt: -1 });
paymentRequestSchema.index({ student: 1, createdAt: -1 });

export const PaymentRequest = model<IPaymentRequest>("PaymentRequest", paymentRequestSchema);
