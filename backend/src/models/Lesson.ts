import { Schema, model, Document, Types } from "mongoose";

export interface ILesson extends Document {
  _id: Types.ObjectId;
  module: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    estimatedMinutes: { type: Number, min: 0 },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

lessonSchema.index({ module: 1, order: 1 });

export const Lesson = model<ILesson>("Lesson", lessonSchema);
