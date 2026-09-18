import { Schema, model, Document, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  duration: string;
  fee: number;
  thumbnailUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  requirements: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String },
    category: { type: String, trim: true },
    duration: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    thumbnailUrl: { type: String },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT", index: true },
    requirements: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
  },
  { timestamps: true }
);

courseSchema.index({ name: "text", category: "text" });

export const Course = model<ICourse>("Course", courseSchema);
