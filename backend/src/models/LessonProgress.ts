import { Schema, model, Document, Types } from "mongoose";

export interface ILessonProgress extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  lesson: Types.ObjectId;
  module: Types.ObjectId;
  course: Types.ObjectId;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export const LessonProgress = model<ILessonProgress>("LessonProgress", lessonProgressSchema);
