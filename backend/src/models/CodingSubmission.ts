import { Schema, model, Document, Types } from "mongoose";

export interface ITestResult {
  passed: boolean;
  args: unknown[];
  expectedOutput: unknown;
  actualOutput?: unknown;
  error?: string;
}

export interface ICodingSubmission extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  lesson: Types.ObjectId;
  code: string;
  passed: boolean;
  testResults: ITestResult[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const testResultSchema = new Schema<ITestResult>(
  {
    passed: { type: Boolean, required: true },
    args: { type: [Schema.Types.Mixed], default: [] },
    expectedOutput: { type: Schema.Types.Mixed },
    actualOutput: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  { _id: false }
);

const codingSubmissionSchema = new Schema<ICodingSubmission>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    code: { type: String, required: true },
    passed: { type: Boolean, required: true },
    testResults: { type: [testResultSchema], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

codingSubmissionSchema.index({ student: 1, lesson: 1, createdAt: -1 });

export const CodingSubmission = model<ICodingSubmission>("CodingSubmission", codingSubmissionSchema);
