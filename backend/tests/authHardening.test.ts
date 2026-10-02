/**
 * Auth hardening: origin checks on the cookie endpoints, per-account login limiting, login audit
 * events and admin status transitions. OTP/reset-token cases live in otpResetHardening.test.ts.
 */
import request from "supertest";
import { createApp } from "../src/app";
import { AuditLog } from "../src/models/AuditLog";
import { User } from "../src/models/User";
import { createUser, authHeader } from "./helpers";

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

describe("Origin check on cookie-authenticated auth endpoints", () => {
  it("rejects a foreign Origin on login, refresh and logout", async () => {
    const { user, password } = await createUser({ role: "STUDENT" });
    const evil = "https://evil.example";
    expect(
      (await request(app).post("/api/v1/auth/login").set("Origin", evil).send({ email: user.email, password })).status
    ).toBe(403);
    expect((await request(app).post("/api/v1/auth/refresh-token").set("Origin", evil)).status).toBe(403);
    expect((await request(app).post("/api/v1/auth/logout").set("Origin", evil)).status).toBe(403);
  });

  it("allows the configured frontend origin and requests without an Origin", async () => {
    const { user, password } = await createUser({ role: "STUDENT" });
    const allowed = await request(app)
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .send({ email: user.email, password });
    expect(allowed.status).toBe(200);
    expect((await request(app).post("/api/v1/auth/logout")).status).toBe(200);
  });
});

describe("Per-account login limiting", () => {
  it("locks an email after 10 failed attempts, regardless of casing", async () => {
    const { user, password } = await createUser({ role: "STUDENT", email: "locked@test.local" });
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: i % 2 ? " LOCKED@test.local " : user.email, password: "WrongPassw0rd" });
      expect(res.status).toBe(401);
    }
    const blocked = await request(app).post("/api/v1/auth/login").send({ email: user.email, password });
    expect(blocked.status).toBe(429);
  });
});

describe("Auth audit events", () => {
  it("records failed logins (without the password, even for unknown emails) and successful ones", async () => {
    const { user, password } = await createUser({ role: "STUDENT", email: "audited@test.local" });

    await request(app).post("/api/v1/auth/login").send({ email: "ghost@test.local", password: "S3cretGuess!" });
    await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "S3cretGuess!" });
    expect((await request(app).post("/api/v1/auth/login").send({ email: user.email, password })).status).toBe(200);

    const unknown = await eventually(() => AuditLog.findOne({ action: "LOGIN_FAILED", user: { $exists: false } }).lean());
    expect(unknown.metadata).toEqual({ email: "g***@test.local", reason: "unknown_account" });
    const bad = await eventually(() => AuditLog.findOne({ action: "LOGIN_FAILED", user: user._id }).lean());
    expect(bad.metadata).toEqual({ email: "a***@test.local", reason: "bad_credentials" });
    expect(JSON.stringify(await AuditLog.find().lean())).not.toContain("S3cretGuess!");
    expect(await AuditLog.exists({ action: "LOGIN_SUCCESS", user: user._id })).toBeTruthy();

    // The audit list still renders entries that have no user.
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const list = await request(app).get("/api/v1/audit-logs").set(authHeader(adminToken));
    expect(list.status).toBe(200);
  });
});

describe("Admin status transitions", () => {
  it("only allows block/unblock/suspend/reactivate from their valid source states", async () => {
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const patch = (id: unknown, action: string, body: object = {}) =>
      request(app).patch(`/api/v1/users/${id}/${action}`).set(authHeader(adminToken)).send(body);

    const { user: pending } = await createUser({ role: "STUDENT", status: "PENDING" });
    const unblockPending = await patch(pending._id, "unblock");
    expect(unblockPending.status).toBe(400);
    expect(unblockPending.body.message).toBe("Cannot unblock a user who is pending");
    expect((await patch(pending._id, "reactivate")).status).toBe(400);
    expect((await patch(pending._id, "block")).status).toBe(400);
    expect((await User.findById(pending._id))?.status).toBe("PENDING");

    const { user } = await createUser({ role: "STUDENT" });
    expect((await patch(user._id, "unblock")).status).toBe(400);
    expect((await patch(user._id, "reactivate")).status).toBe(400);
    expect((await patch(user._id, "suspend", { reason: "Fees overdue" })).status).toBe(200);
    expect((await patch(user._id, "suspend", { reason: "Again" })).status).toBe(400);
    expect((await patch(user._id, "unblock")).status).toBe(400);
    expect((await patch(user._id, "block")).status).toBe(200);
    expect((await patch(user._id, "reactivate")).status).toBe(400);
    expect((await patch(user._id, "unblock")).status).toBe(200);
    expect((await User.findById(user._id))?.status).toBe("ACTIVE");
  });
});
