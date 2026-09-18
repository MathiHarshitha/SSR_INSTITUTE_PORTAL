import { Schema, model, Document, Types } from "mongoose";

export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  batch: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  receiptNumber: string;
  notes?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: Date.now, index: true },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "BANK_TRANSFER", "OTHER"],
      required: true,
    },
    transactionRef: { type: String, trim: true },
    receiptNumber: { type: String, required: true, unique: true },
    notes: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
