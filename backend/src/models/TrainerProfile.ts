import { Schema, model, Document, Types } from "mongoose";

export interface ITrainerProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  qualification?: string;
  skills: string[];
  specialization?: string;
  experienceYears?: number;
  bio?: string;
  resumeUrl?: string;
  documentUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

const trainerProfileSchema = new Schema<ITrainerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    qualification: { type: String },
    skills: { type: [String], default: [] },
    specialization: { type: String },
    experienceYears: { type: Number },
    bio: { type: String },
    resumeUrl: { type: String },
    documentUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const TrainerProfile = model<ITrainerProfile>("TrainerProfile", trainerProfileSchema);
