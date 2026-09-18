import { Schema, model, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  batch: Types.ObjectId;
  course: Types.ObjectId;
  discount: number;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    discount: { type: Number, default: 0, min: 0 },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, batch: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
