import { Schema, model, Document, Types } from "mongoose";

/**
 * Singleton (key "default") holding institute-wide payment configuration — currently the
 * payment QR code shown to students. Only a file reference + metadata is stored; no payment
 * credentials. Admins replace the QR here, so changing the payee account never needs a
 * frontend change or redeploy.
 */
export interface IPaymentSettings extends Document {
  _id: Types.ObjectId;
  key: string;
  qrCode?: {
    provider: "cloudinary" | "local";
    key: string;
    mimeType: string;
    bytes: number;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    qrCode: {
      type: new Schema(
        {
          provider: { type: String, enum: ["cloudinary", "local"], required: true },
          key: { type: String, required: true },
          mimeType: { type: String, required: true },
          bytes: { type: Number, required: true, min: 0 },
          uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
          uploadedAt: { type: Date, required: true },
        },
        { _id: false }
      ),
      required: false,
    },
  },
  { timestamps: true }
);

export const PaymentSettings = model<IPaymentSettings>("PaymentSettings", paymentSettingsSchema);
