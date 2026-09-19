import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Enrollment } from "../src/models/Enrollment";
import { createUser, authHeader } from "./helpers";

const app = createApp();

async function createBatch(trainerId: string, courseId: string) {
  return Batch.create({
    name: "Batch A",
    course: courseId,
    trainer: trainerId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    classDays: ["MON", "WED"],
    startTime: "10:00",
    endTime: "12:00",
    mode: "ONLINE",
    capacity: 30,
  });
}

describe("assertBatchAccess boundary (shared by materials, schedule, attendance, tasks, submissions)", () => {
  it("blocks a trainer from another trainer's batch", async () => {
    const course = await Course.create({
      name: "Data Science",
      shortDescription: "...",
      duration: "3 months",
      fee: 1000,
      status: "PUBLISHED",
    });
    const { user: ownerTrainer } = await createUser({ role: "TRAINER" });
    const { token: otherTrainerToken } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(ownerTrainer._id.toString(), course._id.toString());

    const blocked = await request(app)
      .get(`/api/v1/materials?batch=${batch._id.toString()}`)
      .set(authHeader(otherTrainerToken));
    expect(blocked.status).toBe(403);
  });

  it("allows the assigned trainer through", async () => {
    const course = await Course.create({
      name: "Data Science",
      shortDescription: "...",
      duration: "3 months",
      fee: 1000,
      status: "PUBLISHED",
    });
    const { user: ownerTrainer, token: ownerToken } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(ownerTrainer._id.toString(), course._id.toString());

    const res = await request(app)
      .get(`/api/v1/materials?batch=${batch._id.toString()}`)
      .set(authHeader(ownerToken));
    expect(res.status).toBe(200);
  });

  it("blocks a student who isn't enrolled, and allows one who is", async () => {
    const course = await Course.create({
      name: "Data Science",
      shortDescription: "...",
      duration: "3 months",
      fee: 1000,
      status: "PUBLISHED",
    });
    const { user: ownerTrainer } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(ownerTrainer._id.toString(), course._id.toString());

    const { token: outsiderToken } = await createUser({ role: "STUDENT" });
    const { user: enrolledStudent, token: enrolledToken } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: enrolledStudent._id, batch: batch._id, course: course._id });

    const blocked = await request(app)
      .get(`/api/v1/materials?batch=${batch._id.toString()}`)
      .set(authHeader(outsiderToken));
    expect(blocked.status).toBe(403);

    const allowed = await request(app)
      .get(`/api/v1/materials?batch=${batch._id.toString()}`)
      .set(authHeader(enrolledToken));
    expect(allowed.status).toBe(200);
  });

  it("lets an admin through regardless of assignment or enrollment", async () => {
    const course = await Course.create({
      name: "Data Science",
      shortDescription: "...",
      duration: "3 months",
      fee: 1000,
      status: "PUBLISHED",
    });
    const { user: ownerTrainer } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(ownerTrainer._id.toString(), course._id.toString());
    const { token: adminToken } = await createUser({ role: "ADMIN" });

    const res = await request(app)
      .get(`/api/v1/materials?batch=${batch._id.toString()}`)
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
  });
});
