import { Schema, model, Document, Types } from "mongoose";

/**
 * Server-side quiz session state machine for a Lesson's embedded quiz. One row per
 * (student, lesson) — reset on each new attempt. This is the real anti-cheat boundary:
 * the client only ever sees `currentIndex`'s question, never a previous one, and the
 * server never trusts a client-submitted answers array.
 */
export type QuizAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "QUIT";

export interface IQuizAttempt extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  lesson: Types.ObjectId;
  status: QuizAttemptStatus;
  currentIndex: number;
  answers: (number | null)[];
  score?: number;
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "QUIT"], default: "IN_PROGRESS" },
    currentIndex: { type: Number, default: 0, min: 0 },
    answers: { type: [Schema.Types.Mixed], default: [] },
    score: { type: Number, min: 0, max: 100 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ student: 1, lesson: 1 }, { unique: true });

export const QuizAttempt = model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);
