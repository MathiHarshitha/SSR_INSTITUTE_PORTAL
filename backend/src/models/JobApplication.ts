import { Schema, model, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IJobApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  student: Types.ObjectId;
  resumeUrl?: string;
  status: ApplicationStatus;
  statusNote?: string;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "APPLIED",
        "UNDER_REVIEW",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
      index: true,
    },
    statusNote: { type: String, trim: true },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

export const JobApplication = model<IJobApplication>("JobApplication", jobApplicationSchema);
