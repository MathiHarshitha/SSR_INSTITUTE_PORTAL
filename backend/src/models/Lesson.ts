import { Schema, model, Document, Types } from "mongoose";

export type LessonDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ICodeExample {
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface ICommonMistake {
  wrong: string;
  right: string;
  explanation?: string;
}

export interface IPractice {
  instructions: string;
  starterCode?: string;
  hint?: string;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ILesson extends Document {
  _id: Types.ObjectId;
  topic: Types.ObjectId;
  module: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  order: number;
  difficulty: LessonDifficulty;
  published: boolean;

  // Teaching-format content — spec §18: what is it -> why -> analogy -> example ->
  // technical -> code -> real-world usage -> mistakes -> practice -> quiz -> remember this.
  whatIsIt: string;
  whyItMatters: string;
  analogy: string;
  simpleExample: string;
  technicalExplanation?: string;
  codeExamples: ICodeExample[];
  realWorldUsage?: string;
  commonMistakes: ICommonMistake[];
  practice: IPractice | null;
  quiz: IQuizQuestion[];
  rememberThis?: string;
  keyTakeaways: string[];

  createdAt: Date;
  updatedAt: Date;
}

const codeExampleSchema = new Schema<ICodeExample>(
  {
    title: { type: String, trim: true, maxlength: 150 },
    language: { type: String, required: true, trim: true, maxlength: 40 },
    code: { type: String, required: true },
    explanation: { type: String, trim: true, maxlength: 3000 },
  },
  { _id: false }
);

const commonMistakeSchema = new Schema<ICommonMistake>(
  {
    wrong: { type: String, required: true },
    right: { type: String, required: true },
    explanation: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const practiceSchema = new Schema<IPractice>(
  {
    instructions: { type: String, required: true },
    starterCode: { type: String },
    hint: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 6,
        message: "A quiz question needs between 2 and 6 options",
      },
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    estimatedMinutes: { type: Number, min: 0 },
    order: { type: Number, required: true, default: 0 },
    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },
    published: { type: Boolean, default: true },

    whatIsIt: { type: String, default: "", trim: true },
    whyItMatters: { type: String, default: "", trim: true },
    analogy: { type: String, default: "", trim: true },
    simpleExample: { type: String, default: "", trim: true },
    technicalExplanation: { type: String, trim: true },
    codeExamples: { type: [codeExampleSchema], default: [] },
    realWorldUsage: { type: String, trim: true },
    commonMistakes: { type: [commonMistakeSchema], default: [] },
    practice: { type: practiceSchema, default: null },
    quiz: { type: [quizQuestionSchema], default: [] },
    rememberThis: { type: String, trim: true, maxlength: 500 },
    keyTakeaways: { type: [String], default: [] },
  },
  { timestamps: true }
);

lessonSchema.index({ topic: 1, order: 1 });
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ title: "text", description: "text" });

export const Lesson = model<ILesson>("Lesson", lessonSchema);
