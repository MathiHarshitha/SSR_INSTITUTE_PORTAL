import { Schema, model, Document, Types } from "mongoose";

export type TaskType = "ASSIGNMENT" | "QUIZ" | "PROJECT";
export type TaskStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface IQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  question: string;
  options: IQuizOption[];
  marks: number;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  type: TaskType;
  title: string;
  description: string;
  course: Types.ObjectId;
  module?: Types.ObjectId;
  batch: Types.ObjectId;
  dueDate: Date;
  maxMarks: number;
  status: TaskStatus;

  // Assignment
  attachmentUrls: string[];

  // Quiz
  questions: IQuizQuestion[];
  timeLimitMinutes?: number;
  attemptsAllowed?: number;

  // Project
  requirements: string[];
  submissionFormat?: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizOptionSchema = new Schema<IQuizOption>(
  { text: { type: String, required: true, trim: true }, isCorrect: { type: Boolean, default: false } },
  { _id: false }
);

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [quizOptionSchema], default: [] },
    marks: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const taskSchema = new Schema<ITask>(
  {
    type: { type: String, enum: ["ASSIGNMENT", "QUIZ", "PROJECT"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    maxMarks: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "CLOSED"], default: "DRAFT", index: true },

    attachmentUrls: { type: [String], default: [] },

    questions: { type: [quizQuestionSchema], default: [] },
    timeLimitMinutes: { type: Number, min: 1 },
    attemptsAllowed: { type: Number, min: 1 },

    requirements: { type: [String], default: [] },
    submissionFormat: { type: String, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

taskSchema.index({ batch: 1, status: 1 });

export const Task = model<ITask>("Task", taskSchema);
