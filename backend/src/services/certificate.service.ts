import crypto from "crypto";
import { FilterQuery } from "mongoose";
import { Certificate, ICertificate } from "../models/Certificate";
import { Batch } from "../models/Batch";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import { IssueCertificateInput, ListCertificatesQuery } from "../validators/certificate.validator";

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SSR-${year}-${random}`;
}

export async function issueCertificate(adminId: string, input: IssueCertificateInput) {
  const batch = await Batch.findById(input.batch).lean();
  if (!batch) throw ApiError.notFound("Batch not found");
  if (batch.status !== "COMPLETED") {
    throw ApiError.badRequest("Certificates can only be issued for completed batches");
  }

  const enrollment = await Enrollment.findOne({ student: input.student, batch: input.batch }).lean();
  if (!enrollment) throw ApiError.badRequest("This student is not enrolled in the selected batch");

  const existing = await Certificate.findOne({
    student: input.student,
    batch: input.batch,
    status: "ISSUED",
  }).lean();
  if (existing) throw ApiError.conflict("An active certificate already exists for this student and batch");

  const [student, course] = await Promise.all([
    User.findById(input.student).select("name").lean(),
    Course.findById(batch.course).select("name").lean(),
  ]);
  if (!student) throw ApiError.notFound("Student not found");

  let certificate: ICertificate | null = null;
  for (let attempt = 0; attempt < 5 && !certificate; attempt++) {
    try {
      certificate = await Certificate.create({
        certificateNumber: generateCertificateNumber(),
        student: input.student,
        batch: input.batch,
        course: batch.course,
        studentName: student.name,
        courseName: course?.name ?? "Unknown course",
        batchName: batch.name,
        issuedBy: adminId,
      });
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  if (!certificate) throw ApiError.internal("Could not generate a unique certificate number, try again");

  await recordAudit({
    userId: adminId,
    action: "CERTIFICATE_ISSUED",
    entity: "Certificate",
    entityId: certificate._id,
    metadata: { student: input.student, batch: input.batch },
  });

  return certificate;
}

export async function listCertificatesAdmin(query: ListCertificatesQuery) {
  const filter: FilterQuery<ICertificate> = {};
  if (query.status) filter.status = query.status;
  if (query.batch) filter.batch = query.batch;
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ studentName: regex }, { certificateNumber: regex }];
  }

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  const [certificates, total] = await Promise.all([
    Certificate.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Certificate.countDocuments(filter),
  ]);

  return { certificates, total };
}

export async function getCertificateById(id: string) {
  const certificate = await Certificate.findById(id).lean();
  if (!certificate) throw ApiError.notFound("Certificate not found");
  return certificate;
}

export async function revokeCertificate(adminId: string, id: string, reason?: string) {
  const certificate = await Certificate.findById(id);
  if (!certificate) throw ApiError.notFound("Certificate not found");
  if (certificate.status === "REVOKED") throw ApiError.badRequest("Certificate is already revoked");

  certificate.status = "REVOKED";
  certificate.revokedReason = reason;
  certificate.revokedAt = new Date();
  await certificate.save();

  await recordAudit({
    userId: adminId,
    action: "CERTIFICATE_REVOKED",
    entity: "Certificate",
    entityId: certificate._id,
    metadata: { reason },
  });

  return certificate;
}

export async function listMyCertificates(studentId: string) {
  return Certificate.find({ student: studentId }).sort({ issueDate: -1 }).lean();
}

export async function verifyCertificate(certificateNumber: string) {
  const certificate = await Certificate.findOne({ certificateNumber })
    .select("certificateNumber studentName courseName batchName issueDate status")
    .lean();
  if (!certificate) throw ApiError.notFound("No certificate found with this ID");
  return certificate;
}
