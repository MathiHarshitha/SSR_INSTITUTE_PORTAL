import { Schema, model, Document, Types } from "mongoose";
import { IQuizQuestion } from "./Lesson";

/** Course-level final assessment — one per course, authored by admin/trainer, unlocked
 * for a student only once every module in the course is complete (see utils/progressState). */
export interface IFinalAssessment extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  questions: IQuizQuestion[];
  passingScore: number;
  published: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 6,
        message: "A question needs between 2 and 6 options",
      },
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const finalAssessmentSchema = new Schema<IFinalAssessment>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 150, default: "Final Assessment" },
    questions: {
      type: [quizQuestionSchema],
      default: [],
      validate: {
        validator: (v: IQuizQuestion[]) => v.length <= 100,
        message: "Too many questions",
      },
    },
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    published: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const FinalAssessment = model<IFinalAssessment>("FinalAssessment", finalAssessmentSchema);
