import { Schema, model, Document, Types } from "mongoose";

export interface ILessonProgress extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  lesson: Types.ObjectId;
  topic: Types.ObjectId;
  module: Types.ObjectId;
  course: Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  quizBestScore?: number;
  quizAttempts: number;
  quizLastAttemptAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    quizBestScore: { type: Number, min: 0, max: 100 },
    quizAttempts: { type: Number, default: 0, min: 0 },
    quizLastAttemptAt: { type: Date },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export const LessonProgress = model<ILessonProgress>("LessonProgress", lessonProgressSchema);
