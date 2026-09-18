import { FilterQuery, Types } from "mongoose";
import { Payment, IPayment } from "../models/Payment";
import { Enrollment } from "../models/Enrollment";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import {
  ListFeeStatusQuery,
  ListPaymentsQuery,
  RecordPaymentInput,
} from "../validators/fee.validator";

type PaymentStatus = "PAID" | "PARTIALLY_PAID" | "PENDING";

function generateReceiptNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCPT-${stamp}-${rand}`;
}

function computeStatus(amountDue: number, finalFee: number): PaymentStatus {
  if (amountDue <= 0) return "PAID";
  if (amountDue < finalFee) return "PARTIALLY_PAID";
  return "PENDING";
}

export async function recordPayment(adminId: string, input: RecordPaymentInput) {
  const enrollment = await Enrollment.findOne({ student: input.student, batch: input.batch });
  if (!enrollment) {
    throw ApiError.badRequest("This student is not enrolled in the selected batch");
  }

  const payment = await Payment.create({
    student: input.student,
    batch: input.batch,
    course: enrollment.course,
    amount: input.amount,
    paymentDate: input.paymentDate ?? new Date(),
    paymentMethod: input.paymentMethod,
    transactionRef: input.transactionRef,
    notes: input.notes,
    receiptNumber: generateReceiptNumber(),
    recordedBy: adminId,
  });

  await recordAudit({
    userId: adminId,
    action: "PAYMENT_RECORDED",
    entity: "Payment",
    entityId: payment._id,
    metadata: { student: input.student, batch: input.batch, amount: input.amount },
  });

  return payment;
}

export async function listPayments(query: ListPaymentsQuery) {
  const filter: FilterQuery<IPayment> = {};
  if (query.batch) filter.batch = query.batch;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };

  let paymentsQuery = Payment.find(filter)
    .populate("student", "name email")
    .populate("batch", "name")
    .populate("course", "name")
    .sort(sort);

  if (query.search) {
    // Search touches populated fields (student name / receipt number), so filter after populate.
    const all = await paymentsQuery.lean();
    const regex = new RegExp(query.search, "i");
    const filtered = all.filter(
      (p) =>
        regex.test(p.receiptNumber) ||
        regex.test((p.student as unknown as { name: string })?.name ?? "")
    );
    const total = filtered.length;
    const page = filtered.slice(skip, skip + query.limit);
    return { payments: page, total };
  }

  const [payments, total] = await Promise.all([
    paymentsQuery.skip(skip).limit(query.limit).lean(),
    Payment.countDocuments(filter),
  ]);
  return { payments, total };
}

export async function listFeeStatus(query: ListFeeStatusQuery) {
  const filter: FilterQuery<Record<string, unknown>> = {};
  if (query.batch) filter.batch = query.batch;

  const enrollments = await Enrollment.find(filter)
    .populate("student", "name email")
    .populate("course", "name fee")
    .populate("batch", "name")
    .sort({ enrolledAt: -1 })
    .lean();

  const paidTotals = await Payment.aggregate<{ _id: Types.ObjectId; total: number }>([
    {
      $match: {
        student: { $in: enrollments.map((e) => e.student._id ?? e.student) },
        batch: { $in: enrollments.map((e) => e.batch._id ?? e.batch) },
      },
    },
    { $group: { _id: { student: "$student", batch: "$batch" }, total: { $sum: "$amount" } } },
  ]);

  const paidMap = new Map<string, number>();
  for (const row of paidTotals as unknown as { _id: { student: Types.ObjectId; batch: Types.ObjectId }; total: number }[]) {
    paidMap.set(`${row._id.student}:${row._id.batch}`, row.total);
  }

  let rows = enrollments.map((e) => {
    const course = e.course as unknown as { fee: number };
    const studentId = (e.student as unknown as { _id: Types.ObjectId })._id ?? e.student;
    const batchId = (e.batch as unknown as { _id: Types.ObjectId })._id ?? e.batch;
    const finalFee = Math.max(0, course.fee - (e.discount ?? 0));
    const amountPaid = paidMap.get(`${studentId}:${batchId}`) ?? 0;
    const amountDue = Math.max(0, finalFee - amountPaid);
    const status = computeStatus(amountDue, finalFee);

    return {
      enrollmentId: e._id,
      student: e.student,
      batch: e.batch,
      course: e.course,
      discount: e.discount ?? 0,
      finalFee,
      amountPaid,
      amountDue,
      status,
    };
  });

  if (query.status) {
    rows = rows.filter((r) => r.status === query.status);
  }
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    rows = rows.filter((r) => regex.test((r.student as unknown as { name: string }).name ?? ""));
  }

  const total = rows.length;
  const skip = (query.page - 1) * query.limit;
  const page = rows.slice(skip, skip + query.limit);

  return { rows: page, total };
}

export async function getPaymentHistory(studentId: string, batchId: string) {
  return Payment.find({ student: studentId, batch: batchId })
    .sort({ paymentDate: -1 })
    .populate("recordedBy", "name")
    .lean();
}

export async function updateDiscount(adminId: string, enrollmentId: string, discount: number) {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw ApiError.notFound("Enrollment not found");

  enrollment.discount = discount;
  await enrollment.save();

  await recordAudit({
    userId: adminId,
    action: "FEE_DISCOUNT_UPDATED",
    entity: "Enrollment",
    entityId: enrollment._id,
    metadata: { discount },
  });

  return enrollment;
}
