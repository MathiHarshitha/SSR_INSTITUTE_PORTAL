import { Schema, model, Document, Types } from "mongoose";

export type MaterialType = "DOCUMENT" | "VIDEO" | "IMAGE" | "LINK" | "OTHER";

export interface IMaterial extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: MaterialType;
  module?: Types.ObjectId;
  course: Types.ObjectId;
  batch: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, enum: ["DOCUMENT", "VIDEO", "IMAGE", "LINK", "OTHER"], required: true },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

materialSchema.index({ batch: 1, module: 1 });

export const Material = model<IMaterial>("Material", materialSchema);
