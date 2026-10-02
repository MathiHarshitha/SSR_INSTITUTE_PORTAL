/**
 * Email verification codes and password reset tokens: atomic attempt counting, single use and
 * answers that don't reveal which emails exist. Kept apart from authHardening.test.ts because
 * verify-otp/reset-password share the per-IP authLimiter with login.
 */
import request from "supertest";
import { createApp } from "../src/app";
import { AuditLog } from "../src/models/AuditLog";
import { OTPVerification } from "../src/models/OTPVerification";
import { PasswordResetToken } from "../src/models/PasswordResetToken";
import { generateSecureToken, hashToken } from "../src/utils/tokens";
import { createUser } from "./helpers";

const app = createApp();

/** For fire-and-forget writes that land just after the response. */
async function eventually<T>(fn: () => Promise<T | null | undefined>, timeoutMs = 3000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await fn();
    if (value) return value;
    if (Date.now() > deadline) throw new Error("condition not met in time");
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe("Email verification codes", () => {
  async function pendingWithCode(otp = "111111") {
    const { user } = await createUser({ role: "STUDENT", status: "PENDING", isEmailVerified: false });
    await OTPVerification.create({
      user: user._id,
      otpHash: hashToken(otp),
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + 60_000),
    });
    return user;
  }

  it("answers a wrong code and an exhausted code exactly like an unknown email", async () => {
    const user = await pendingWithCode();
    const unknown = await request(app).post("/api/v1/auth/verify-otp").send({ email: "nobody@test.local", otp: "000000" });

    for (let i = 0; i < 6; i++) {
      const wrong = await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "000000" });
      expect(wrong.status).toBe(unknown.status);
      expect(wrong.body.message).toBe(unknown.body.message);
    }
    // Attempts are capped even though the answers look the same.
    expect((await OTPVerification.findOne({ user: user._id }))?.attempts).toBe(5);
    // Exhausted: even the right code is now refused.
    const right = await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "111111" });
    expect(right.status).toBe(400);
  });

  it("counts concurrent guesses atomically", async () => {
    const user = await pendingWithCode();
    await Promise.all(
      Array.from({ length: 7 }, () =>
        request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "000000" })
      )
    );
    expect((await OTPVerification.findOne({ user: user._id }))?.attempts).toBe(5);
  });

  it("verifies with the right code and records EMAIL_VERIFIED", async () => {
    const user = await pendingWithCode();
    const res = await request(app).post("/api/v1/auth/verify-otp").send({ email: user.email, otp: "111111" });
    expect(res.status).toBe(200);
    expect(await AuditLog.exists({ action: "EMAIL_VERIFIED", user: user._id })).toBeTruthy();
  });
});

describe("Password reset tokens", () => {
  it("can only be redeemed once, even concurrently", async () => {
    const { user } = await createUser({ role: "STUDENT" });
    const { raw, hashed } = generateSecureToken();
    await PasswordResetToken.create({ user: user._id, tokenHash: hashed, expiresAt: new Date(Date.now() + 60_000) });

    const body = { token: raw, password: "NewPassw0rd1", confirmPassword: "NewPassw0rd1" };
    const results = await Promise.all([
      request(app).post("/api/v1/auth/reset-password").send(body),
      request(app).post("/api/v1/auth/reset-password").send(body),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
    expect(await AuditLog.countDocuments({ action: "PASSWORD_RESET_COMPLETED", user: user._id })).toBe(1);
  });

  it("forgot-password answers the same either way and issues the token off the request path", async () => {
    const { user } = await createUser({ role: "STUDENT" });
    const known = await request(app).post("/api/v1/auth/forgot-password").send({ email: user.email });
    const unknown = await request(app).post("/api/v1/auth/forgot-password").send({ email: "nobody@test.local" });
    expect(known.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    await eventually(() => PasswordResetToken.exists({ user: user._id }));
    await eventually(() => AuditLog.exists({ action: "PASSWORD_RESET_REQUESTED", user: user._id }));
  });
});
