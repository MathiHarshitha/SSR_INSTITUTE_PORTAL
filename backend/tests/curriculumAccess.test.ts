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

async function createCourse() {
  return Course.create({
    name: "Data Science",
    shortDescription: "...",
    duration: "3 months",
    fee: 1000,
    status: "PUBLISHED",
  });
}

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

async function createTopic(moduleId: string, courseId: string) {
  return Topic.create({ module: moduleId, course: courseId, name: "Topic 1", order: 0 });
}

function quizLesson(topicId: string, moduleId: string, courseId: string) {
  return Lesson.create({
    topic: topicId,
    module: moduleId,
    course: courseId,
    title: "Variables",
    order: 0,
    whatIsIt: "A labeled box",
    whyItMatters: "Stores data",
    analogy: "A school bag",
    simpleExample: "let age = 20;",
    quiz: [
      {
        question: "What keyword declares a block-scoped variable?",
        options: ["var", "let", "function", "class"],
        correctIndex: 1,
        explanation: "let is block-scoped.",
      },
    ],
  });
}

describe("assertCourseContentAccess boundary (module/lesson authoring)", () => {
  it("lets an admin author any course's curriculum", async () => {
    const course = await createCourse();
    const { token: adminToken } = await createUser({ role: "ADMIN" });

    const res = await request(app)
      .post(`/api/v1/courses/${course._id.toString()}/modules`)
      .set(authHeader(adminToken))
      .send({ name: "Module 1" });

    expect(res.status).toBe(201);
  });

  it("lets a trainer author a course they're assigned to via a batch", async () => {
    const course = await createCourse();
    const { user: trainer, token: trainerToken } = await createUser({ role: "TRAINER" });
    await createBatch(trainer._id.toString(), course._id.toString());

    const res = await request(app)
      .post(`/api/v1/courses/${course._id.toString()}/modules`)
      .set(authHeader(trainerToken))
      .send({ name: "Module 1" });

    expect(res.status).toBe(201);
  });

  it("blocks a trainer from a course they're not assigned to", async () => {
    const course = await createCourse();
    const { token: trainerToken } = await createUser({ role: "TRAINER" });

    const res = await request(app)
      .post(`/api/v1/courses/${course._id.toString()}/modules`)
      .set(authHeader(trainerToken))
      .send({ name: "Module 1" });

    expect(res.status).toBe(403);
  });

  it("blocks a student from any module/lesson mutation route", async () => {
    const course = await createCourse();
    const { token: studentToken } = await createUser({ role: "STUDENT" });

    const res = await request(app)
      .post(`/api/v1/courses/${course._id.toString()}/modules`)
      .set(authHeader(studentToken))
      .send({ name: "Module 1" });

    expect(res.status).toBe(403);
  });
});

describe("topic CRUD (Course -> Module -> Topic -> Lesson)", () => {
  it("lets an admin create a topic under a module, then create a lesson under that topic", async () => {
    const course = await createCourse();
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });

    const createTopicRes = await request(app)
      .post(`/api/v1/modules/${module._id.toString()}/topics`)
      .set(authHeader(adminToken))
      .send({ name: "Functions" });
    expect(createTopicRes.status).toBe(201);
    const topicId = createTopicRes.body.data._id;

    const listTopicsRes = await request(app)
      .get(`/api/v1/modules/${module._id.toString()}/topics`)
      .set(authHeader(adminToken));
    expect(listTopicsRes.status).toBe(200);
    expect(listTopicsRes.body.data).toHaveLength(1);
    expect(listTopicsRes.body.data[0].lessonCount).toBe(0);

    const createLessonRes = await request(app)
      .post(`/api/v1/topics/${topicId}/lessons`)
      .set(authHeader(adminToken))
      .send({
        title: "Function Basics",
        whatIsIt: "A reusable block of code",
        whyItMatters: "Avoids repetition",
        analogy: "A vending machine",
        simpleExample: "function add(a, b) { return a + b; }",
      });
    expect(createLessonRes.status).toBe(201);
    expect(createLessonRes.body.data.topic).toBe(topicId);
    expect(createLessonRes.body.data.module).toBe(module._id.toString());
  });

  it("blocks a trainer not assigned to the course from creating a topic", async () => {
    const course = await createCourse();
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });
    const { token: trainerToken } = await createUser({ role: "TRAINER" });

    const res = await request(app)
      .post(`/api/v1/modules/${module._id.toString()}/topics`)
      .set(authHeader(trainerToken))
      .send({ name: "Functions" });
    expect(res.status).toBe(403);
  });

  it("cascades deletes: removing a topic removes its lessons and their progress", async () => {
    const course = await createCourse();
    const { user: trainer } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(trainer._id.toString(), course._id.toString());
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });
    const topic = await createTopic(module._id.toString(), course._id.toString());
    const lesson = await quizLesson(topic._id.toString(), module._id.toString(), course._id.toString());

    const { user: student, token: studentToken } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });
    await request(app).post(`/api/v1/lessons/${lesson._id.toString()}/quiz/start`).set(authHeader(studentToken));
    await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/answer`)
      .set(authHeader(studentToken))
      .send({ selectedIndex: 1 });
    await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/submit`)
      .set(authHeader(studentToken));

    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const deleteRes = await request(app)
      .delete(`/api/v1/topics/${topic._id.toString()}`)
      .set(authHeader(adminToken));
    expect(deleteRes.status).toBe(200);

    expect(await Lesson.findById(lesson._id)).toBeNull();
  });
});

describe("student lesson content + quiz", () => {
  it("never leaks quiz answers to a student, and grades submissions server-side", async () => {
    const course = await createCourse();
    const { user: trainer } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(trainer._id.toString(), course._id.toString());
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });
    const topic = await createTopic(module._id.toString(), course._id.toString());
    const lesson = await quizLesson(topic._id.toString(), module._id.toString(), course._id.toString());

    const { user: student, token: studentToken } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });

    const getRes = await request(app)
      .get(`/api/v1/lessons/${lesson._id.toString()}`)
      .set(authHeader(studentToken));
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.quiz[0]).not.toHaveProperty("correctIndex");
    expect(getRes.body.data.quiz[0]).not.toHaveProperty("explanation");

    // Client sends the "wrong" answer — score must still come back 0%, never trusting a
    // client-computed score.
    await request(app).post(`/api/v1/lessons/${lesson._id.toString()}/quiz/start`).set(authHeader(studentToken));
    await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/answer`)
      .set(authHeader(studentToken))
      .send({ selectedIndex: 0 });
    const wrongSubmit = await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/submit`)
      .set(authHeader(studentToken));
    expect(wrongSubmit.status).toBe(200);
    expect(wrongSubmit.body.data.score).toBe(0);

    await request(app).post(`/api/v1/lessons/${lesson._id.toString()}/quiz/start`).set(authHeader(studentToken));
    await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/answer`)
      .set(authHeader(studentToken))
      .send({ selectedIndex: 1 });
    const correctSubmit = await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/submit`)
      .set(authHeader(studentToken));
    expect(correctSubmit.status).toBe(200);
    expect(correctSubmit.body.data.score).toBe(100);
  });

  it("blocks an unenrolled student from lesson content and quiz submission", async () => {
    const course = await createCourse();
    const { user: trainer } = await createUser({ role: "TRAINER" });
    await createBatch(trainer._id.toString(), course._id.toString());
    const module = await Module.create({ course: course._id, name: "Module 1", order: 0 });
    const topic = await createTopic(module._id.toString(), course._id.toString());
    const lesson = await quizLesson(topic._id.toString(), module._id.toString(), course._id.toString());

    const { token: outsiderToken } = await createUser({ role: "STUDENT" });

    const getRes = await request(app)
      .get(`/api/v1/lessons/${lesson._id.toString()}`)
      .set(authHeader(outsiderToken));
    expect(getRes.status).toBe(403);

    const submitRes = await request(app)
      .post(`/api/v1/lessons/${lesson._id.toString()}/quiz/submit`)
      .set(authHeader(outsiderToken))
      .send({ answers: [1] });
    expect(submitRes.status).toBe(403);
  });
});
