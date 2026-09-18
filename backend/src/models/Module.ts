import { Schema, model, Document, Types } from "mongoose";

export interface IModule extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  name: string;
  description?: string;
  estimatedDuration?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    estimatedDuration: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

moduleSchema.index({ course: 1, order: 1 });

export const Module = model<IModule>("Module", moduleSchema);
