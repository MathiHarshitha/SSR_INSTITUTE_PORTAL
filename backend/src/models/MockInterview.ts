import { Schema, model, Document, Types } from "mongoose";

export type InterviewType = "TECHNICAL" | "HR" | "COMMUNICATION" | "PROJECT_REVIEW" | "APTITUDE";
export type InterviewResult = "PENDING" | "RECOMMENDED" | "NOT_RECOMMENDED";

export interface IMockInterview extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  interviewer: Types.ObjectId;
  batch?: Types.ObjectId;
  date: Date;
  time: string;
  meetingLink?: string;
  type: InterviewType;
  topics: string[];
  notes?: string;

  rating?: number;
  strengths?: string;
  weaknesses?: string;
  feedback?: string;
  recommendation?: string;
  result: InterviewResult;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mockInterviewSchema = new Schema<IMockInterview>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    interviewer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    meetingLink: { type: String, trim: true },
    type: {
      type: String,
      enum: ["TECHNICAL", "HR", "COMMUNICATION", "PROJECT_REVIEW", "APTITUDE"],
      required: true,
    },
    topics: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 1000 },

    rating: { type: Number, min: 1, max: 5 },
    strengths: { type: String, trim: true, maxlength: 1000 },
    weaknesses: { type: String, trim: true, maxlength: 1000 },
    feedback: { type: String, trim: true, maxlength: 2000 },
    recommendation: { type: String, trim: true, maxlength: 1000 },
    result: { type: String, enum: ["PENDING", "RECOMMENDED", "NOT_RECOMMENDED"], default: "PENDING" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

mockInterviewSchema.index({ interviewer: 1, date: 1 });

export const MockInterview = model<IMockInterview>("MockInterview", mockInterviewSchema);
