import { Schema, model, Document, Types } from "mongoose";

/**
 * One login = one session. The refresh token is an opaque random secret stored only as a
 * SHA-256 hash and rotated on every refresh; access tokens carry the session id, so revoking
 * the session (logout, password reset, block/suspend) invalidates both immediately.
 */
export interface ISession extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  refreshTokenHash: string;
  /** Hash of the token this one replaced — accepted briefly so concurrent tabs refreshing with
   * the same cookie don't trip reuse detection. */
  previousRefreshTokenHash?: string;
  rotatedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    previousRefreshTokenHash: { type: String },
    rotatedAt: { type: Date },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = model<ISession>("Session", sessionSchema);
