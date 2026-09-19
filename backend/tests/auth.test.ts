jest.mock("../src/utils/tokens", () => {
  const actual = jest.requireActual("../src/utils/tokens");
  return { ...actual, generateOtp: () => "123456" };
});

import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { User } from "../src/models/User";
import { createUser } from "./helpers";

const app = createApp();

async function createPublishedCourse() {
  return Course.create({
    name: "Full Stack Web Development",
    shortDescription: "Learn the MERN stack",
    duration: "6 months",
    fee: 50000,
    status: "PUBLISHED",
  });
}

describe("Auth: registration -> OTP -> login", () => {
  it("registers a student as PENDING and unverified", async () => {
    const course = await createPublishedCourse();

    const res = await request(app).post("/api/v1/auth/register/student").send({
      name: "Alice Student",
      email: "alice@test.local",
      phone: "9876543210",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
      courseId: course._id.toString(),
    });

    expect(res.status).toBe(201);

    const stored = await User.findOne({ email: "alice@test.local" });
    expect(stored?.status).toBe("PENDING");
    expect(stored?.isEmailVerified).toBe(false);
  });

  it("rejects a duplicate email registration", async () => {
    const course = await createPublishedCourse();
    const payload = {
      name: "Bob Student",
      email: "bob@test.local",
      phone: "9876500000",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
      courseId: course._id.toString(),
    };

    await request(app).post("/api/v1/auth/register/student").send(payload);
    const res = await request(app).post("/api/v1/auth/register/student").send(payload);

    expect(res.status).toBe(409);
  });

  it("rejects an incorrect OTP and accepts the correct one", async () => {
    const course = await createPublishedCourse();
    await request(app).post("/api/v1/auth/register/student").send({
      name: "Carla Student",
      email: "carla@test.local",
      phone: "9876511111",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
      courseId: course._id.toString(),
    });

    const wrong = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: "carla@test.local", otp: "000000" });
    expect(wrong.status).toBe(400);

    const right = await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: "carla@test.local", otp: "123456" });
    expect(right.status).toBe(200);

    const stored = await User.findOne({ email: "carla@test.local" });
    expect(stored?.isEmailVerified).toBe(true);
  });

  it("blocks login before email verification and before admin approval, then allows it once ACTIVE", async () => {
    const course = await createPublishedCourse();
    await request(app).post("/api/v1/auth/register/student").send({
      name: "Dana Student",
      email: "dana@test.local",
      phone: "9876522222",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
      courseId: course._id.toString(),
    });

    const beforeVerify = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dana@test.local", password: "Passw0rd1" });
    expect(beforeVerify.status).toBe(403);

    await request(app)
      .post("/api/v1/auth/verify-otp")
      .send({ email: "dana@test.local", otp: "123456" });

    const beforeApproval = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dana@test.local", password: "Passw0rd1" });
    expect(beforeApproval.status).toBe(403);

    await User.updateOne({ email: "dana@test.local" }, { status: "ACTIVE" });

    const afterApproval = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dana@test.local", password: "Passw0rd1" });
    expect(afterApproval.status).toBe(200);
    expect(afterApproval.body.data.accessToken).toBeTruthy();

    const wrongPassword = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dana@test.local", password: "WrongPassword1" });
    expect(wrongPassword.status).toBe(401);
  });

  it("GET /me requires a valid token and returns the caller's own profile", async () => {
    const noToken = await request(app).get("/api/v1/auth/me");
    expect(noToken.status).toBe(401);

    const { token, user } = await createUser({ role: "STUDENT" });
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user._id.toString());
  });
});
