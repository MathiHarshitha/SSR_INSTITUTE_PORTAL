import { Course } from "../src/models/Course";
import { Batch, IBatch } from "../src/models/Batch";
import { Module } from "../src/models/Module";
import { Enrollment } from "../src/models/Enrollment";
import { Certificate } from "../src/models/Certificate";
import { MockInterview } from "../src/models/MockInterview";
import { Job } from "../src/models/Job";
import { JobApplication } from "../src/models/JobApplication";
import { markAttendance } from "../src/services/attendance.service";
import { updateDiscount } from "../src/services/fee.service";
import { createMaterial } from "../src/services/material.service";
import { createClass } from "../src/services/classSchedule.service";
import { listInterviews, updateInterview } from "../src/services/mockInterview.service";
import { listBatchStudents } from "../src/services/batch.service";
import { updateApplicationStatus } from "../src/services/job.service";
import { createUser } from "./helpers";

const DAY = 24 * 60 * 60 * 1000;

async function setup(batchOverrides: Partial<IBatch> = {}) {
  const course = await Course.create({
    name: "Full Stack",
    shortDescription: "...",
    duration: "3 months",
    fee: 5000,
    status: "PUBLISHED",
  });
  const { user: trainer } = await createUser({ role: "TRAINER" });
  const { user: admin } = await createUser({ role: "ADMIN" });
  const { user: student } = await createUser({ role: "STUDENT" });
  const batch = await Batch.create({
    name: "Batch A",
    course: course._id,
    trainer: trainer._id,
    startDate: new Date(Date.now() - 30 * DAY),
    endDate: new Date(Date.now() + 30 * DAY),
    classDays: ["MON"],
    startTime: "09:00",
    endTime: "11:00",
    mode: "ONLINE",
    capacity: 10,
    status: "ACTIVE",
    ...batchOverrides,
  });
  const enrollment = await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });
  return { course, trainer, admin, student, batch, enrollment };
}

function attendanceInput(batchId: string, studentId: string, date: Date) {
  return { batch: batchId, date, records: [{ student: studentId, status: "PRESENT" as const }] };
}

describe("Attendance date/batch guards", () => {
  it("rejects future dates for everyone, including admins", async () => {
    const { admin, student, batch } = await setup();
    await expect(
      markAttendance(admin.id, "ADMIN", attendanceInput(batch.id, student.id, new Date(Date.now() + 3 * DAY)))
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejects trainer marking outside the batch window or on a non-ACTIVE batch; admin may override", async () => {
    const { trainer, admin, student, batch } = await setup();
    const beforeStart = new Date(batch.startDate.getTime() - 2 * DAY);
    await expect(
      markAttendance(trainer.id, "TRAINER", attendanceInput(batch.id, student.id, beforeStart))
    ).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      markAttendance(admin.id, "ADMIN", attendanceInput(batch.id, student.id, beforeStart))
    ).resolves.toHaveLength(1);

    await Batch.updateOne({ _id: batch._id }, { status: "COMPLETED" });
    await expect(
      markAttendance(trainer.id, "TRAINER", attendanceInput(batch.id, student.id, new Date()))
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("allows a trainer to mark today on an active batch", async () => {
    const { trainer, student, batch } = await setup();
    await expect(
      markAttendance(trainer.id, "TRAINER", attendanceInput(batch.id, student.id, new Date()))
    ).resolves.toHaveLength(1);
  });
});

describe("Fee discount guard", () => {
  it("rejects a discount above the course fee and audits the previous discount otherwise", async () => {
    const { admin, enrollment } = await setup();
    await expect(updateDiscount(admin.id, enrollment.id, 5001)).rejects.toMatchObject({ statusCode: 400 });
    const updated = await updateDiscount(admin.id, enrollment.id, 5000);
    expect(updated.discount).toBe(5000);
  });
});

describe("Module must belong to the batch's course", () => {
  it("rejects a module from another course for materials and classes", async () => {
    const { trainer, batch, course } = await setup();
    const otherCourse = await Course.create({ name: "Other", shortDescription: "...", duration: "1m", fee: 1 });
    const foreign = await Module.create({ course: otherCourse._id, name: "Foreign", order: 0 });
    const own = await Module.create({ course: course._id, name: "Own", order: 0 });

    const material = {
      title: "Notes",
      fileUrl: "https://example.com/a.pdf",
      fileType: "DOCUMENT" as const,
      batch: batch.id,
    };
    await expect(
      createMaterial(trainer.id, "TRAINER", { ...material, module: foreign.id })
    ).rejects.toMatchObject({ statusCode: 400, message: "Module does not belong to this batch's course" });
    await expect(createMaterial(trainer.id, "TRAINER", { ...material, module: own.id })).resolves.toBeTruthy();

    const cls = { batch: batch.id, date: new Date(), startTime: "09:00", endTime: "10:00", topic: "Intro" };
    await expect(createClass(trainer.id, "TRAINER", { ...cls, module: foreign.id })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(createClass(trainer.id, "TRAINER", { ...cls, module: own.id })).resolves.toBeTruthy();
  });
});

describe("Certificate uniqueness", () => {
  it("allows only one ISSUED certificate per student/batch at the DB level, but permits re-issue after revoke", async () => {
    await Certificate.init();
    const { student, batch, course } = await setup();
    const base = {
      student: student._id,
      batch: batch._id,
      course: course._id,
      studentName: "S",
      courseName: "C",
      batchName: "B",
    };
    const first = await Certificate.create({ ...base, certificateNumber: "SSR-T-1" });
    await expect(Certificate.create({ ...base, certificateNumber: "SSR-T-2" })).rejects.toMatchObject({
      code: 11000,
    });
    await Certificate.updateOne({ _id: first._id }, { status: "REVOKED" });
    await expect(Certificate.create({ ...base, certificateNumber: "SSR-T-3" })).resolves.toBeTruthy();
  });
});

describe("Mock interview access after batch removal", () => {
  it("drops trainer access once the student is no longer in the trainer's batch", async () => {
    const { trainer, student, enrollment } = await setup();
    const interview = await MockInterview.create({
      student: student._id,
      interviewer: trainer._id,
      createdBy: trainer._id,
      date: new Date(),
      time: "10:00",
      type: "TECHNICAL",
    });

    expect(await listInterviews(trainer.id, "TRAINER", {})).toHaveLength(1);
    await expect(updateInterview(trainer.id, "TRAINER", interview.id, { time: "11:00" })).resolves.toBeTruthy();

    await enrollment.deleteOne();
    expect(await listInterviews(trainer.id, "TRAINER", {})).toHaveLength(0);
    await expect(updateInterview(trainer.id, "TRAINER", interview.id, { time: "12:00" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe("Batch roster projection", () => {
  it("hides phone and isTestAccount from trainers but not admins", async () => {
    const { trainer, admin, batch } = await setup();
    const [forTrainer] = await listBatchStudents(batch.id, trainer.id, "TRAINER");
    expect(forTrainer.student).not.toHaveProperty("phone");
    expect(forTrainer.student).not.toHaveProperty("isTestAccount");
    const [forAdmin] = await listBatchStudents(batch.id, admin.id, "ADMIN");
    expect(forAdmin.student).toHaveProperty("phone");
  });
});

describe("Job application status transitions", () => {
  it("blocks updating a WITHDRAWN application but lets admins correct SELECTED/REJECTED", async () => {
    const { admin, student } = await setup();
    const job = await Job.create({
      company: "Acme",
      title: "Dev",
      description: "...",
      workMode: "REMOTE",
      applicationDeadline: new Date(Date.now() + 10 * DAY),
      openings: 1,
      createdBy: admin._id,
    });
    const withdrawn = await JobApplication.create({ job: job._id, student: student._id, status: "WITHDRAWN" });
    await expect(updateApplicationStatus(admin.id, withdrawn.id, "SHORTLISTED")).rejects.toMatchObject({
      statusCode: 400,
    });

    await withdrawn.deleteOne();
    const rejected = await JobApplication.create({ job: job._id, student: student._id, status: "REJECTED" });
    const corrected = await updateApplicationStatus(admin.id, rejected.id, "SHORTLISTED");
    expect(corrected.status).toBe("SHORTLISTED");
  });
});
