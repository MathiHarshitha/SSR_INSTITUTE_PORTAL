import { Schema, model, Document, Types } from "mongoose";
import { GENDERS, Gender } from "../constants/enums";

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  highestQualification?: string;
  college?: string;
  graduationYear?: number;
  percentageOrCgpa?: string;
  skills: string[];
  experience?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  interestedCourse?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: GENDERS },
    address: { type: String },
    highestQualification: { type: String },
    college: { type: String },
    graduationYear: { type: Number },
    percentageOrCgpa: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: String },
    resumeUrl: { type: String },
    portfolioUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    interestedCourse: { type: Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);

export const StudentProfile = model<IStudentProfile>("StudentProfile", studentProfileSchema);
