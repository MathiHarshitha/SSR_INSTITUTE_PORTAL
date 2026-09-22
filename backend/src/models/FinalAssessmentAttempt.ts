import { Schema, model, Document, Types } from "mongoose";
import { QuizAttemptStatus } from "./QuizAttempt";

/** Same session state-machine shape as QuizAttempt, scoped to a course's FinalAssessment
 * instead of a Lesson — kept as a separate model since eligibility/gating rules differ
 * (course-level, all-modules-complete precondition) rather than overloading QuizAttempt. */
export interface IFinalAssessmentAttempt extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  finalAssessment: Types.ObjectId;
  status: QuizAttemptStatus;
  currentIndex: number;
  answers: (number | null)[];
  score?: number;
  passed?: boolean;
  startedAt: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const finalAssessmentAttemptSchema = new Schema<IFinalAssessmentAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    finalAssessment: { type: Schema.Types.ObjectId, ref: "FinalAssessment", required: true },
    status: { type: String, enum: ["IN_PROGRESS", "SUBMITTED", "QUIT"], default: "IN_PROGRESS" },
    currentIndex: { type: Number, default: 0, min: 0 },
    answers: { type: [Schema.Types.Mixed], default: [] },
    score: { type: Number, min: 0, max: 100 },
    passed: { type: Boolean },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

finalAssessmentAttemptSchema.index({ student: 1, course: 1 }, { unique: true });

export const FinalAssessmentAttempt = model<IFinalAssessmentAttempt>(
  "FinalAssessmentAttempt",
  finalAssessmentAttemptSchema
);
