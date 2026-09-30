jest.mock("../src/utils/tokens", () => {
  const actual = jest.requireActual("../src/utils/tokens");
  return { ...actual, generateOtp: () => "123456" };
});

import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { User } from "../src/models/User";
import { StudentProfile } from "../src/models/StudentProfile";
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
      guardianPhone: "9876500001",
      acceptedPrivacyPolicy: true,
    });

    expect(res.status).toBe(201);

    const stored = await User.findOne({ email: "alice@test.local" });
    expect(stored?.status).toBe("PENDING");
    expect(stored?.isEmailVerified).toBe(false);

    const profile = await StudentProfile.findOne({ user: stored?._id });
    expect(profile?.guardianPhone).toBe("9876500001");
    expect(profile?.privacyPolicyAcceptedAt).toBeInstanceOf(Date);
  });

  it("requires a parent/spouse phone and privacy policy acceptance", async () => {
    const course = await createPublishedCourse();
    const base = {
      name: "Eve Student",
      email: "eve@test.local",
      phone: "9876533333",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
      courseId: course._id.toString(),
    };

    const noGuardian = await request(app)
      .post("/api/v1/auth/register/student")
      .send({ ...base, acceptedPrivacyPolicy: true });
    expect(noGuardian.status).toBe(422);

    const notAccepted = await request(app)
      .post("/api/v1/auth/register/student")
      .send({ ...base, guardianPhone: "9876500002", acceptedPrivacyPolicy: false });
    expect(notAccepted.status).toBe(422);

    expect(await User.countDocuments({ email: "eve@test.local" })).toBe(0);
  });

  it("requires an alternate phone and privacy policy acceptance for trainers", async () => {
    const base = {
      name: "Tom Trainer",
      email: "tom@test.local",
      phone: "9876544444",
      password: "Passw0rd1",
      confirmPassword: "Passw0rd1",
    };

    const noAlternate = await request(app)
      .post("/api/v1/auth/register/trainer")
      .send({ ...base, acceptedPrivacyPolicy: true });
    expect(noAlternate.status).toBe(422);

    const notAccepted = await request(app)
      .post("/api/v1/auth/register/trainer")
      .send({ ...base, alternatePhone: "9876500003", acceptedPrivacyPolicy: false });
    expect(notAccepted.status).toBe(422);

    expect(await User.countDocuments({ email: "tom@test.local" })).toBe(0);
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
      guardianPhone: "9876500001",
      acceptedPrivacyPolicy: true,
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
      guardianPhone: "9876500001",
      acceptedPrivacyPolicy: true,
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
      guardianPhone: "9876500001",
      acceptedPrivacyPolicy: true,
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
