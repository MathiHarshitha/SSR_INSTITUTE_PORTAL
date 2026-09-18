import { Schema, model, Document, Types } from "mongoose";

export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "LATE" | "EVALUATED";

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  student: Types.ObjectId;
  batch: Types.ObjectId;
  content?: string;
  fileUrl?: string;
  comments?: string;
  status: SubmissionStatus;
  submittedAt?: Date;
  marks?: number;
  feedback?: string;
  evaluatedBy?: Types.ObjectId;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    content: { type: String, maxlength: 10000 },
    fileUrl: { type: String, trim: true },
    comments: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["DRAFT", "SUBMITTED", "LATE", "EVALUATED"], default: "DRAFT" },
    submittedAt: { type: Date },
    marks: { type: Number, min: 0 },
    feedback: { type: String, trim: true, maxlength: 2000 },
    evaluatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ task: 1, student: 1 }, { unique: true });

export const Submission = model<ISubmission>("Submission", submissionSchema);
