import { Schema, model, Document, Types } from "mongoose";

export interface ILessonProgress extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  lesson: Types.ObjectId;
  topic: Types.ObjectId;
  module: Types.ObjectId;
  course: Types.ObjectId;

  // Per-stage completion — a lesson is only `completed` once every stage that
  // actually exists on it (practice/quiz/codingQuestion are all optional on
  // Lesson) has been satisfied. Viewing a lesson never sets any of these.
  practiceCompleted: boolean;
  practiceCompletedAt?: Date;
  quizPassed: boolean;
  quizPassedAt?: Date;
  codingCompleted: boolean;
  codingCompletedAt?: Date;

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

    practiceCompleted: { type: Boolean, default: false },
    practiceCompletedAt: { type: Date },
    quizPassed: { type: Boolean, default: false },
    quizPassedAt: { type: Date },
    codingCompleted: { type: Boolean, default: false },
    codingCompletedAt: { type: Date },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    quizBestScore: { type: Number, min: 0, max: 100 },
    quizAttempts: { type: Number, default: 0, min: 0 },
    quizLastAttemptAt: { type: Date },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ student: 1, course: 1 });

export const LessonProgress = model<ILessonProgress>("LessonProgress", lessonProgressSchema);
