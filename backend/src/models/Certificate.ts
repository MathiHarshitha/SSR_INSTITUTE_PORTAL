import { Schema, model, Document, Types } from "mongoose";

export type CertificateStatus = "ISSUED" | "REVOKED";

export interface ICertificate extends Document {
  _id: Types.ObjectId;
  certificateNumber: string;
  student: Types.ObjectId;
  batch: Types.ObjectId;
  course: Types.ObjectId;
  studentName: string;
  courseName: string;
  batchName: string;
  issueDate: Date;
  status: CertificateStatus;
  revokedReason?: string;
  revokedAt?: Date;
  issuedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    certificateNumber: { type: String, required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    // Denormalized at issue time so the public verify page never has to populate (or expose)
    // live user/course/batch documents — and so a later rename can't rewrite history.
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    batchName: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["ISSUED", "REVOKED"], default: "ISSUED", index: true },
    revokedReason: { type: String, trim: true },
    revokedAt: { type: Date },
    // Optional: auto-issued certificates (course completed without admin action) omit this.
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// At most one ISSUED certificate per student/batch, enforced by the DB so two concurrent
// issue requests can't both pass the service's pre-check. REVOKED rows are excluded, so a
// re-issue after revocation still works. NOTE: if production already holds duplicate ISSUED
// certificates for a student/batch, this index build will fail — revoke/remove the extras first.
// Explicitly named so it doesn't collide with the old non-unique `student_1_batch_1` index
// (same key, different options), which can be dropped once this one is built.
certificateSchema.index(
  { student: 1, batch: 1 },
  { unique: true, partialFilterExpression: { status: "ISSUED" }, name: "student_1_batch_1_issued_unique" }
);

export const Certificate = model<ICertificate>("Certificate", certificateSchema);
