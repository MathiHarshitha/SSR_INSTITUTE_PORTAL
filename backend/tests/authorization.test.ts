import request from "supertest";
import { createApp } from "../src/app";
import { User } from "../src/models/User";
import { createUser, authHeader } from "./helpers";

const app = createApp();

describe("Authorization boundaries", () => {
  it("rejects a request with no token", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
  });

  it("rejects a request with a garbage token", async () => {
    const res = await request(app).get("/api/v1/users").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("rejects a non-admin role from an admin-only route (RBAC)", async () => {
    const { token: studentToken } = await createUser({ role: "STUDENT" });
    const student = await request(app).get("/api/v1/users").set(authHeader(studentToken));
    expect(student.status).toBe(403);

    const { token: trainerToken } = await createUser({ role: "TRAINER" });
    const trainer = await request(app).get("/api/v1/users").set(authHeader(trainerToken));
    expect(trainer.status).toBe(403);
  });

  it("allows an admin through the same route", async () => {
    const { token } = await createUser({ role: "ADMIN" });
    const res = await request(app).get("/api/v1/users").set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it("revokes access immediately when a user is blocked mid-session, even with a still-valid token", async () => {
    const { token, user } = await createUser({ role: "STUDENT" });

    const before = await request(app).get("/api/v1/auth/me").set(authHeader(token));
    expect(before.status).toBe(200);

    await User.updateOne({ _id: user._id }, { status: "BLOCKED" });

    const after = await request(app).get("/api/v1/auth/me").set(authHeader(token));
    expect(after.status).toBe(403);
  });

  it("never trusts a client-supplied role — a forged claim can't escalate privilege", async () => {
    // authorize() only ever reads req.user, which authenticate() derives from the verified JWT
    // plus a fresh DB lookup — there is no code path where a request body/header role is honored.
    const { token } = await createUser({ role: "STUDENT" });
    const res = await request(app)
      .get("/api/v1/users")
      .set(authHeader(token))
      .send({ role: "ADMIN" });
    expect(res.status).toBe(403);
  });
});
