import { Schema, model, Document, Types } from "mongoose";

export type AnnouncementAudience = "EVERYONE" | "STUDENTS" | "TRAINERS" | "BATCH" | "COURSE";
export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH";

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  batch?: Types.ObjectId;
  course?: Types.ObjectId;
  priority: AnnouncementPriority;
  publishAt: Date;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    audience: {
      type: String,
      enum: ["EVERYONE", "STUDENTS", "TRAINERS", "BATCH", "COURSE"],
      required: true,
      index: true,
    },
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    priority: { type: String, enum: ["LOW", "NORMAL", "HIGH"], default: "NORMAL" },
    publishAt: { type: Date, required: true, default: Date.now, index: true },
    expiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Announcement = model<IAnnouncement>("Announcement", announcementSchema);
