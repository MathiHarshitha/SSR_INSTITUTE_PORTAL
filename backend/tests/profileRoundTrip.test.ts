import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { User } from "../src/models/User";
import { StudentProfile } from "../src/models/StudentProfile";
import { TrainerProfile } from "../src/models/TrainerProfile";

const app = createApp();

async function activate(email: string) {
  await User.updateOne({ email }, { $set: { isEmailVerified: true, status: "ACTIVE" } });
}

async function login(email: string, password: string) {
  const res = await request(app).post("/api/v1/auth/login").send({ email, password });
  expect(res.status).toBe(200);
  return res.body.data.accessToken as string;
}

describe("Profile: details entered at registration show up on the profile", () => {
  it("student: registration fields are returned by /auth/me and survive a profile edit", async () => {
    const course = await Course.create({ name: "MERN", shortDescription: "...", duration: "6 months", fee: 1000, status: "PUBLISHED" });
    const reg = await request(app).post("/api/v1/auth/register/student").send({
      name: "Ravi Kumar",
      email: "ravi@test.local",
      phone: "9876543210",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
      dateOfBirth: "2001-05-14",
      gender: "MALE",
      highestQualification: "B.Tech",
      college: "JNTU",
      courseId: String(course._id),
    });
    expect(reg.status).toBe(201);
    await activate("ravi@test.local");
    const token = await login("ravi@test.local", "Passw0rd!");

    const me = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data).toMatchObject({ name: "Ravi Kumar", phone: "9876543210" });
    expect(me.body.data.profile).toMatchObject({ gender: "MALE", highestQualification: "B.Tech", college: "JNTU" });
    expect(String(me.body.data.profile.dateOfBirth).slice(0, 10)).toBe("2001-05-14");

    // Editing one field keeps everything else.
    const edit = await request(app)
      .patch("/api/v1/auth/me/student-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ address: "Hyderabad" });
    expect(edit.status).toBe(200);
    const after = await StudentProfile.findOne({ user: me.body.data.id }).lean();
    expect(after).toMatchObject({ address: "Hyderabad", gender: "MALE", highestQualification: "B.Tech", college: "JNTU" });
  });

  it("trainer: registration fields are returned by /auth/me", async () => {
    const reg = await request(app).post("/api/v1/auth/register/trainer").send({
      name: "Priya Trainer",
      email: "priya@test.local",
      phone: "9876543211",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
      qualification: "M.Tech",
      specialization: "MERN",
      experienceYears: 5,
      skills: ["React", "Node"],
    });
    expect(reg.status).toBe(201);
    await activate("priya@test.local");
    const token = await login("priya@test.local", "Passw0rd!");

    const me = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.body.data.profile).toMatchObject({
      qualification: "M.Tech",
      specialization: "MERN",
      experienceYears: 5,
      skills: ["React", "Node"],
    });
    expect(await TrainerProfile.countDocuments()).toBe(1);
  });
});
