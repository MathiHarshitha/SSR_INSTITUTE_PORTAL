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

// Search is disabled (its route is commented out in src/routes/index.ts); re-enable these with it.
describe.skip("global search respects enrollment/authorization scoping", () => {
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

describe.skip("global search matching", () => {
  async function enrolledStudentFor(courseId: string) {
    const { user: trainer } = await createUser({ role: "TRAINER" });
    const batch = await Batch.create({
      name: "Batch M",
      course: courseId,
      trainer: trainer._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      classDays: ["MON"],
      startTime: "10:00",
      endTime: "12:00",
      mode: "ONLINE",
      capacity: 30,
    });
    const { user: student, token } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: student._id, batch: batch._id, course: courseId });
    return token;
  }

  it("matches partial words, case-insensitively, on course/module/topic/lesson names", async () => {
    const course = await createCourse("MERN Full Stack");
    const token = await enrolledStudentFor(course._id.toString());
    await seedFindableLesson(course._id.toString(), "JavaScript Closures");

    const courseRes = await request(app).get("/api/v1/search").query({ q: "mer" }).set(authHeader(token));
    expect(courseRes.status).toBe(200);
    expect(courseRes.body.data.courses.map((c: { name: string }) => c.name)).toContain("MERN Full Stack");

    const res = await request(app).get("/api/v1/search").query({ q: "clos" }).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.lessons.map((l: { title: string }) => l.title)).toContain("JavaScript Closures");
    expect(res.body.data.topics.map((t: { name: string }) => t.name)).toContain("JavaScript Closures topic");
    expect(res.body.data.modules.map((m: { name: string }) => m.name)).toContain("JavaScript Closures module");
  });

  it("lists the lessons inside a topic whose name matches", async () => {
    const course = await createCourse("Python Basics");
    const token = await enrolledStudentFor(course._id.toString());
    const module = await Module.create({ course: course._id, name: "Core Python", order: 0 });
    const topic = await Topic.create({ course: course._id, module: module._id, name: "Decorators", order: 0 });
    await Lesson.create({
      topic: topic._id,
      module: module._id,
      course: course._id,
      title: "Wrapping functions",
      order: 0,
      whatIsIt: "...",
      whyItMatters: "...",
      analogy: "...",
      simpleExample: "...",
      published: true,
    });

    const res = await request(app).get("/api/v1/search").query({ q: "decor" }).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.topics.map((t: { name: string }) => t.name)).toContain("Decorators");
    expect(res.body.data.lessons.map((l: { title: string }) => l.title)).toContain("Wrapping functions");
  });

  it("treats regex characters in the query literally", async () => {
    const course = await createCourse("C++ Programming");
    const token = await enrolledStudentFor(course._id.toString());

    const res = await request(app).get("/api/v1/search").query({ q: "c++" }).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.courses.map((c: { name: string }) => c.name)).toContain("C++ Programming");
  });
});
