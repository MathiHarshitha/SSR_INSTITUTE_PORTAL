import request from "supertest";
import { Types } from "mongoose";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Enrollment } from "../src/models/Enrollment";
import { Payment } from "../src/models/Payment";
import { User } from "../src/models/User";
import { createUser, authHeader } from "./helpers";

const app = createApp();

/** One batch with: a real student, a test student (student1-style), and an enrollment left behind
 * by a student that was deleted from the DB. Each has a payment. */
async function setup(capacity = 2) {
  const admin = await createUser({ role: "ADMIN" });
  const trainer = await createUser({ role: "TRAINER" });
  const course = await Course.create({ name: "MERN", shortDescription: "...", duration: "6 months", fee: 10000, status: "PUBLISHED" });
  const batch = await Batch.create({
    name: "MERN B1", course: course._id, trainer: trainer.user._id, startDate: new Date(),
    endDate: new Date(Date.now() + 864e5 * 30), classDays: ["MON"], startTime: "10:00", endTime: "12:00", mode: "ONLINE", capacity,
  });
  const real = await createUser({ role: "STUDENT", name: "Real Student" });
  const test = await createUser({ role: "STUDENT", name: "Student 1" });
  await User.updateOne({ _id: test.user._id }, { $set: { isTestAccount: true } });
  const deletedStudentId = new Types.ObjectId();

  for (const student of [real.user._id, test.user._id, deletedStudentId]) {
    await Enrollment.create({ student, batch: batch._id, course: course._id });
    await Payment.create({
      student, batch: batch._id, course: course._id, amount: 1000, paymentMethod: "CASH",
      receiptNumber: `RCPT-${student}`, recordedBy: admin.user._id,
    });
  }
  return { admin, trainer, course, batch, real, test };
}

describe("Test accounts and deleted students are left out of counts and fee totals", () => {
  it("batch enrolled count, dashboard stats and reports only count real, existing students", async () => {
    const { admin, trainer, batch } = await setup();

    const batches = await request(app).get("/api/v1/batches").set(authHeader(admin.token));
    expect(batches.body.data.find((b: { _id: string }) => b._id === String(batch._id)).enrolledCount).toBe(1);

    const stats = await request(app).get("/api/v1/users/stats").set(authHeader(admin.token));
    expect(stats.body.data.students.total).toBe(1);

    const report = await request(app).get("/api/v1/reports/overview").set(authHeader(admin.token));
    expect(report.body.data.summary).toMatchObject({ totalStudents: 1, revenueCollectedTotal: 1000, totalRevenuePending: 9000 });
    expect(report.body.data.enrollmentsByCourse[0].enrolledCount).toBe(1);
    expect(report.body.data.feeCollectionByBatch[0]).toMatchObject({ collected: 1000, pending: 9000 });

    const trainerDash = await request(app).get("/api/v1/dashboard/trainer").set(authHeader(trainer.token));
    expect(trainerDash.body.data.totalStudents).toBe(1);
  });

  it("lists still work with leftover enrollments, and the test student is flagged rather than hidden", async () => {
    const { admin, batch } = await setup();

    const fees = await request(app).get(`/api/v1/fees/status?batch=${batch._id}`).set(authHeader(admin.token));
    expect(fees.status).toBe(200);
    expect(fees.body.data).toHaveLength(2); // deleted student's enrollment is skipped
    const testRow = fees.body.data.find((r: { student: { name: string } }) => r.student.name === "Student 1");
    expect(testRow.student.isTestAccount).toBe(true);

    const roster = await request(app).get(`/api/v1/batches/${batch._id}/students`).set(authHeader(admin.token));
    expect(roster.status).toBe(200);
    expect(roster.body.data).toHaveLength(2);
    expect(roster.body.data.every((e: { student: unknown }) => e.student)).toBe(true);
  });

  it("test accounts and deleted students don't use up batch capacity", async () => {
    const { admin, batch } = await setup(2);
    // Capacity 2: only the real student counts, so one more real student fits…
    const second = await createUser({ role: "STUDENT" });
    const ok = await request(app)
      .post(`/api/v1/batches/${batch._id}/students`)
      .set(authHeader(admin.token))
      .send({ studentId: String(second.user._id) });
    expect(ok.status).toBe(201);
    // …and now it's full for real students.
    const third = await createUser({ role: "STUDENT" });
    const full = await request(app)
      .post(`/api/v1/batches/${batch._id}/students`)
      .set(authHeader(admin.token))
      .send({ studentId: String(third.user._id) });
    expect(full.status).toBe(400);
    // A test account can still be added to a full batch.
    const tester = await createUser({ role: "STUDENT" });
    await User.updateOne({ _id: tester.user._id }, { $set: { isTestAccount: true } });
    const testerEnroll = await request(app)
      .post(`/api/v1/batches/${batch._id}/students`)
      .set(authHeader(admin.token))
      .send({ studentId: String(tester.user._id) });
    expect(testerEnroll.status).toBe(201);
  });
});
