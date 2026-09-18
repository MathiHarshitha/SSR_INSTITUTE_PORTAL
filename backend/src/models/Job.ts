import { Schema, model, Document, Types } from "mongoose";

export type WorkMode = "ONSITE" | "REMOTE" | "HYBRID";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface IJob extends Document {
  _id: Types.ObjectId;
  company: string;
  title: string;
  description: string;
  location?: string;
  workMode: WorkMode;
  salaryRange?: string;
  skills: string[];
  minExperienceYears: number;
  educationRequirement?: string;
  applicationDeadline: Date;
  openings: number;
  jobLink?: string;
  eligibleCourses: Types.ObjectId[];
  minAttendancePercent?: number;
  status: JobStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    location: { type: String, trim: true },
    workMode: { type: String, enum: ["ONSITE", "REMOTE", "HYBRID"], required: true },
    salaryRange: { type: String, trim: true },
    skills: { type: [String], default: [] },
    minExperienceYears: { type: Number, default: 0, min: 0 },
    educationRequirement: { type: String, trim: true },
    applicationDeadline: { type: Date, required: true, index: true },
    openings: { type: Number, required: true, min: 1 },
    jobLink: { type: String, trim: true },
    eligibleCourses: { type: [Schema.Types.ObjectId], ref: "Course", default: [] },
    minAttendancePercent: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "CLOSED"], default: "DRAFT", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, applicationDeadline: 1 });

export const Job = model<IJob>("Job", jobSchema);
