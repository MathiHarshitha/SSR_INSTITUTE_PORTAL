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
  issuedBy: Types.ObjectId;
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
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, batch: 1 });

export const Certificate = model<ICertificate>("Certificate", certificateSchema);
