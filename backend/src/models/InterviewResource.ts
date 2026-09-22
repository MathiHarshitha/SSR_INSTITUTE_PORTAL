import { Schema, model, Document, Types } from "mongoose";

/**
 * Placeholder model for the "Interview Prep PDFs" career resource. Full upload/download
 * functionality is intentionally deferred (per product decision) — this exists so the
 * career-resources gating surface (course-completion lock) and the route/nav shape are
 * already wired up, and the real content/upload flow can be filled in later without
 * touching the access-control layer.
 */
export interface IInterviewResource extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  course: Types.ObjectId;
  fileUrl?: string;
  status: "COMING_SOON" | "PUBLISHED";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const interviewResourceSchema = new Schema<IInterviewResource>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    fileUrl: { type: String, trim: true },
    status: { type: String, enum: ["COMING_SOON", "PUBLISHED"], default: "COMING_SOON" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const InterviewResource = model<IInterviewResource>(
  "InterviewResource",
  interviewResourceSchema
);
