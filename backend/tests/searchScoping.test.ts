import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";
import { Enrollment } from "../src/models/Enrollment";
import { createUser, authHeader } from "./helpers";

const app = createApp();

async function createCourse(name: string) {
  return Course.create({
    name,
    shortDescription: "...",
    duration: "3 months",
    fee: 1000,
    status: "PUBLISHED",
  });
}

async function seedFindableLesson(courseId: string, title: string) {
  const module = await Module.create({ course: courseId, name: `${title} module`, order: 0 });
  const topic = await Topic.create({ course: courseId, module: module._id, name: `${title} topic`, order: 0 });
  return Lesson.create({
    topic: topic._id,
    module: module._id,
    course: courseId,
    title,
    order: 0,
    whatIsIt: "...",
    whyItMatters: "...",
    analogy: "...",
    simpleExample: "...",
    published: true,
  });
}

describe("global search respects enrollment/authorization scoping", () => {
  it("only returns a student's enrolled-course lessons, never another course's", async () => {
    const enrolledCourse = await createCourse("Findable Enrolled Course");
    const otherCourse = await createCourse("Findable Other Course");
    const { user: trainer } = await createUser({ role: "TRAINER" });
    const batch = await Batch.create({
      name: "Batch A",
      course: enrolledCourse._id,
      trainer: trainer._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      classDays: ["MON"],
      startTime: "10:00",
      endTime: "12:00",
      mode: "ONLINE",
      capacity: 30,
    });

    await seedFindableLesson(enrolledCourse._id.toString(), "Zebraquery Closures Lesson");
    await seedFindableLesson(otherCourse._id.toString(), "Zebraquery Hoisting Lesson");

    const { user: student, token } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: student._id, batch: batch._id, course: enrolledCourse._id });

    const res = await request(app)
      .get("/api/v1/search")
      .query({ q: "Zebraquery" })
      .set(authHeader(token));

    expect(res.status).toBe(200);
    const lessonTitles = res.body.data.lessons.map((l: { title: string }) => l.title);
    expect(lessonTitles).toContain("Zebraquery Closures Lesson");
    expect(lessonTitles).not.toContain("Zebraquery Hoisting Lesson");
  });
});
