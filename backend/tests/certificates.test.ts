import request from "supertest";
import { createApp } from "../src/app";
import { Course } from "../src/models/Course";
import { Batch } from "../src/models/Batch";
import { Enrollment } from "../src/models/Enrollment";
import { createUser, authHeader } from "./helpers";

const app = createApp();

async function createCourseAndBatch(status: "UPCOMING" | "COMPLETED") {
  const course = await Course.create({
    name: "Digital Marketing",
    shortDescription: "...",
    duration: "2 months",
    fee: 5000,
    status: "PUBLISHED",
  });
  const batch = await Batch.create({
    name: "Batch X",
    course: course._id,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    classDays: ["MON"],
    startTime: "09:00",
    endTime: "11:00",
    mode: "ONLINE",
    capacity: 10,
    status,
  });
  return { course, batch };
}

describe("Certificates", () => {
  it("rejects issuing a certificate for a batch that isn't COMPLETED", async () => {
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const { user: student } = await createUser({ role: "STUDENT" });
    const { batch, course } = await createCourseAndBatch("UPCOMING");
    await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });

    const res = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });

    expect(res.status).toBe(400);
  });

  it("rejects issuing a certificate for a student who isn't enrolled in the batch", async () => {
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const { user: student } = await createUser({ role: "STUDENT" });
    const { batch } = await createCourseAndBatch("COMPLETED");

    const res = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });

    expect(res.status).toBe(400);
  });

  it("issues a certificate, rejects a duplicate, and revokes it", async () => {
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const { user: student } = await createUser({ role: "STUDENT" });
    const { batch, course } = await createCourseAndBatch("COMPLETED");
    await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });

    const issued = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });
    expect(issued.status).toBe(201);
    expect(issued.body.data.status).toBe("ISSUED");
    const certificateId = issued.body.data._id;
    const certificateNumber = issued.body.data.certificateNumber;

    const duplicate = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });
    expect(duplicate.status).toBe(409);

    const verified = await request(app).get(`/api/v1/certificates/verify/${certificateNumber}`);
    expect(verified.status).toBe(200);
    expect(verified.body.data.status).toBe("ISSUED");
    expect(verified.body.data.studentName).toBe(student.name);

    const revoked = await request(app)
      .patch(`/api/v1/certificates/${certificateId}/revoke`)
      .set(authHeader(adminToken))
      .send({ reason: "test" });
    expect(revoked.status).toBe(200);
    expect(revoked.body.data.status).toBe("REVOKED");

    const verifiedAfterRevoke = await request(app).get(
      `/api/v1/certificates/verify/${certificateNumber}`
    );
    expect(verifiedAfterRevoke.status).toBe(200);
    expect(verifiedAfterRevoke.body.data.status).toBe("REVOKED");
  });

  it("returns 404 (not a crash) when verifying an unknown certificate number", async () => {
    const res = await request(app).get("/api/v1/certificates/verify/SSR-0000-NOPE");
    expect(res.status).toBe(404);
  });

  it("only allows ADMIN to issue, and the owning student (not another) to see it via /my", async () => {
    const { token: trainerToken } = await createUser({ role: "TRAINER" });
    const { user: student, token: studentToken } = await createUser({ role: "STUDENT" });
    const { token: otherStudentToken } = await createUser({ role: "STUDENT" });
    const { token: adminToken } = await createUser({ role: "ADMIN" });
    const { batch, course } = await createCourseAndBatch("COMPLETED");
    await Enrollment.create({ student: student._id, batch: batch._id, course: course._id });

    const trainerAttempt = await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(trainerToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });
    expect(trainerAttempt.status).toBe(403);

    await request(app)
      .post("/api/v1/certificates")
      .set(authHeader(adminToken))
      .send({ student: student._id.toString(), batch: batch._id.toString() });

    const ownList = await request(app).get("/api/v1/certificates/my").set(authHeader(studentToken));
    expect(ownList.status).toBe(200);
    expect(ownList.body.data).toHaveLength(1);

    const otherList = await request(app)
      .get("/api/v1/certificates/my")
      .set(authHeader(otherStudentToken));
    expect(otherList.status).toBe(200);
    expect(otherList.body.data).toHaveLength(0);
  });
});
