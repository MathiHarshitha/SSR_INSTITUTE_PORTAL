import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Module } from "../src/models/Module";
import { Topic } from "../src/models/Topic";
import { Lesson } from "../src/models/Lesson";
import { Enrollment } from "../src/models/Enrollment";
import { createSession } from "../src/services/session.service";
import { createUser, authHeader } from "./helpers";

const app = createApp();

async function createCourse(name = "Data Science") {
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

async function buildCurriculum(courseId: string) {
  const module = await Module.create({ course: courseId, name: "Module 1", order: 0 });
  const topic = await Topic.create({ course: courseId, module: module._id, name: "Topic 1", order: 0 });
  const lesson1 = await Lesson.create({
    topic: topic._id,
    module: module._id,
    course: courseId,
    title: "Lesson 1",
    order: 0,
    whatIsIt: "...",
    whyItMatters: "...",
    analogy: "...",
    simpleExample: "...",
    practice: { instructions: "Do a thing" },
    quiz: [
      {
        question: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        explanation: "Basic arithmetic.",
      },
    ],
  });
  const lesson2 = await Lesson.create({
    topic: topic._id,
    module: module._id,
    course: courseId,
    title: "Lesson 2",
    order: 1,
    whatIsIt: "...",
    whyItMatters: "...",
    analogy: "...",
    simpleExample: "...",
  });
  return { module, topic, lesson1, lesson2 };
}

describe("full student journey: enroll -> curriculum -> lesson -> practice -> quiz -> complete -> progress -> continue learning", () => {
  it("walks the entire path and only exposes enrolled-course data", async () => {
    const enrolledCourse = await createCourse("Data Science");
    const otherCourse = await createCourse("Digital Marketing");
    const { user: trainer } = await createUser({ role: "TRAINER" });
    const batch = await createBatch(trainer._id.toString(), enrolledCourse._id.toString());
    const { lesson1, lesson2 } = await buildCurriculum(enrolledCourse._id.toString());
    await buildCurriculum(otherCourse._id.toString());

    const { user: student, token } = await createUser({ role: "STUDENT" });
    await Enrollment.create({ student: student._id, batch: batch._id, course: enrolledCourse._id });

    // Dashboard: only the enrolled course shows up, never the other one.
    const enrollmentsRes = await request(app).get("/api/v1/enrollments/me").set(authHeader(token));
    expect(enrollmentsRes.status).toBe(200);
    expect(enrollmentsRes.body.data).toHaveLength(1);
    expect(enrollmentsRes.body.data[0].course._id).toBe(enrolledCourse._id.toString());
    expect(enrollmentsRes.body.data[0].overallProgress).toBe(0);

    // Course -> Module -> Topic -> Lesson progress tree, freshly computed (no hardcoded %).
    const progressRes = await request(app)
      .get(`/api/v1/progress/courses/${enrolledCourse._id.toString()}`)
      .set(authHeader(token));
    expect(progressRes.status).toBe(200);
    expect(progressRes.body.data.overallProgress).toBe(0);
    expect(progressRes.body.data.modules).toHaveLength(1);
    expect(progressRes.body.data.modules[0].topics).toHaveLength(1);
    expect(progressRes.body.data.modules[0].topics[0].lessons).toHaveLength(2);

    // Direct API access to the course the student is NOT enrolled in must be rejected.
    const forbiddenProgress = await request(app)
      .get(`/api/v1/progress/courses/${otherCourse._id.toString()}`)
      .set(authHeader(token));
    expect(forbiddenProgress.status).toBe(403);

    // Lesson content: practice instructions visible, quiz question visible, answer key hidden.
    const lessonRes = await request(app)
      .get(`/api/v1/lessons/${lesson1._id.toString()}`)
      .set(authHeader(token));
    expect(lessonRes.status).toBe(200);
    expect(lessonRes.body.data.practice.instructions).toBe("Do a thing");
    expect(lessonRes.body.data.quiz[0].question).toBe("2 + 2 = ?");
    expect(lessonRes.body.data.quiz[0]).not.toHaveProperty("correctIndex");
    expect(lessonRes.body.data.quiz[0]).not.toHaveProperty("explanation");
    expect(lessonRes.body.data.completed).toBe(false);
    expect(lessonRes.body.data.quizAttempts).toBe(0);

    // Quiz can't even be started until the practice stage is done (Lesson -> Practice ->
    // Quiz -> Coding order).
    const earlyQuizStart = await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/start`)
      .set(authHeader(token));
    expect(earlyQuizStart.status).toBe(403);

    const practiceComplete = await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/practice/complete`)
      .set(authHeader(token));
    expect(practiceComplete.status).toBe(200);

    // Quiz: wrong answer -> 0%, no completion, attempt recorded. Session-based: start ->
    // answer -> submit, never a bulk client-supplied answers array.
    await request(app).post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/start`).set(authHeader(token));
    await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/answer`)
      .set(authHeader(token))
      .send({ selectedIndex: 0 });
    const wrongSubmit = await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/submit`)
      .set(authHeader(token));
    expect(wrongSubmit.status).toBe(200);
    expect(wrongSubmit.body.data.score).toBe(0);
    // A failed attempt must not reveal the answer key, or the retake is a guaranteed pass.
    expect(wrongSubmit.body.data.passed).toBe(false);
    expect(wrongSubmit.body.data.results).toEqual([]);
    expect(wrongSubmit.body.data.reviewAvailable).toBe(false);
    expect(JSON.stringify(wrongSubmit.body)).not.toContain("correctIndex");

    // Quiz: correct answer -> 100%, best score updates, attempts accumulate (never trusting
    // a client-sent score — the server recomputes from the DB's answer key every time).
    await request(app).post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/start`).set(authHeader(token));
    await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/answer`)
      .set(authHeader(token))
      .send({ selectedIndex: 1 });
    const correctSubmit = await request(app)
      .post(`/api/v1/lessons/${lesson1._id.toString()}/quiz/submit`)
      .set(authHeader(token));
    expect(correctSubmit.status).toBe(200);
    expect(correctSubmit.body.data.score).toBe(100);
    expect(correctSubmit.body.data.bestScore).toBe(100);
    expect(correctSubmit.body.data.passed).toBe(true);
    // Once passed, the full review (answer key + explanations) is shown.
    expect(correctSubmit.body.data.reviewAvailable).toBe(true);
    expect(correctSubmit.body.data.results[0].explanation).toBe("Basic arithmetic.");
    // Lesson had no coding question, so passing the quiz (its last required stage) auto-completes it.
    expect(correctSubmit.body.data.lessonCompleted).toBe(true);

    const afterQuizLesson = await request(app)
      .get(`/api/v1/lessons/${lesson1._id.toString()}`)
      .set(authHeader(token));
    expect(afterQuizLesson.body.data.quizAttempts).toBe(2);
    expect(afterQuizLesson.body.data.quizBestScore).toBe(100);

    // Continue Learning: opening a lesson records it as last-visited.
    const visitRes = await request(app)
      .patch("/api/v1/enrollments/last-visited")
      .set(authHeader(token))
      .send({ courseId: enrolledCourse._id.toString(), lessonId: lesson1._id.toString() });
    expect(visitRes.status).toBe(200);

    // Mark complete -> module/topic/course progress all recompute from real activity.
    const completeRes = await request(app)
      .post(`/api/v1/progress/lessons/${lesson1._id.toString()}/complete`)
      .set(authHeader(token));
    expect(completeRes.status).toBe(200);

    const progressAfterComplete = await request(app)
      .get(`/api/v1/progress/courses/${enrolledCourse._id.toString()}`)
      .set(authHeader(token));
    expect(progressAfterComplete.body.data.overallProgress).toBe(50); // 1 of 2 lessons
    expect(progressAfterComplete.body.data.modules[0].topics[0].progress).toBe(50);
    expect(progressAfterComplete.body.data.modules[0].topics[0].completedLessons).toBe(1);

    // "Continue learning" survives a simulated logout/login: re-fetching /enrollments/me
    // with a freshly issued token (as a new login would produce) still reports the same
    // last-visited lesson and the updated progress — nothing was cached to the old session.
    const { accessToken: freshToken } = await createSession(student);
    const dashboardAfterRelogin = await request(app)
      .get("/api/v1/enrollments/me")
      .set(authHeader(freshToken));
    expect(dashboardAfterRelogin.status).toBe(200);
    expect(dashboardAfterRelogin.body.data[0].lastVisitedLesson._id).toBe(lesson1._id.toString());
    expect(dashboardAfterRelogin.body.data[0].overallProgress).toBe(50);

    // Moving to the next lesson and completing it brings the course to 100%.
    await request(app)
      .post(`/api/v1/progress/lessons/${lesson2._id.toString()}/complete`)
      .set(authHeader(token));
    const finalProgress = await request(app)
      .get(`/api/v1/progress/courses/${enrolledCourse._id.toString()}`)
      .set(authHeader(token));
    expect(finalProgress.body.data.overallProgress).toBe(100);
  });
});
