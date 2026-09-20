import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";
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

/** Two trainers, each assigned (via a Batch) to exactly one of two different courses — mirrors
 * a real institute where Trainer A teaches MERN and Trainer B teaches Digital Marketing.
 * Every mutation/read a trainer can perform on curriculum must be scoped to their own course,
 * enforced server-side (assertCourseContentAccess), never just hidden in the frontend. */
describe("trainer authorization matrix: two trainers, two disjoint course assignments", () => {
  async function setup() {
    const courseA = await createCourse("MERN Full Stack Test");
    const courseB = await createCourse("Digital Marketing Test");

    const { user: trainerA, token: tokenA } = await createUser({ role: "TRAINER" });
    const { user: trainerB, token: tokenB } = await createUser({ role: "TRAINER" });
    await createBatch(trainerA._id.toString(), courseA._id.toString());
    await createBatch(trainerB._id.toString(), courseB._id.toString());

    const moduleA = await Module.create({ course: courseA._id, name: "Module A", order: 0 });
    const topicA = await Topic.create({ course: courseA._id, module: moduleA._id, name: "Topic A", order: 0 });
    const lessonA = await Lesson.create({
      topic: topicA._id,
      module: moduleA._id,
      course: courseA._id,
      title: "Lesson A",
      order: 0,
      whatIsIt: "...",
      whyItMatters: "...",
      analogy: "...",
      simpleExample: "...",
    });

    return { courseA, courseB, tokenA, tokenB, moduleA, topicA, lessonA };
  }

  it("lets a trainer fully author their own assigned course", async () => {
    const { courseA, tokenA } = await setup();

    const createModule = await request(app)
      .post(`/api/v1/courses/${courseA._id.toString()}/modules`)
      .set(authHeader(tokenA))
      .send({ name: "New Module" });
    expect(createModule.status).toBe(201);

    const createTopic = await request(app)
      .post(`/api/v1/modules/${createModule.body.data._id}/topics`)
      .set(authHeader(tokenA))
      .send({ name: "New Topic" });
    expect(createTopic.status).toBe(201);

    const createLesson = await request(app)
      .post(`/api/v1/topics/${createTopic.body.data._id}/lessons`)
      .set(authHeader(tokenA))
      .send({
        title: "New Lesson",
        whatIsIt: "...",
        whyItMatters: "...",
        analogy: "...",
        simpleExample: "...",
      });
    expect(createLesson.status).toBe(201);
  });

  it("blocks Trainer A from reading Trainer B's course curriculum", async () => {
    const { courseB, tokenA } = await setup();

    const res = await request(app)
      .get(`/api/v1/courses/${courseB._id.toString()}/modules`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(403);
  });

  it("blocks Trainer A from creating a module under Trainer B's course", async () => {
    const { courseB, tokenA } = await setup();

    const res = await request(app)
      .post(`/api/v1/courses/${courseB._id.toString()}/modules`)
      .set(authHeader(tokenA))
      .send({ name: "Hostile Module" });
    expect(res.status).toBe(403);
  });

  it("blocks Trainer A from modifying/deleting Trainer B's module", async () => {
    const { courseB, tokenA } = await setup();
    const moduleB = await Module.create({ course: courseB._id, name: "Module B", order: 0 });

    const updateRes = await request(app)
      .patch(`/api/v1/modules/${moduleB._id.toString()}`)
      .set(authHeader(tokenA))
      .send({ name: "Hijacked" });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/v1/modules/${moduleB._id.toString()}`)
      .set(authHeader(tokenA));
    expect(deleteRes.status).toBe(403);
  });

  it("blocks Trainer A from creating/modifying/deleting a Topic under Trainer B's module", async () => {
    const { courseB, tokenA } = await setup();
    const moduleB = await Module.create({ course: courseB._id, name: "Module B", order: 0 });
    const topicB = await Topic.create({ course: courseB._id, module: moduleB._id, name: "Topic B", order: 0 });

    const createRes = await request(app)
      .post(`/api/v1/modules/${moduleB._id.toString()}/topics`)
      .set(authHeader(tokenA))
      .send({ name: "Hostile Topic" });
    expect(createRes.status).toBe(403);

    const updateRes = await request(app)
      .patch(`/api/v1/topics/${topicB._id.toString()}`)
      .set(authHeader(tokenA))
      .send({ name: "Hijacked" });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/v1/topics/${topicB._id.toString()}`)
      .set(authHeader(tokenA));
    expect(deleteRes.status).toBe(403);

    const reorderRes = await request(app)
      .patch(`/api/v1/modules/${moduleB._id.toString()}/topics/reorder`)
      .set(authHeader(tokenA))
      .send({ orderedIds: [topicB._id.toString()] });
    expect(reorderRes.status).toBe(403);
  });

  it("blocks Trainer A from creating/modifying/deleting/reordering a Lesson under Trainer B's topic", async () => {
    const { courseB, tokenA } = await setup();
    const moduleB = await Module.create({ course: courseB._id, name: "Module B", order: 0 });
    const topicB = await Topic.create({ course: courseB._id, module: moduleB._id, name: "Topic B", order: 0 });
    const lessonB = await Lesson.create({
      topic: topicB._id,
      module: moduleB._id,
      course: courseB._id,
      title: "Lesson B",
      order: 0,
      whatIsIt: "...",
      whyItMatters: "...",
      analogy: "...",
      simpleExample: "...",
    });

    const createRes = await request(app)
      .post(`/api/v1/topics/${topicB._id.toString()}/lessons`)
      .set(authHeader(tokenA))
      .send({ title: "Hostile Lesson", whatIsIt: "...", whyItMatters: "...", analogy: "...", simpleExample: "..." });
    expect(createRes.status).toBe(403);

    const updateRes = await request(app)
      .patch(`/api/v1/lessons/${lessonB._id.toString()}`)
      .set(authHeader(tokenA))
      .send({ title: "Hijacked" });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/v1/lessons/${lessonB._id.toString()}`)
      .set(authHeader(tokenA));
    expect(deleteRes.status).toBe(403);

    const reorderRes = await request(app)
      .patch(`/api/v1/topics/${topicB._id.toString()}/lessons/reorder`)
      .set(authHeader(tokenA))
      .send({ orderedIds: [lessonB._id.toString()] });
    expect(reorderRes.status).toBe(403);
  });

  it("blocks Trainer A from viewing a student's progress in Trainer B's course", async () => {
    const { courseB, tokenA } = await setup();
    const { user: student } = await createUser({ role: "STUDENT" });

    const res = await request(app)
      .get(`/api/v1/progress/students/${student._id.toString()}/courses/${courseB._id.toString()}`)
      .set(authHeader(tokenA));
    expect(res.status).toBe(403);
  });

  it("still lets Trainer A operate on their own course after all the cross-course attempts above", async () => {
    const { moduleA, topicA, lessonA, tokenA } = await setup();

    const updateRes = await request(app)
      .patch(`/api/v1/lessons/${lessonA._id.toString()}`)
      .set(authHeader(tokenA))
      .send({ title: "Updated Lesson A" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe("Updated Lesson A");

    const reorderTopics = await request(app)
      .patch(`/api/v1/modules/${moduleA._id.toString()}/topics/reorder`)
      .set(authHeader(tokenA))
      .send({ orderedIds: [topicA._id.toString()] });
    expect(reorderTopics.status).toBe(200);
  });
});
