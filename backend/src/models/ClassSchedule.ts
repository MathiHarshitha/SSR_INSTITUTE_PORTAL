import { Schema, model, Document, Types } from "mongoose";

export interface IClassSchedule extends Document {
  _id: Types.ObjectId;
  batch: Types.ObjectId;
  module?: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  meetingLink?: string;
  location?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const classScheduleSchema = new Schema<IClassSchedule>(
  {
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    topic: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    meetingLink: { type: String, trim: true },
    location: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

classScheduleSchema.index({ batch: 1, date: 1 });

export const ClassSchedule = model<IClassSchedule>("ClassSchedule", classScheduleSchema);
