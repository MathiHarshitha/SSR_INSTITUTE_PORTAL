import { Schema, model, Document, Types } from "mongoose";

export type BatchMode = "ONLINE" | "OFFLINE" | "HYBRID";
export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface IBatch extends Document {
  _id: Types.ObjectId;
  name: string;
  course: Types.ObjectId;
  trainer?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  classDays: string[];
  startTime: string;
  endTime: string;
  mode: BatchMode;
  location?: string;
  capacity: number;
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    classDays: { type: [String], default: [] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    mode: { type: String, enum: ["ONLINE", "OFFLINE", "HYBRID"], required: true },
    location: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
      index: true,
    },
  },
  { timestamps: true }
);

batchSchema.index({ course: 1, status: 1 });

export const Batch = model<IBatch>("Batch", batchSchema);
