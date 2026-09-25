import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Enrollment } from "../src/models/Enrollment";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";
import { LessonProgress } from "../src/models/LessonProgress";
import { createUser, authHeader } from "./helpers";

const app = createApp();

async function createBatch(trainerId: string, courseId: string) {
  return Batch.create({
    name: "Batch A",
    course: courseId,
    trainer: trainerId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    classDays: ["MON"],
    startTime: "10:00",
    endTime: "12:00",
    mode: "ONLINE",
    capacity: 30,
  });
}

describe("Notifications", () => {
  it("notifies only students enrolled in the batch when a task is published", async () => {
    const course = await Course.create({
      name: "Course A",
      shortDescription: "...",
      duration: "1 month",
      fee: 100,
      status: "PUBLISHED",
    });
    const { user: trainer, token: trainerToken } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(trainer._id.toString(), course._id.toString());

    const { user: enrolledStudent, token: enrolledToken } = await createUser({ role: "STUDENT" });
    const { token: outsiderToken } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: enrolledStudent._id, batch: batch._id, course: course._id });

    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set(authHeader(trainerToken))
      .send({
        type: "ASSIGNMENT",
        title: "Task 1",
        description: "A sufficiently long description",
        batch: batch._id.toString(),
        dueDate: "2027-01-01",
        maxMarks: 10,
      });
    expect(createRes.status).toBe(201);

    await request(app)
      .patch(`/api/v1/tasks/${createRes.body.data._id}/status`)
      .set(authHeader(trainerToken))
      .send({ status: "PUBLISHED" });

    const enrolledCount = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set(authHeader(enrolledToken));
    expect(enrolledCount.body.data.count).toBe(1);

    const outsiderCount = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set(authHeader(outsiderToken));
    expect(outsiderCount.body.data.count).toBe(0);
  });

  it("marks a notification read, and never lets another user mark someone else's notification", async () => {
    const { user: owner, token: ownerToken } = await createUser({ role: "STUDENT" });
    const { token: otherToken } = await createUser({ role: "STUDENT" });

    // Trigger a real notification via the certificate-issuance flow rather than writing to the
    // Notification collection directly, so this stays an end-to-end check of the wiring.
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const course = await Course.create({
      name: "Course B",
      shortDescription: "...",
      duration: "1 month",
      fee: 100,
      status: "PUBLISHED",
    });
    const batch = await Batch.create({
      name: "Batch B",
      course: course._id,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      classDays: ["MON"],
      startTime: "09:00",
      endTime: "11:00",
      mode: "ONLINE",
      capacity: 10,
      status: "COMPLETED",
    });
    await Enrollment.create({ student: owner._id, batch: batch._id, course: course._id });

    // Certificates are only issued for a completed course, so give the course real content and
    // record the student as having completed it (a plain reading lesson with no practice/quiz/
    // coding stages — the same LessonProgress row the "mark complete" flow writes).
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });
    const topic = await Topic.create({ course: course._id, module: module._id, name: "Topic 1", order: 0 });
    const lesson = await Lesson.create({
      course: course._id,
      module: module._id,
      topic: topic._id,
      title: "Lesson 1",
      order: 0,
    });
    await LessonProgress.create({
      student: owner._id,
      lesson: lesson._id,
      topic: topic._id,
      module: module._id,
      course: course._id,
      completed: true,
      completedAt: new Date(),
    });

    const issued = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: owner._id.toString(), batch: batch._id.toString() });
    expect(issued.status).toBe(201);

    const list = await request(app).get("/api/v1/notifications").set(authHeader(ownerToken));
    expect(list.body.data).toHaveLength(1);
    const notificationId = list.body.data[0]._id;

    const forbidden = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set(authHeader(otherToken));
    expect(forbidden.status).toBe(404);

    const ok = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set(authHeader(ownerToken));
    expect(ok.status).toBe(200);
    expect(ok.body.data.read).toBe(true);
  });
});
