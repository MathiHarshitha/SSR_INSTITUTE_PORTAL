/**
 * Regression tests for: final-assessment retake cooldown / no score on fail (M4), evaluated
 * submissions being immutable (M5), and trainers not weakening course-wide completion
 * requirements (M6).
 */
import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";
import { Enrollment } from "../src/models/Enrollment";
import { LessonProgress } from "../src/models/LessonProgress";
import { FinalAssessment } from "../src/models/FinalAssessment";
import { FinalAssessmentAttempt } from "../src/models/FinalAssessmentAttempt";
import { Task } from "../src/models/Task";
import { Submission } from "../src/models/Submission";
import { AuditLog } from "../src/models/AuditLog";
import { createUser, authHeader } from "./helpers";

const app = createApp();

const QUESTIONS = [
  { question: "1+1?", options: ["1", "2"], correctIndex: 1, explanation: "two" },
  { question: "2+2?", options: ["4", "5"], correctIndex: 0, explanation: "four" },
  { question: "3+3?", options: ["5", "6"], correctIndex: 1, explanation: "six" },
];

async function setup() {
  const course = await Course.create({
    name: "Course",
    shortDescription: "...",
    duration: "3 months",
    fee: 1000,
    status: "PUBLISHED",
  });
  const { user: trainer, token: trainerToken } = await createUser({ role: "TRAINER" });
  const batch = await Batch.create({
    name: "Batch",
    course: course._id,
    trainer: trainer._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    classDays: ["MON"],
    startTime: "10:00",
    endTime: "12:00",
    mode: "ONLINE",
    capacity: 30,
  });
  const mod = await Module.create({ course: course._id, name: "Module 1", order: 0 });
  const topic = await Topic.create({ course: course._id, module: mod._id, name: "Topic 1", order: 0 });
  const lesson = await Lesson.create({ course: course._id, module: mod._id, topic: topic._id, title: "Lesson 1", order: 0 });
  const { user: admin, token: adminToken } = await createUser({ role: "ADMIN" });
  const { user: student, token } = await createUser({ role: "STUDENT" });
  await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });
  return { course, batch, lesson, trainer, trainerToken, admin, adminToken, student, token };
}

/** Answers the in-progress assessment, choosing correct answers when `correct` is true — the
 * question order is shuffled per attempt, so map by question text. */
async function answerAll(base: string, token: string, correct: boolean) {
  for (;;) {
    const state = await request(app).get(`${base}/state`).set(authHeader(token));
    if (state.body.data.done) break;
    const q = QUESTIONS.find((x) => x.question === state.body.data.question.question)!;
    const pick = correct ? q.correctIndex : 1 - q.correctIndex;
    await request(app).post(`${base}/answer`).set(authHeader(token)).send({ selectedIndex: pick }).expect(200);
  }
  return request(app).post(`${base}/submit`).set(authHeader(token));
}

describe("M4 — final assessment can't be brute-forced", () => {
  it("withholds the score on fail, enforces a retake cooldown, and counts attempts", async () => {
    const { course, lesson, admin, student, token } = await setup();
    await FinalAssessmentAttempt.init();
    await FinalAssessment.create({ course: course._id, questions: QUESTIONS, passingScore: 100, published: true, createdBy: admin._id });
    await request(app).post(`/api/v1/progress/lessons/${lesson._id}/complete`).set(authHeader(token)).expect(200);

    const base = `/api/v1/final-assessments/courses/${course._id}`;
    await request(app).post(`${base}/start`).set(authHeader(token)).expect(200);
    const failed = await answerAll(base, token, false);
    expect(failed.status).toBe(200);
    expect(failed.body.data.passed).toBe(false);
    expect(failed.body.data).not.toHaveProperty("score");
    expect(failed.body.data.results).toEqual([]);
    expect(failed.body.data.retryAvailableAt).toBeDefined();

    const state = await request(app).get(`${base}/state`).set(authHeader(token));
    expect(state.body.data.status).toBe("SUBMITTED");
    expect(state.body.data).not.toHaveProperty("score");
    expect(state.body.data.retryAvailableAt).toBeDefined();

    // Immediate retake is refused — including concurrent attempts to race past the check.
    const retakes = await Promise.all([1, 2, 3].map(() => request(app).post(`${base}/start`).set(authHeader(token))));
    for (const r of retakes) {
      expect(r.status).toBe(429);
      expect(r.body.message).toMatch(/retake the final assessment in \d+ minute/);
    }

    // Once the cooldown has elapsed a retake is allowed; concurrent starts only count once.
    await FinalAssessmentAttempt.updateOne(
      { student: student._id, course: course._id },
      { $set: { submittedAt: new Date(Date.now() - 61 * 60 * 1000) } }
    );
    const starts = await Promise.all([1, 2].map(() => request(app).post(`${base}/start`).set(authHeader(token))));
    for (const r of starts) expect(r.status).toBe(200);
    const attempt = await FinalAssessmentAttempt.findOne({ student: student._id, course: course._id }).lean();
    expect(attempt?.attemptCount).toBe(2);
    expect([...(attempt?.order ?? [])].sort()).toEqual([0, 1, 2]);

    const passed = await answerAll(base, token, true);
    expect(passed.body.data.passed).toBe(true);
    expect(passed.body.data.score).toBe(100);
    expect(passed.body.data.results).toHaveLength(3);

    const audits = await AuditLog.find({ user: student._id, action: /^FINAL_ASSESSMENT_/ }).lean();
    expect(audits.filter((a) => a.action === "FINAL_ASSESSMENT_STARTED")).toHaveLength(2);
    expect(audits.filter((a) => a.action === "FINAL_ASSESSMENT_SUBMITTED")).toHaveLength(2);
  });
});

describe("M5 — evaluated submissions are immutable", () => {
  it("refuses to overwrite a submission once it has been evaluated", async () => {
    const { course, batch, trainer, trainerToken, student, token } = await setup();
    await Submission.init();
    const task = await Task.create({
      title: "Assignment",
      type: "ASSIGNMENT",
      description: "do it",
      course: course._id,
      batch: batch._id,
      dueDate: new Date(Date.now() + 86400000),
      maxMarks: 10,
      createdBy: trainer._id,
      status: "PUBLISHED",
    });

    const first = await request(app)
      .post(`/api/v1/tasks/${task._id}/submit`)
      .set(authHeader(token))
      .send({ content: "v1" });
    expect(first.status).toBeLessThan(300);
    const resubmit = await request(app)
      .post(`/api/v1/tasks/${task._id}/submit`)
      .set(authHeader(token))
      .send({ content: "v2" });
    expect(resubmit.status).toBeLessThan(300);

    const submission = await Submission.findOne({ task: task._id, student: student._id }).lean();
    await request(app)
      .patch(`/api/v1/submissions/${submission!._id}/evaluate`)
      .set(authHeader(trainerToken))
      .send({ marks: 8 })
      .expect(200);

    const late = await request(app)
      .post(`/api/v1/tasks/${task._id}/submit`)
      .set(authHeader(token))
      .send({ content: "v3 after grading" });
    expect(late.status).toBe(409);
    expect(late.body.message).toMatch(/already been evaluated/);

    const after = await Submission.findOne({ task: task._id, student: student._id }).lean();
    expect(after?.status).toBe("EVALUATED");
    expect(after?.content).toBe("v2");
    expect(after?.marks).toBe(8);
  });
});

describe("M6 — trainers can't weaken completion requirements course-wide", () => {
  it("blocks a trainer from unpublishing or stripping stages of a lesson with progress", async () => {
    const { course, lesson, trainerToken, adminToken, student } = await setup();
    await Lesson.updateOne(
      { _id: lesson._id },
      { $set: { quiz: [QUESTIONS[0], QUESTIONS[1]], practice: { instructions: "do" } } }
    );

    // No progress yet → trainer may edit freely.
    expect(
      (await request(app).patch(`/api/v1/lessons/${lesson._id}`).set(authHeader(trainerToken)).send({ title: "Renamed" })).status
    ).toBe(200);

    await LessonProgress.create({ student: student._id, lesson: lesson._id, topic: lesson.topic, module: lesson.module, course: course._id });

    for (const body of [{ published: false }, { quiz: [QUESTIONS[0]] }, { quiz: [] }, { practice: null }]) {
      const res = await request(app).patch(`/api/v1/lessons/${lesson._id}`).set(authHeader(trainerToken)).send(body);
      expect(res.status).toBe(403);
    }
    // Non-weakening edits still work, and string "false" is no longer coerced to true.
    expect(
      (await request(app).patch(`/api/v1/lessons/${lesson._id}`).set(authHeader(trainerToken)).send({ title: "Again" })).status
    ).toBe(200);
    expect(
      (await request(app).patch(`/api/v1/lessons/${lesson._id}`).set(authHeader(trainerToken)).send({ published: "false" })).status
    ).toBe(422);

    // Admins are unaffected.
    expect(
      (await request(app).patch(`/api/v1/lessons/${lesson._id}`).set(authHeader(adminToken)).send({ published: false })).status
    ).toBe(200);
  });

  it("limits trainer edits to the final assessment", async () => {
    const { course, trainerToken, adminToken, student } = await setup();
    const url = `/api/v1/final-assessments/courses/${course._id}`;

    // A trainer may draft one (unpublished, default passing score)...
    expect((await request(app).post(url).set(authHeader(trainerToken)).send({ questions: QUESTIONS })).status).toBe(200);
    // ...but not publish it, or change the passing score.
    expect((await request(app).patch(url).set(authHeader(trainerToken)).send({ published: true })).status).toBe(403);
    expect((await request(app).patch(url).set(authHeader(trainerToken)).send({ passingScore: 10 })).status).toBe(403);
    // Re-sending unchanged values (as the editor form does) is fine.
    expect(
      (await request(app).post(url).set(authHeader(trainerToken)).send({ questions: QUESTIONS, published: false, passingScore: 60 })).status
    ).toBe(200);

    expect((await request(app).patch(url).set(authHeader(adminToken)).send({ published: true })).status).toBe(200);
    expect((await request(app).patch(url).set(authHeader(trainerToken)).send({ published: false })).status).toBe(403);

    // Questions are frozen for trainers once a student has an attempt.
    const assessment = await FinalAssessment.findOne({ course: course._id }).lean();
    await FinalAssessmentAttempt.create({ student: student._id, course: course._id, finalAssessment: assessment!._id });
    const edit = await request(app).patch(url).set(authHeader(trainerToken)).send({ questions: [QUESTIONS[0]] });
    expect(edit.status).toBe(403);
    expect(edit.body.message).toMatch(/already attempted/);
    expect((await request(app).patch(url).set(authHeader(adminToken)).send({ questions: [QUESTIONS[0]] })).status).toBe(200);
  });
});
