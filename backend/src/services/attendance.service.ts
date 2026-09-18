import mongoose, { FilterQuery } from "mongoose";
import { Attendance, IAttendance } from "../models/Attendance";
import { assertBatchAccess, listStudentBatchIds, listTrainerBatchIds } from "../utils/batchAccess";
import { recordAudit } from "./auditLog.service";
import { Role } from "../constants/enums";
import { ListAttendanceQuery, MarkAttendanceInput } from "../validators/attendance.validator";

function toDayStart(date: Date): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

export async function markAttendance(userId: string, role: Role, input: MarkAttendanceInput) {
  const batch = await assertBatchAccess(input.batch, userId, role);
  const day = toDayStart(input.date);

  const results = await Promise.all(
    input.records.map((record) =>
      Attendance.findOneAndUpdate(
        { student: record.student, batch: input.batch, date: day },
        {
          $set: {
            status: record.status,
            notes: record.notes,
            markedBy: userId,
            course: batch.course,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await recordAudit({
    userId,
    action: "ATTENDANCE_MARKED",
    entity: "Batch",
    entityId: input.batch,
    metadata: { date: day, count: input.records.length },
  });

  return results;
}

export async function listAttendance(userId: string, role: Role, query: ListAttendanceQuery) {
  const filter: FilterQuery<IAttendance> = {};

  if (query.batch) {
    await assertBatchAccess(query.batch, userId, role);
    filter.batch = query.batch;
  } else if (role === "TRAINER") {
    filter.batch = { $in: await listTrainerBatchIds(userId) };
  } else if (role === "STUDENT") {
    filter.batch = { $in: await listStudentBatchIds(userId) };
  }

  // Students can only ever see their own attendance — ignore any `student`
  // filter they pass and force it to themselves; other roles may filter freely.
  if (role === "STUDENT") filter.student = userId;
  else if (query.student) filter.student = query.student;

  if (query.date) filter.date = toDayStart(query.date);
  else if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = toDayStart(query.from);
    if (query.to) filter.date.$lte = toDayStart(query.to);
  }

  return Attendance.find(filter)
    .populate("student", "name email")
    .sort({ date: -1 })
    .lean();
}

export async function getAttendanceSummary(batchId: string, userId: string, role: Role) {
  await assertBatchAccess(batchId, userId, role);

  const summary = await Attendance.aggregate<{
    _id: unknown;
    total: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
  }>([
    { $match: { batch: new mongoose.Types.ObjectId(batchId) } },
    {
      $group: {
        _id: "$student",
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
        leave: { $sum: { $cond: [{ $eq: ["$status", "LEAVE"] }, 1, 0] } },
      },
    },
  ]);

  const rows = summary.map((s) => ({
    student: String(s._id),
    total: s.total,
    present: s.present,
    absent: s.absent,
    late: s.late,
    leave: s.leave,
    percentage: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
  }));

  // A student's own summary never includes classmates' rows.
  return role === "STUDENT" ? rows.filter((r) => r.student === userId) : rows;
}
