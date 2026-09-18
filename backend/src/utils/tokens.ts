import crypto from "crypto";

/** Returns { raw, hashed } — send `raw` to the user (email/SMS), store only `hashed` in the DB. */
export function generateSecureToken(bytes = 32): { raw: string; hashed: string } {
  const raw = crypto.randomBytes(bytes).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
}
