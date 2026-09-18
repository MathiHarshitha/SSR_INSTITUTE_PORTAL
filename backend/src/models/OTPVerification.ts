import { Schema, model, Document, Types } from "mongoose";

export interface IOTPVerification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  otpHash: string;
  purpose: "EMAIL_VERIFICATION" | "LOGIN_2FA";
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
}

const otpVerificationSchema = new Schema<IOTPVerification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["EMAIL_VERIFICATION", "LOGIN_2FA"], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPVerification = model<IOTPVerification>("OTPVerification", otpVerificationSchema);
