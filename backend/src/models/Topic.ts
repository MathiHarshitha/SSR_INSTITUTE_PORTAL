import { Schema, model, Document, Types } from "mongoose";

export interface ITopic extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  module: Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

topicSchema.index({ module: 1, order: 1 });
topicSchema.index({ name: "text", description: "text" });

export const Topic = model<ITopic>("Topic", topicSchema);
